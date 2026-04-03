use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod errors;
pub mod events;

use instructions::*;

declare_id!("BbakYETxcQ98AJmmtFKHx6H8ytXHhUMsZAZdmch99Rrn");

#[program]
pub mod akari {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        oracle_authority: Pubkey,
        travel_rule_threshold: u64,
        daily_limit_usdc: u64,
        max_slippage_bps: u16,
    ) -> Result<()> {
        instructions::initialize_pool::handle(
            ctx,
            oracle_authority,
            travel_rule_threshold,
            daily_limit_usdc,
            max_slippage_bps,
        )
    }

    pub fn initialize_epoch_state(
        ctx: Context<InitializeEpochState>,
        currency_pair: [u8; 8],
        epoch_duration: i64,
        max_epoch_slippage_bps: u16,
    ) -> Result<()> {
        instructions::initialize_epoch_state::handle(ctx, currency_pair, epoch_duration, max_epoch_slippage_bps)
    }

    pub fn initialize_oracle_relay_lock(ctx: Context<InitializeOracleRelayLock>) -> Result<()> {
        instructions::initialize_oracle_relay_lock::handle(ctx)
    }

    pub fn register_subsidiary(
        ctx: Context<RegisterSubsidiary>,
        kyc_hash: [u8; 32],
        source_of_funds_hash: [u8; 32],
        vasp_id: [u8; 16],
    ) -> Result<()> {
        instructions::register_subsidiary::handle(ctx, kyc_hash, source_of_funds_hash, vasp_id)
    }

    pub fn deposit<'info>(ctx: Context<'_, '_, '_, 'info, Deposit<'info>>, amount: u64, currency: u8) -> Result<()> {
        instructions::deposit::handle(ctx, amount, currency)
    }

    pub fn withdraw<'info>(ctx: Context<'_, '_, '_, 'info, Withdraw<'info>>, amount: u64, currency: u8) -> Result<()> {
        instructions::withdraw::handle(ctx, amount, currency)
    }

    pub fn update_fx_rate<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateFxRate<'info>>,
        currency_pair: [u8; 8],
        bid: i64,
        ask: i64,
        published_at: i64,
    ) -> Result<()> {
        instructions::update_fx_rate::handle(ctx, currency_pair, bid, ask, published_at)
    }

    pub fn fx_swap<'info>(
        ctx: Context<'_, '_, '_, 'info, FxSwap<'info>>,
        from_currency: u8,
        to_currency: u8,
        in_amount: u64,
        currency_pair: [u8; 8],
        ix_data: Vec<u8>,
    ) -> Result<()> {
        instructions::fx_swap::handle(ctx, from_currency, to_currency, in_amount, currency_pair, ix_data)
    }

    pub fn acquire_relay_lock(ctx: Context<AcquireRelayLock>) -> Result<()> {
        instructions::acquire_relay_lock::handle(ctx)
    }

    pub fn renew_relay_lock(ctx: Context<RenewRelayLock>) -> Result<()> {
        instructions::renew_relay_lock::handle(ctx)
    }

    pub fn deploy_yield<'info>(
        ctx: Context<'_, '_, '_, 'info, DeployYield<'info>>,
        currency: u8,
        venue: [u8; 16],
        amount: u64,
        ix_data: Vec<u8>,
    ) -> Result<()> {
        instructions::deploy_yield::handle(ctx, currency, venue, amount, ix_data)
    }

    pub fn harvest_yield<'info>(
        ctx: Context<'_, '_, '_, 'info, HarvestYield<'info>>,
        ix_data: Vec<u8>
    ) -> Result<()> {
        instructions::harvest_yield::handle(ctx, ix_data)
    }

    pub fn travel_rule_attach<'info>(
        ctx: Context<'_, '_, '_, 'info, TravelRuleAttach<'info>>,
        tx_id: [u8; 32],
        sender_vasp_id: [u8; 16],
        receiver_vasp_id: [u8; 16],
        beneficiary_name_hash: [u8; 32],
        amount: u64,
        currency: u8,
    ) -> Result<()> {
        instructions::travel_rule_attach::handle(
            ctx,
            tx_id,
            sender_vasp_id,
            receiver_vasp_id,
            beneficiary_name_hash,
            amount,
            currency,
        )
    }

    pub fn flag_wallet(ctx: Context<FlagWallet>, flagged: bool) -> Result<()> {
        instructions::flag_wallet::handle(ctx, flagged)
    }

    pub fn pause_pool(ctx: Context<PausePool>, paused: bool) -> Result<()> {
        instructions::pause_pool::handle(ctx, paused)
    }

    pub fn update_oracle_authority(
        ctx: Context<UpdateOracleAuthority>,
        new_oracle_authority: Pubkey,
    ) -> Result<()> {
        instructions::update_oracle_authority::handle(ctx, new_oracle_authority)
    }
}
