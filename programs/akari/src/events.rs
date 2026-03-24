use anchor_lang::prelude::*;

#[event]
pub struct TransferEvent {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub currency: u8,
    pub timestamp: i64,
}

#[event]
pub struct FxSwapEvent {
    pub subsidiary: Pubkey,
    pub from_currency: u8,
    pub to_currency: u8,
    pub in_amount: u64,
    pub expected_out_amount: u64,
    pub actual_out_amount: u64,
    pub spread_bps: u16,
    pub oracle_source: u8, // 0 = SIX, 1 = Pyth
    pub liquidity_source: u8, // 0 = Internal, 1 = Jupiter
    pub timestamp: i64,
}

#[event]
pub struct TravelRuleEvent {
    pub record_pda: Pubkey,
    pub sender: Pubkey,
    pub receiver: Pubkey,
    pub amount: u64,
    pub currency: u8,
}

#[event]
pub struct OracleUpdateEvent {
    pub currency_pair: [u8; 8],
    pub bid: i64,
    pub ask: i64,
    pub mid: i64,
    pub spread_bps: u16,
    pub oracle_source: u8,
    pub published_at: i64,
    pub submitted_at: i64,
}

#[event]
pub struct RelayLockEvent {
    pub action: u8, // 0 = acquired, 1 = renewed
    pub holder: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct YieldDeployedEvent {
    pub currency: u8,
    pub venue: [u8; 16],
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct YieldHarvestedEvent {
    pub currency: u8,
    pub venue: [u8; 16],
    pub yield_amount: u64,
    pub timestamp: i64,
}
