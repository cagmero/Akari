use anchor_lang::prelude::*;
use crate::state::kyc_merkle_root::KycMerkleRoot;
use crate::errors::TransferHookError;

#[derive(Accounts)]
pub struct UpdateKycRoot<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = KycMerkleRoot::INIT_SPACE,
        seeds = [b"kyc_root"],
        bump
    )]
    pub kyc_merkle_root: Account<'info, KycMerkleRoot>,
    
    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<UpdateKycRoot>, new_root: [u8; 32], new_leaf_count: u64) -> Result<()> {
    let kyc_root = &mut ctx.accounts.kyc_merkle_root;

    // Initialize fields if new (version will be 0 if newly zero-allocated)
    if kyc_root.version == 0 {
        kyc_root.version = 1;
        kyc_root.authority = ctx.accounts.authority.key();
        kyc_root.bump = ctx.bumps.kyc_merkle_root;
    }

    require!(kyc_root.authority == ctx.accounts.authority.key(), TransferHookError::Unauthorized);

    kyc_root.root = new_root;
    kyc_root.leaf_count = new_leaf_count;
    kyc_root.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
}
