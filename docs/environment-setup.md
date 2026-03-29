# Devnet Environment Setup

Store this file securely. Do not commit keypairs with real funds.

## Useful Addresses

- **Pyth Network Devnet EUR/USD Price Feed ID:** `0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b`
- **Pyth Oracle Program ID:** `J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLSRTSndpeCPy`
- **Devnet USDC Mint:** `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

## Generate Keypairs

You requested new oracle and standby keypairs. We have generated them locally:

### Primary Oracle Keypair
- **Pubkey:** `4X6QbadAjMcwYQTb8yXmz3dTDje2gWD9Aqm1u1kfK5vm`
- **Seed Phrase:** `pulp east because era vivid old lunch clown produce chalk error reject`
- **File:** `oracle-keypair.json`

### Standby Oracle Keypair
- **Pubkey:** `4DftbNP9EYGEaUV4sCsHnAja94uxDyX39tGDwYQv9PoF`
- **Seed Phrase:** `curious pulse rifle mention slide crash enjoy crunch master slight desk cash`
- **File:** `standby-keypair.json`

### Dev Wallet Keypair
- **Pubkey:** `FHJYAxesexMA6sMg7vb9DfgDg358NqGz6NsM1nQbMJtS`
- **File:** `~/.config/solana/id.json`

---

## IMPORTANT: Airdropping SOL

The standard Solana Devnet faucet via the CLI (`solana airdrop 1`) is currently rate-limited or disabled.
To fund these wallets, please visit the [Solana Faucet](https://faucet.solana.com/) or another Devnet faucet in your browser and enter the three pubkeys listed above to request Devnet SOL.

## SIX Data Access

For verification of SIX mTLS, ensure that you place the `Account Certificate` in the correct location for the Oracle Relay to pick up (usually a `certs/` directory) and follow the `Web API Documentation (PDF)` and `Cross Currency & Commodities List (Excel)` for specific endpoints and instrument tickers securely decoupled from on-chain storage.
