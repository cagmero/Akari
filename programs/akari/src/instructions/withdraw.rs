use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked};
use crate::state::*;
use crate::errors::*;
use crate::events::*;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub subsidiary_account: Account<'info, SubsidiaryAccount>,
    
    #[account(mut, seeds = [b"pool_vault"], bump = pool_vault.bump)]
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

pub fn handle<'info>(ctx: Context<'_, '_, '_, 'info, Withdraw<'info>>, amount: u64, currency: u8) -> Result<()> {
    ctx.accounts.pool_vault.maybe_migrate()?;
    ctx.accounts.subsidiary_account.maybe_migrate()?;

    require!(!ctx.accounts.pool_vault.paused, AkariError::PoolPaused);
    require!(!ctx.accounts.subsidiary_account.flagged, AkariError::FlaggedWallet);
    
    // Check daily limit
    let clock = Clock::get()?;
    let day = clock.unix_timestamp / 86400;
    
    let sub = &mut ctx.accounts.subsidiary_account;
    if sub.last_transfer_day < day {
        sub.daily_transfer_total = 0;
        sub.last_transfer_day = day;
    }
    
    if sub.daily_transfer_total.checked_add(amount).unwrap() > ctx.accounts.pool_vault.daily_limit_usdc {
        return err!(AkariError::DailyLimitExceeded);
    }
    
    // Check balance
    if currency == 0 {
        require!(sub.usdc_balance >= amount, AkariError::InsufficientLiquidity);
        sub.usdc_balance -= amount;
        ctx.accounts.pool_vault.total_usdc -= amount;
    } else {
        require!(sub.eurc_balance >= amount, AkariError::InsufficientLiquidity);
        sub.eurc_balance -= amount;
        ctx.accounts.pool_vault.total_eurc -= amount;
    }
    sub.daily_transfer_total += amount;

    // Proceed to SPL transfer
    let seeds = &[
        b"pool_vault".as_ref(),
        &[ctx.accounts.pool_vault.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.pool_ata.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.subsidiary_ata.to_account_info(),
        authority: ctx.accounts.pool_vault.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let mut cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    cpi_ctx.remaining_accounts = ctx.remaining_accounts.to_vec();
    transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;

    emit!(TransferEvent {
        from: ctx.accounts.pool_vault.key(),
        to: ctx.accounts.owner.key(),
        amount,
        currency,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
