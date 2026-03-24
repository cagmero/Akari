use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::events::*;
use jupiter_cpi;

#[derive(Accounts)]
#[instruction(from_currency: u8, to_currency: u8)]
pub struct FxSwap<'info> {
    #[account(mut, address = subsidiary_account.owner @ AkariError::Unauthorized)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub subsidiary_account: Account<'info, SubsidiaryAccount>,

    #[account(mut)]
    pub pool_vault: Account<'info, PoolVault>,

    #[account(
        mut,
        seeds = [b"epoch_state", get_pair_bytes(from_currency, to_currency).as_ref()],
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
    ix_data: Vec<u8>,
) -> Result<()> {
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

    // Directional pricing
    let feed = &ctx.accounts.six_price_feed;
    let is_stale = clock.unix_timestamp - feed.published_at > 90;
    require!(!is_stale, AkariError::OracleStale);

    let oracle_price: u128 = if from_is_usdc {
        feed.ask.unsigned_abs() as u128 // Buying EURC -> ask price
    } else {
        feed.bid.unsigned_abs() as u128 // Selling EURC -> bid price
    };

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
        
        let ix = solana_program::instruction::Instruction {
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

        solana_program::program::invoke_signed(
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
        oracle_source: 0,
        liquidity_source,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

fn get_pair_bytes(from: u8, to: u8) -> [u8; 8] {
    if from == 0 && to == 1 {
        // USDC to EURC
        *b"EUR_USDP"
    } else {
        // CHF defaults to EUR for layout
        *b"CHF_USDP"
    }
}
