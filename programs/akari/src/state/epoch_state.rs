use anchor_lang::prelude::*;

#[account]
pub struct EpochState {
    pub currency_pair: [u8; 8],             // b"EUR_USD\0" or b"CHF_USD\0"
    pub epoch_start: i64,
    pub epoch_duration: i64,                // Default: 86_400 (1 day)
    pub epoch_accumulated_slippage: u64,
    pub max_epoch_slippage_bps: u16,        // Default: 100 (1%)
    pub vault_nav_snapshot_usdc: u64,       // NAV at epoch start — denominator for budget
    pub total_swaps_this_epoch: u32,        // Informational
    pub version: u8,
    pub bump: u8,
}

impl EpochState {
    pub const INIT_SPACE: usize = 8 + 8 + 8 + 8 + 8 + 2 + 8 + 4 + 1 + 1;
}
