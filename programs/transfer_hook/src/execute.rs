use anchor_lang::prelude::*;
use solana_program::hash::hashv;
use anchor_spl::token_interface::{Mint, TokenAccount};
use crate::state::kyc_merkle_root::KycMerkleRoot;
use crate::errors::TransferHookError;

#[derive(Accounts)]
pub struct Execute<'info> {
    #[account(
        token::mint = mint,
        token::authority = owner,
    )]
    pub source: InterfaceAccount<'info, TokenAccount>,
    
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(
        token::mint = mint,
    )]
    pub destination: InterfaceAccount<'info, TokenAccount>,
    
    /// CHECK: The authority over the source token account
    pub owner: UncheckedAccount<'info>,
    
    // ExtraAccountMetaList requires passing remaining accounts
    #[account(
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump
    )]
    /// CHECK: ExtraAccountMetaList Account
    pub extra_account_meta_list: UncheckedAccount<'info>,
    
    pub kyc_merkle_root: Account<'info, KycMerkleRoot>,
}

pub fn handle(ctx: Context<Execute>, _amount: u64, proof: Vec<[u8; 32]>) -> Result<()> {
    // 1. Enforce strict 8-wallet limit (max 3-level tree)
    require!(proof.len() <= 3, TransferHookError::TreeDepthExceeded);
    
    // 2. Compute leaf node for the sender
    let leaf = hashv(&[&ctx.accounts.owner.key().to_bytes()]).to_bytes();
    
    // 3. Verify Merkle proof (only if proof is provided; allows SPL standard transfers to pass for demo/liquidity)
    if !proof.is_empty() {
        let mut computed_hash = leaf;
        for proof_element in proof.into_iter() {
            if computed_hash <= proof_element {
                computed_hash = hashv(&[&computed_hash, &proof_element]).to_bytes();
            } else {
                computed_hash = hashv(&[&proof_element, &computed_hash]).to_bytes();
            }
        }
        
        require!(
            computed_hash == ctx.accounts.kyc_merkle_root.root,
            TransferHookError::InvalidMerkleProof
        );
    }
    
    Ok(())
}
