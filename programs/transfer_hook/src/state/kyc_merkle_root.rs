use anchor_lang::prelude::*;

#[account]
pub struct KycMerkleRoot {
    pub root: [u8; 32],
    pub leaf_count: u64,
    pub updated_at: i64,
    pub authority: Pubkey,
    pub version: u8,
    pub bump: u8,
}

impl KycMerkleRoot {
    pub const INIT_SPACE: usize = 8 + 32 + 8 + 8 + 32 + 1 + 1;
}
