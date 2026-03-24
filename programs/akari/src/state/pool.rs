use anchor_lang::prelude::*;

#[account]
pub struct PoolVault {
    pub authority: Pubkey,
    pub oracle_authority: Pubkey,
    pub travel_rule_threshold: u64,
    pub daily_limit_usdc: u64,
    pub total_usdc: u64,
    pub total_eurc: u64,
    pub max_slippage_bps: u16,
    pub paused: bool,
    pub version: u8,
    pub bump: u8,
}

impl PoolVault {
    pub const INIT_SPACE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 2 + 1 + 1 + 1;
}
