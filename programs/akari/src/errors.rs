use anchor_lang::prelude::*;

#[error_code]
pub enum AkariError {
    #[msg("Account version is unknown or unsupported.")]
    UnknownAccountVersion,
    #[msg("Signer is not the authorized oracle authority.")]
    InvalidOracleAuthority,
    #[msg("Oracle relay lock is required but not held.")]
    RelayLockNotHeld,
    #[msg("Oracle relay lock is currently held by another relay.")]
    RelayLockHeldByAnother,
    #[msg("Epoch slippage budget exceeded.")]
    EpochSlippageBudgetExhausted,
    #[msg("Per-swap slippage limit exceeded.")]
    SlippageExceeded,
    #[msg("Internal liquidity insufficient for swap.")]
    InsufficientLiquidity,
    #[msg("Insufficient idle balance to deploy yield.")]
    InsufficientIdleBalance,
    #[msg("Oracle prices are stale.")]
    OracleStale,
    #[msg("Subsidiary wallet is flagged for AML.")]
    FlaggedWallet,
    #[msg("Daily transfer limit exceeded.")]
    DailyLimitExceeded,
    #[msg("Pool is currently paused.")]
    PoolPaused,
    #[msg("Travel rule data is required for this transfer amount.")]
    TravelRuleRequired,
    #[msg("Unauthorized access.")]
    Unauthorized,
}
