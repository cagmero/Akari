use anchor_lang::prelude::*;

pub mod state;
pub mod execute;
pub mod update_kyc_root;
pub mod errors;

use execute::*;
use update_kyc_root::*;

declare_id!("8CcUWBS5X6PmUNzzwRykCUoPeFTfcsdULo5EVRpuLH2d");

#[program]
pub mod transfer_hook {
    use super::*;

    pub fn execute(ctx: Context<Execute>, amount: u64, proof: Vec<[u8; 32]>) -> Result<()> {
        execute::handle(ctx, amount, proof)
    }

    pub fn update_kyc_root(ctx: Context<UpdateKycRoot>, new_root: [u8; 32], new_leaf_count: u64) -> Result<()> {
        update_kyc_root::handle(ctx, new_root, new_leaf_count)
    }
}
