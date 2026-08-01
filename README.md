# NanoPay MVP

NanoPay is a USDC micropayments MVP for Arc Testnet built with:
- Node.js + Express backend
- React + Vite frontend
- Circle Developer-Controlled Wallets
- Optional / experimental Circle Gateway unified-balance lookup with safe fallback

## Project structure

```text
nanopay-mvp/
  server/
  frontend/
  .env.example
```

## Prerequisites

- Node.js 22+
- A Circle Developer API key
- A registered Circle entity secret
- An existing `WALLET_SET_ID` containing the two Arc Testnet wallets
- Testnet USDC in the sender wallet

## Setup

1. Copy `.env.example` to `.env` in the project root.
2. Fill in:
   - `CIRCLE_API_KEY`
   - `CIRCLE_ENTITY_SECRET`
   - `WALLET_SET_ID`
   - `FRONTEND_ORIGIN`
3. Install dependencies:

```bash
npm install
```

## Run locally

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Build

```bash
npm run build
```

## Backend API

- `GET /api/wallets`
- `GET /api/wallets/:walletId/balance`
- `GET /api/wallets/:walletId/unified-balance`
- `POST /api/transfer`
- `GET /api/transactions/:transactionId`
- `POST /api/gateway/deposit` (disabled by default unless explicitly enabled/configured)

## Notes

- The frontend never talks to Circle directly.
- Secrets stay server-side only.
- `POST /api/transfer` uses Arc Testnet USDC token ID:
  `ef87c8c3-85de-598a-af50-c5135eecfa74`
- If Gateway lookup is disabled or unavailable, unified balance falls back to direct Arc balance with:

```json
{
  "gatewayEnabled": false
}
```

## Sources used while implementing

- NanoPay MVP spec PDF
- Circle Wallets token IDs: https://developers.circle.com/wallets/tokens
- Circle Developer-Controlled Wallets Node SDK: https://developers.circle.com/sdks/developer-controlled-wallets-nodejs-sdk
- Circle transfer transaction API: https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/create-developer-transaction-transfer
- Circle transaction retrieval API: https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/get-transaction
- Circle Gateway technical guide: https://developers.circle.com/gateway/references/technical-guide
- Circle Gateway quickstart: https://developers.circle.com/gateway/quickstarts/unified-balance-evm
