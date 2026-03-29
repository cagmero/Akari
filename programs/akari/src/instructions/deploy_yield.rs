use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::events::*;

#[derive(Accounts)]
#[instruction(currency: u8, venue: [u8; 16])]
pub struct DeployYield<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = YieldPosition::INIT_SPACE,
        seeds = [b"yield_position".as_ref(), &[currency], venue.as_ref()],
        bump
    )]
    pub yield_position: Account<'info, YieldPosition>,
    
    #[account(mut)]
    pub pool_vault: Account<'info, PoolVault>,
    
    #[account(mut, address = pool_vault.authority @ AkariError::Unauthorized)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    
    // Remaining accounts passed dynamically by frontend Kamino SDK
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, DeployYield<'info>>,
    currency: u8,
    venue: [u8; 16],
    amount: u64,
    ix_data: Vec<u8>,
) -> Result<()> {
    // Idle balance check
    let pool = &ctx.accounts.pool_vault;
    let pool_total = if currency == 0 { pool.total_usdc } else { pool.total_eurc };
    
    // Conservative estimate: can deploy up to 10% of total pool value for hackathon MVP
    let idle_balance = pool_total / 10;
    require!(amount <= idle_balance, AkariError::InsufficientIdleBalance);

    let position = &mut ctx.accounts.yield_position;
    position.currency = currency;
    position.venue = venue;
    position.deposited_amount += amount;
    position.last_harvest_at = Clock::get()?.unix_timestamp;
    
    if position.version == 0 {
        position.version = 1;
        position.bump = ctx.bumps.yield_position;
    }

    // Un-mocked direct execution using client-derived instruction data (Kamino SDK)
    if !ctx.remaining_accounts.is_empty() && !ix_data.is_empty() {
        let kamino_program = ctx.remaining_accounts[0].clone();
        
        // Build Instruction
        let mut account_metas = Vec::new();
        for account in ctx.remaining_accounts.iter() {
            account_metas.push(if account.is_writable {
                AccountMeta::new(account.key(), account.is_signer)
            } else {
                AccountMeta::new_readonly(account.key(), account.is_signer)
            });
        }
        
        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: kamino_program.key(),
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
    }

    emit!(YieldDeployedEvent {
        currency,
        venue,
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
