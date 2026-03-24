use anchor_lang::prelude::*;

#[account]
pub struct OracleRelayLock {
    pub holder: Pubkey,         // Current lock holder
    pub acquired_at: i64,       // Unix timestamp of lock acquisition
    pub ttl: i64,               // Lock TTL in seconds — default: 60
    pub renewal_count: u64,     // Informational
    pub version: u8,
    pub bump: u8,
}

impl OracleRelayLock {
    pub const INIT_SPACE: usize = 8 + 32 + 8 + 8 + 8 + 1 + 1;
}
