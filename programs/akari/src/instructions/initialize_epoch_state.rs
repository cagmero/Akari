use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(currency_pair: [u8; 8])]
pub struct InitializeEpochState<'info> {
    #[account(
        init,
        payer = authority,
        space = EpochState::INIT_SPACE,
        seeds = [b"epoch_state", currency_pair.as_ref()],
        bump
    )]
    pub epoch_state: Account<'info, EpochState>,

    pub pool_vault: Account<'info, PoolVault>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handle(
    ctx: Context<InitializeEpochState>,
    currency_pair: [u8; 8],
    epoch_duration: i64,
    max_epoch_slippage_bps: u16,
) -> Result<()> {
    let state = &mut ctx.accounts.epoch_state;
    let clock = Clock::get()?;
    state.currency_pair = currency_pair;
    state.epoch_start = clock.unix_timestamp;
    state.epoch_duration = epoch_duration;
    state.epoch_accumulated_slippage = 0;
    state.max_epoch_slippage_bps = max_epoch_slippage_bps;
    state.vault_nav_snapshot_usdc = ctx.accounts.pool_vault.total_usdc;
    state.total_swaps_this_epoch = 0;
    state.version = 1;
    state.bump = ctx.bumps.epoch_state;
    Ok(())
}
