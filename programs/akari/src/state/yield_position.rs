use anchor_lang::prelude::*;

#[account]
pub struct YieldPosition {
    pub currency: u8,                    // 0 = USDC, 1 = EURC
    pub venue: [u8; 16],                 // b"kamino\0\0\0\0\0\0\0\0\0\0"
    pub deposited_amount: u64,           // Amount deployed to venue
    pub shares_held: u64,                // Venue-specific share tokens held
    pub last_harvest_at: i64,
    pub total_yield_harvested: u64,      // Cumulative yield (informational)
    pub version: u8,
    pub bump: u8,
}

impl YieldPosition {
    pub const INIT_SPACE: usize = 8 + 1 + 16 + 8 + 8 + 8 + 8 + 1 + 1;
}
