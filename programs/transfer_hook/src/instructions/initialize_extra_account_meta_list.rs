use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;
use spl_tlv_account_resolution::{
    account::ExtraAccountMeta,
    state::ExtraAccountMetaList,
};
use spl_transfer_hook_interface::instruction::ExecuteInstruction;

use crate::state::kyc_merkle_root::KycMerkleRoot;

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    /// CHECK: ExtraAccountMetaList Account, validated by Anchor seeds and PDA
    #[account(
        init,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump,
        space = ExtraAccountMetaList::size_of(1).unwrap(),
        payer = payer,
    )]
    pub extra_account_meta_list: AccountInfo<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        address = kyc_merkle_root.authority
    )]
    pub payer: Signer<'info>,

    pub kyc_merkle_root: Account<'info, KycMerkleRoot>,

    pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<InitializeExtraAccountMetaList>) -> Result<()> {
    // 1. Determine the extra accounts needed for the execute instruction
    let account_metas = vec![
        // We require the KycMerkleRoot PDA as an extra account for the execute instruction
        ExtraAccountMeta::new_with_pubkey(&ctx.accounts.kyc_merkle_root.key(), false, false)
            .map_err(|_| ProgramError::InvalidAccountData)?,
    ];

    // 2. Initialize the ExtraAccountMetaList structure into the PDA's data
    let mut data = ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?;
    ExtraAccountMetaList::init::<ExecuteInstruction>(
        &mut data,
        &account_metas,
    ).map_err(|_| ProgramError::InvalidAccountData)?;

    Ok(())
}
