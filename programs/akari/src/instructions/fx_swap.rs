use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::events::*;

#[derive(Accounts)]
#[instruction(from_currency: u8, to_currency: u8, in_amount: u64, currency_pair: [u8; 8])]
pub struct FxSwap<'info> {
    #[account(mut, address = subsidiary_account.owner @ AkariError::Unauthorized)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub subsidiary_account: Account<'info, SubsidiaryAccount>,

    #[account(mut)]
    pub pool_vault: Account<'info, PoolVault>,

    #[account(
        mut,
        seeds = [b"epoch_state", currency_pair.as_ref()],
        bump = epoch_state.bump,
    )]
    pub epoch_state: Account<'info, EpochState>,

    pub six_price_feed: Account<'info, SixPriceFeed>,
    
    // Remaining accounts are passed and used internally for:
    // 1. Pyth Network fallback if SIX is stale (optional fallback logic omitted in stub).
    // 2. Jupiter CPI remaining accounts when internal liquidity is insufficient.
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, FxSwap<'info>>,
    from_currency: u8,
    to_currency: u8,
    in_amount: u64,
    currency_pair: [u8; 8],
    ix_data: Vec<u8>,
) -> Result<()> {
    ctx.accounts.pool_vault.maybe_migrate()?;
    ctx.accounts.subsidiary_account.maybe_migrate()?;
    ctx.accounts.epoch_state.maybe_migrate()?;

    require!(!ctx.accounts.pool_vault.paused, AkariError::PoolPaused);
    require!(!ctx.accounts.subsidiary_account.flagged, AkariError::FlaggedWallet);

    let from_is_usdc = from_currency == 0;
    
    // Check balance
    let sub = &mut ctx.accounts.subsidiary_account;
    if from_is_usdc {
        require!(sub.usdc_balance >= in_amount, AkariError::InsufficientLiquidity);
    } else {
        require!(sub.eurc_balance >= in_amount, AkariError::InsufficientLiquidity);
    }

    // Epoch auto-reset logic
    let clock = Clock::get()?;
    let state = &mut ctx.accounts.epoch_state;
    if clock.unix_timestamp - state.epoch_start >= state.epoch_duration {
        state.epoch_start = clock.unix_timestamp;
        state.epoch_accumulated_slippage = 0;
        state.total_swaps_this_epoch = 0;
        state.vault_nav_snapshot_usdc = ctx.accounts.pool_vault.total_usdc;
    }

    // Directional pricing with Pyth fallback
    let feed = &ctx.accounts.six_price_feed;
    let mut oracle_source = 0; // 0 = SIX, 1 = Pyth
    let mut oracle_price: u128 = 0;

    let six_stale = clock.unix_timestamp - feed.submitted_at > 90;

    if !six_stale {
        // SIX is fresh, use directional price
        oracle_price = if from_is_usdc {
            feed.ask.unsigned_abs() as u128 // Buying EURC -> ask price
        } else {
            feed.bid.unsigned_abs() as u128 // Selling EURC -> bid price
        };
    } else {
        // SIX is stale, check Pyth fallback
        require!(!ctx.remaining_accounts.is_empty(), AkariError::OracleStale);
        
        let pyth_account_info = &ctx.remaining_accounts[0];
        let data = pyth_account_info.data.borrow();
        
        // Pyth PriceAccount is at least 3312 bytes
        require!(data.len() >= 240, AkariError::OracleStale);
        
        // Magic 0xa1b2c3d4
        let magic = u32::from_le_bytes(data[0..4].try_into().unwrap());
        require!(magic == 0xa1b2c3d4, AkariError::OracleStale);
        
        // Type 3 (Price)
        let acc_type = u32::from_le_bytes(data[8..12].try_into().unwrap());
        require!(acc_type == 3, AkariError::OracleStale);
        
        let expo = i32::from_le_bytes(data[20..24].try_into().unwrap());
        let price_val = i64::from_le_bytes(data[208..216].try_into().unwrap());
        let conf = u64::from_le_bytes(data[216..224].try_into().unwrap());
        let publish_time = i64::from_le_bytes(data[232..240].try_into().unwrap());
        
        // Staleness < 60s
        require!(clock.unix_timestamp - publish_time < 60, AkariError::OracleStale);
        
        let price = price_val.unsigned_abs();
        
        // Confidence < 2% of price
        require!(conf < price / 50, AkariError::OracleStale);
        
        // Scale to 10^6 to match expected logic
        if expo < -6 {
            oracle_price = (price as u128) / 10u128.pow((-expo - 6) as u32);
        } else {
            oracle_price = (price as u128) * 10u128.pow((expo + 6) as u32);
        }
        
        oracle_source = 1;
    }

    // Note: Assuming price is scaled by 10^6
    let expected_output: u64 = if from_is_usdc {
        // USDC -> EURC
        ((in_amount as u128 * 1_000_000u128) / oracle_price) as u64
    } else {
        // EURC -> USDC
        ((in_amount as u128 * oracle_price) / 1_000_000u128) as u64
    };

    let max_slippage = ctx.accounts.pool_vault.max_slippage_bps;
    let min_received = (expected_output as u128 * (10_000 - max_slippage as u128) / 10_000) as u64;

    // Epoch budget check
    let epoch_budget = (state.max_epoch_slippage_bps as u128)
        * (state.vault_nav_snapshot_usdc as u128)
        / 10_000u128;
    
    let slippage_amount: u64 = expected_output.saturating_sub(min_received);
    require!(
        (state.epoch_accumulated_slippage as u128) + (slippage_amount as u128) <= epoch_budget,
        AkariError::EpochSlippageBudgetExhausted
    );

    // Liquidity check & Execution route
    let pool = &mut ctx.accounts.pool_vault;
    let internal_available = if from_is_usdc { pool.total_eurc } else { pool.total_usdc };

    let mut liquidity_source = 0; // 0 = Internal
    
    if expected_output > internal_available {
        // Route to Jupiter for external execution
        liquidity_source = 1;
        
        let jupiter_program = ctx.remaining_accounts[0].clone();
        
        let mut account_metas = Vec::new();
        for account in ctx.remaining_accounts.iter() {
            account_metas.push(if account.is_writable {
                AccountMeta::new(account.key(), account.is_signer)
            } else {
                AccountMeta::new_readonly(account.key(), account.is_signer)
            });
        }
        
        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: jupiter_program.key(),
            accounts: account_metas,
            data: ix_data,
        };

        let pool_vault_bump = ctx.accounts.pool_vault.bump;
        let seeds = &[
            b"pool_vault".as_ref(),
            &[pool_vault_bump],
        ];
        let signer = &[&seeds[..]];

        anchor_lang::solana_program::program::invoke_signed(
            &ix,
            ctx.remaining_accounts,
            signer,
        )?;

        // Adjust notional out for the simulation
        if from_is_usdc {
            sub.usdc_balance -= in_amount;
            sub.eurc_balance += expected_output;
        } else {
            sub.eurc_balance -= in_amount;
            sub.usdc_balance += expected_output;
        }
    } else {
        if from_is_usdc {
            sub.usdc_balance -= in_amount;
            sub.eurc_balance += expected_output;
        } else {
            sub.eurc_balance -= in_amount;
            sub.usdc_balance += expected_output;
        }
    }

    state.epoch_accumulated_slippage += slippage_amount;
    state.total_swaps_this_epoch += 1;

    emit!(FxSwapEvent {
        subsidiary: ctx.accounts.subsidiary_account.key(),
        from_currency,
        to_currency,
        in_amount,
        expected_out_amount: expected_output,
        actual_out_amount: expected_output,
        spread_bps: feed.spread_bps,
        oracle_source,
        liquidity_source,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}


