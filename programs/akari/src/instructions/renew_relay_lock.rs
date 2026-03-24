use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::events::*;

#[derive(Accounts)]
pub struct RenewRelayLock<'info> {
    #[account(mut)]
    pub oracle_relay_lock: Account<'info, OracleRelayLock>,
    
    #[account(mut)]
    pub caller: Signer<'info>,
}

pub fn handle(ctx: Context<RenewRelayLock>) -> Result<()> {
    let lock = &mut ctx.accounts.oracle_relay_lock;
    let clock = Clock::get()?;
    
    require!(
        lock.holder == ctx.accounts.caller.key(),
        AkariError::RelayLockNotHeld
    );
    
    lock.acquired_at = clock.unix_timestamp; // Reset TTL
    lock.renewal_count += 1;

    emit!(RelayLockEvent {
        action: 1, // 1 = renewed
        holder: ctx.accounts.caller.key(),
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
