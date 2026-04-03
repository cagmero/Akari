# Akari Treasury: Complete Demo Sequence

This sequence ensures all compliance triggers and interbank integrations are showcased during your recording.

### 🕒 1. Pre-Recording Setup
1.  **Environment**: `solana config set --url devnet`.
2.  **Simulation**: Run `npx ts-node scripts/simulate-transfers.ts`.
3.  **Relays**:
    - Terminal 1: `node oracle-relay/dist/index.js`
    - Terminal 2: `node oracle-relay/dist/standby.js`
4.  **Frontend**: `cd app && npm run dev`.
5.  **Explorer**: Open a tab for your [Audit Trail Address](https://explorer.solana.com/address/BbakYETxcQ98AJmmtFKHx6H8ytXHhUMsZAZdmch99Rrn?cluster=devnet).

### 🎬 2. Step-by-Step Recording Sequence (2:45 total)

1.  **Intro (0:00-0:15)**: Open `http://localhost:3000`. Click the **Launch App** button. Show the clean redirection to `/app`.
2.  **Auth & Identity (0:15-0:40)**: Connect using Privy (`procrastinationm457er@gmail.com`). Mention that each subsidiary has a unique institutional ID.
3.  **Dashboard Overview (0:40-1:10)**: Show the **Institutional Entity Positions** (pre-populated by the simulation). Point out the jurisdictions (USA, Germany, Singapore).
4.  **Activity Feed (1:10-1:30)**: Scroll through the **Audit Trail**. Mention that these are on-chain events being parsed in real-time.
5.  **Compliant FX (1:30-2:00)**: Go to **FX Markets**. Choose 'GmbH' from Germany. Swap 1,000 USDC ↔ EURC. Show the **SIX Price Feed** badge and interbank spread.
6.  **Transfer Hook Trigger (2:00-2:30)**: Go to **Pool Management**. Attempt to deposit $100,000 for the 'USA LLC' subsidiary. Show the **Travel Rule** soft-block triggering as it exceeds the limit.
7.  **Conclusion (2:30-2:45)**: Return to **Overview**. Show the updated balances and trail.
