use anchor_lang::prelude::*;

#[error_code]
pub enum TransferHookError {
    #[msg("The provided Merkle proof is invalid.")]
    InvalidMerkleProof,
    #[msg("The wallet is not KYC verified.")]
    NotKycVerified,
    #[msg("The Merkle tree exceeds the maximum allowed depth of 3.")]
    TreeDepthExceeded,
    #[msg("Unauthorized to update the KYC root.")]
    Unauthorized,
}
