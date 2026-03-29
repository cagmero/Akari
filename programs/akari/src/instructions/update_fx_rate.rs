use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::events::*;

#[derive(Accounts)]
#[instruction(currency_pair: [u8; 8])]
pub struct UpdateFxRate<'info> {
    pub pool_vault: Account<'info, PoolVault>,
    
    #[account(
        init_if_needed,
        payer = signer,
        space = SixPriceFeed::INIT_SPACE,
        seeds = [b"six_price_feed", currency_pair.as_ref()],
        bump
    )]
    pub six_price_feed: Account<'info, SixPriceFeed>,
    
    pub oracle_relay_lock: Account<'info, OracleRelayLock>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, UpdateFxRate<'info>>,
    currency_pair: [u8; 8],
    bid: i64,
    ask: i64,
    published_at: i64,
) -> Result<()> {
    require!(
        ctx.accounts.signer.key() == ctx.accounts.pool_vault.oracle_authority,
        AkariError::InvalidOracleAuthority
    );

    let lock = &ctx.accounts.oracle_relay_lock;
    let clock = Clock::get()?;
    require!(
        lock.holder == ctx.accounts.signer.key()
            && clock.unix_timestamp - lock.acquired_at < lock.ttl,
        AkariError::RelayLockNotHeld
    );

    let feed = &mut ctx.accounts.six_price_feed;
    feed.currency_pair = currency_pair;
    feed.bid = bid;
    feed.ask = ask;
    feed.mid = (bid + ask) / 2;
    feed.spread_bps = (((ask - bid) as u128 * 10_000) / feed.mid.unsigned_abs() as u128) as u16;
    feed.published_at = published_at;
    feed.submitted_at = clock.unix_timestamp;
    feed.oracle_authority = ctx.accounts.signer.key();
    
    if feed.version == 0 {
        feed.version = 1;
        feed.bump = ctx.bumps.six_price_feed;
    }

    emit!(OracleUpdateEvent {
        currency_pair,
        bid,
        ask,
        mid: feed.mid,
        spread_bps: feed.spread_bps,
        oracle_source: 0,
        published_at,
        submitted_at: clock.unix_timestamp,
    });
    Ok(())
}
