use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct UpdateOracleAuthority<'info> {
    #[account(
        mut,
        seeds = [b"pool_vault"],
        bump = pool_vault.bump,
        has_one = authority @ AkariError::Unauthorized,
    )]
    pub pool_vault: Account<'info, PoolVault>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<UpdateOracleAuthority>, new_oracle_authority: Pubkey) -> Result<()> {
    let pool = &mut ctx.accounts.pool_vault;
    pool.oracle_authority = new_oracle_authority;
    msg!(
        "OracleAuthority updated to {}",
        new_oracle_authority
    );
    Ok(())
}
