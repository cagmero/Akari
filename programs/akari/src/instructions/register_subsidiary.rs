use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct RegisterSubsidiary<'info> {
    #[account(
        init,
        payer = authority,
        space = SubsidiaryAccount::INIT_SPACE,
        seeds = [b"subsidiary", owner.key().as_ref()],
        bump
    )]
    pub subsidiary_account: Account<'info, SubsidiaryAccount>,
    
    pub pool_vault: Account<'info, PoolVault>,
    
    /// CHECK: The public key of the subsidiary owner
    pub owner: UncheckedAccount<'info>,
    
    #[account(mut, address = pool_vault.authority @ AkariError::Unauthorized)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handle(
    ctx: Context<RegisterSubsidiary>,
    kyc_hash: [u8; 32],
    source_of_funds_hash: [u8; 32],
    vasp_id: [u8; 16],
) -> Result<()> {
    let sub = &mut ctx.accounts.subsidiary_account;
    sub.owner = ctx.accounts.owner.key();
    sub.kyc_hash = kyc_hash;
    sub.source_of_funds_hash = source_of_funds_hash;
    sub.vasp_id = vasp_id;
    sub.usdc_balance = 0;
    sub.eurc_balance = 0;
    sub.daily_transfer_total = 0;
    sub.last_transfer_day = 0;
    sub.flagged = false;
    sub.version = 1;
    sub.bump = ctx.bumps.subsidiary_account;
    Ok(())
}
