use anchor_lang::prelude::*;
use crate::state::kyc_merkle_root::KycMerkleRoot;
use crate::errors::TransferHookError;

#[derive(Accounts)]
pub struct UpdateKycRoot<'info> {
    #[account(mut, has_one = authority @ TransferHookError::Unauthorized)]
    pub kyc_merkle_root: Account<'info, KycMerkleRoot>,
    
    pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<UpdateKycRoot>, new_root: [u8; 32], new_leaf_count: u64) -> Result<()> {
    let kyc_root = &mut ctx.accounts.kyc_merkle_root;
    kyc_root.root = new_root;
    kyc_root.leaf_count = new_leaf_count;
    kyc_root.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
}
