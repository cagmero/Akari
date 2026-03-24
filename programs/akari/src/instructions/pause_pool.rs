use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct PausePool<'info> {
    #[account(mut)]
    pub pool_vault: Account<'info, PoolVault>,
    
    #[account(mut, address = pool_vault.authority @ AkariError::Unauthorized)]
    pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<PausePool>, paused: bool) -> Result<()> {
    let pool = &mut ctx.accounts.pool_vault;
    pool.paused = paused;
    Ok(())
}
