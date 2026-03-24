use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = PoolVault::INIT_SPACE,
        seeds = [b"pool_vault"],
        bump
    )]
    pub pool_vault: Account<'info, PoolVault>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handle(
    ctx: Context<InitializePool>,
    oracle_authority: Pubkey,
    travel_rule_threshold: u64,
    daily_limit_usdc: u64,
    max_slippage_bps: u16,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool_vault;
    pool.authority = ctx.accounts.authority.key();
    pool.oracle_authority = oracle_authority;
    pool.travel_rule_threshold = travel_rule_threshold;
    pool.daily_limit_usdc = daily_limit_usdc;
    pool.max_slippage_bps = max_slippage_bps;
    pool.total_usdc = 0;
    pool.total_eurc = 0;
    pool.paused = false;
    pool.version = 1;
    pool.bump = ctx.bumps.pool_vault;
    Ok(())
}
