use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct FlagWallet<'info> {
    #[account(mut)]
    pub subsidiary_account: Account<'info, SubsidiaryAccount>,
    
    pub pool_vault: Account<'info, PoolVault>,
    
    #[account(mut, address = pool_vault.authority @ AkariError::Unauthorized)]
    pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<FlagWallet>, flagged: bool) -> Result<()> {
    let sub = &mut ctx.accounts.subsidiary_account;
    sub.flagged = flagged;
    Ok(())
}
