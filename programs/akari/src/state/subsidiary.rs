use anchor_lang::prelude::*;

#[account]
pub struct SubsidiaryAccount {
    pub owner: Pubkey,
    pub kyc_hash: [u8; 32],
    pub source_of_funds_hash: [u8; 32],
    pub vasp_id: [u8; 16],
    pub usdc_balance: u64,
    pub eurc_balance: u64,
    pub daily_transfer_total: u64,
    pub last_transfer_day: i64,
    pub flagged: bool,
    pub version: u8,
    pub bump: u8,
}

impl SubsidiaryAccount {
    pub const INIT_SPACE: usize = 8 + 32 + 32 + 32 + 16 + 8 + 8 + 8 + 8 + 1 + 1 + 1;

    pub fn maybe_migrate(&mut self) -> Result<()> {
        match self.version {
            0 => {
                // Zero-initialize fields added in v1
                self.flagged = false;
                self.version = 1;
                Ok(())
            },
            1 => Ok(()),
            _ => err!(crate::errors::AkariError::UnknownAccountVersion),
        }
    }
}
