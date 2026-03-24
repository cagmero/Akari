use anchor_lang::prelude::*;

#[account]
pub struct SixPriceFeed {
    pub currency_pair: [u8; 8],
    pub bid: i64,                    // Bid price * 10^6
    pub ask: i64,                    // Ask price * 10^6
    pub mid: i64,                    // Mid price * 10^6
    pub spread_bps: u16,             // (ask - bid) / mid * 10_000
    pub published_at: i64,           // SIX data timestamp
    pub submitted_at: i64,           // Solana clock timestamp of submission
    pub oracle_authority: Pubkey,
    pub version: u8,
    pub bump: u8,
}

impl SixPriceFeed {
    pub const INIT_SPACE: usize = 8 + 8 + 8 + 8 + 8 + 2 + 8 + 8 + 32 + 1 + 1;
}
