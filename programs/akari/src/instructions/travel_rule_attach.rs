use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::events::*;

#[derive(Accounts)]
pub struct TravelRuleAttach<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = TravelRuleRecord::INIT_SPACE,
        seeds = [b"travel_rule", tx_id.as_ref()],
        bump
    )]
    pub travel_rule_record: Account<'info, TravelRuleRecord>,
    
    #[account(mut)]
    pub subsidiary_account: Account<'info, SubsidiaryAccount>,
    
    pub pool_vault: Account<'info, PoolVault>,
    
    #[account(mut, address = pool_vault.authority @ AkariError::Unauthorized)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handle(
    ctx: Context<TravelRuleAttach>,
    tx_id: [u8; 32],
    sender_vasp_id: [u8; 16],
    receiver_vasp_id: [u8; 16],
    beneficiary_name_hash: [u8; 32],
    amount: u64,
    currency: u8,
) -> Result<()> {
    let record = &mut ctx.accounts.travel_rule_record;
    let clock = Clock::get()?;
    
    record.sender_vasp_id = sender_vasp_id;
    record.receiver_vasp_id = receiver_vasp_id;
    record.beneficiary_name_hash = beneficiary_name_hash;
    record.amount = amount;
    record.currency = currency;
    record.timestamp = clock.unix_timestamp;
    
    if record.version == 0 {
        record.version = 1;
        record.bump = ctx.bumps.travel_rule_record;
    }

    emit!(TravelRuleEvent {
        record_pda: record.key(),
        sender: ctx.accounts.authority.key(),
        receiver: ctx.accounts.subsidiary_account.owner,
        amount,
        currency,
    });

    Ok(())
}
