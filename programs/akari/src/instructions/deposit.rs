use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked};
use crate::state::*;
use crate::errors::*;
use crate::events::*;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub subsidiary_account: Account<'info, SubsidiaryAccount>,
    
    #[account(mut)]
    pub pool_vault: Account<'info, PoolVault>,
    
    #[account(mut)]
    pub subsidiary_ata: InterfaceAccount<'info, TokenAccount>,
    
    #[account(mut)]
    pub pool_ata: InterfaceAccount<'info, TokenAccount>,
    
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(mut, address = subsidiary_account.owner @ AkariError::Unauthorized)]
    pub owner: Signer<'info>,
    
    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handle<'info>(ctx: Context<'_, '_, '_, 'info, Deposit<'info>>, amount: u64, currency: u8) -> Result<()> {
    ctx.accounts.pool_vault.maybe_migrate()?;
    ctx.accounts.subsidiary_account.maybe_migrate()?;

    require!(!ctx.accounts.pool_vault.paused, AkariError::PoolPaused);
    require!(!ctx.accounts.subsidiary_account.flagged, AkariError::FlaggedWallet);
    
    // Check daily limit (USDC equivalent omitted for simplicity in stub)
    let clock = Clock::get()?;
    let day = clock.unix_timestamp / 86400;
    
    if ctx.accounts.subsidiary_account.last_transfer_day < day {
        ctx.accounts.subsidiary_account.daily_transfer_total = 0;
        ctx.accounts.subsidiary_account.last_transfer_day = day;
    }
    
    let sub = &mut ctx.accounts.subsidiary_account;
    if sub.daily_transfer_total.checked_add(amount).unwrap() > ctx.accounts.pool_vault.daily_limit_usdc {
        return err!(AkariError::DailyLimitExceeded);
    }
    sub.daily_transfer_total += amount;

    // SPL Token-2022 Transfer (this naturally triggers the transfer hook)
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.subsidiary_ata.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.pool_ata.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    
    // Remaining accounts must be passed for the Transfer Hook to resolve!
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let mut cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    cpi_ctx.remaining_accounts = ctx.remaining_accounts.to_vec();
    transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;
    
    // Update notional balances
    let pool = &mut ctx.accounts.pool_vault;
    if currency == 0 {
        sub.usdc_balance += amount;
        pool.total_usdc += amount;
    } else {
        sub.eurc_balance += amount;
        pool.total_eurc += amount;
    }

    emit!(TransferEvent {
        from: ctx.accounts.owner.key(),
        to: pool.key(),
        amount,
        currency,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
