use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::events::*;

#[derive(Accounts)]
pub struct AcquireRelayLock<'info> {
    #[account(mut)]
    pub oracle_relay_lock: Account<'info, OracleRelayLock>,
    
    #[account(mut)]
    pub caller: Signer<'info>,
}

pub fn handle(ctx: Context<AcquireRelayLock>) -> Result<()> {
    let lock = &mut ctx.accounts.oracle_relay_lock;
    let clock = Clock::get()?;
    let caller = ctx.accounts.caller.key();

    let lock_expired = clock.unix_timestamp - lock.acquired_at >= lock.ttl;
    let caller_holds = lock.holder == caller;

    require!(
        lock_expired || caller_holds,
        AkariError::RelayLockHeldByAnother
    );

    lock.holder = caller;
    lock.acquired_at = clock.unix_timestamp;
    lock.renewal_count += 1;

    emit!(RelayLockEvent {
        action: 0, // 0 = acquired
        holder: caller,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
