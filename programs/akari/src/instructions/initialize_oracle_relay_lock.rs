use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeOracleRelayLock<'info> {
    #[account(
        init,
        payer = authority,
        space = OracleRelayLock::INIT_SPACE,
        seeds = [b"oracle_relay_lock"],
        bump
    )]
    pub oracle_relay_lock: Account<'info, OracleRelayLock>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<InitializeOracleRelayLock>) -> Result<()> {
    let lock = &mut ctx.accounts.oracle_relay_lock;
    lock.holder = ctx.accounts.authority.key();
    lock.acquired_at = 0;
    lock.ttl = 60;
    lock.renewal_count = 0;
    lock.version = 1;
    lock.bump = ctx.bumps.oracle_relay_lock;
    Ok(())
}
