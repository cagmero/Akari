use anchor_lang::prelude::*;

#[account]
pub struct TravelRuleRecord {
    pub sender_vasp_id: [u8; 16],
    pub receiver_vasp_id: [u8; 16],
    pub beneficiary_name_hash: [u8; 32],
    pub amount: u64,
    pub currency: u8,
    pub timestamp: i64,
    pub version: u8,
    pub bump: u8,
}

impl TravelRuleRecord {
    pub const INIT_SPACE: usize = 8 + 16 + 16 + 32 + 8 + 1 + 8 + 1 + 1;
}
