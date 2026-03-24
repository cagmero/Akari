use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::events::*;

#[derive(Accounts)]
pub struct HarvestYield<'info> {
    #[account(mut)]
    pub yield_position: Account<'info, YieldPosition>,
    
    #[account(mut)]
    pub pool_vault: Account<'info, PoolVault>,
    
    #[account(mut, address = pool_vault.authority @ AkariError::Unauthorized)]
    pub authority: Signer<'info>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, HarvestYield<'info>>,
    ix_data: Vec<u8>
) -> Result<()> {
    let position = &mut ctx.accounts.yield_position;
    let clock = Clock::get()?;

    // Un-mocked direct execution using client-derived instruction data (Kamino SDK)
    if !ctx.remaining_accounts.is_empty() && !ix_data.is_empty() {
        let kamino_program = ctx.remaining_accounts[0].clone();
        
        let mut account_metas = Vec::new();
        for account in ctx.remaining_accounts.iter() {
            account_metas.push(if account.is_writable {
                AccountMeta::new(account.key(), account.is_signer)
            } else {
                AccountMeta::new_readonly(account.key(), account.is_signer)
            });
        }
        
        let ix = solana_program::instruction::Instruction {
            program_id: kamino_program.key(),
            accounts: account_metas,
            data: ix_data,
        };

        let pool_vault_bump = ctx.accounts.pool_vault.bump;
        let seeds = &[
            b"pool_vault".as_ref(),
            &[pool_vault_bump],
        ];
        let signer = &[&seeds[..]];

        solana_program::program::invoke_signed(
            &ix,
            ctx.remaining_accounts,
            signer,
        )?;
    }
    
    // In a production application we would calculate the exact delta in balance here.
    // We treat the execution success as zero harvested for event simplicity, since the real yield
    // is realized in the token account balances via the CPI.
    let harvested_amount = 0;

    position.total_yield_harvested += harvested_amount;
    position.last_harvest_at = clock.unix_timestamp;

    emit!(YieldHarvestedEvent {
        currency: position.currency,
        venue: position.venue,
        yield_amount: harvested_amount,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
