<div align="center">

<img src="https://v0-mppf-inance-landing-page.vercel.app/logo.png" width="64" alt="MPPFinance" />

# @mppfinance/sdk

**Virtual Visa cards for AI agents — powered by Machine Payments Protocol**

[![npm version](https://img.shields.io/npm/v/@mppfinance/sdk?color=black&label=npm)](https://www.npmjs.com/package/@mppfinance/sdk)
[![License: MIT](https://img.shields.io/badge/license-MIT-black)](LICENSE)
[![CI](https://github.com/nullprotocolagent/mppfinance-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/nullprotocolagent/mppfinance-sdk/actions)
[![Twitter](https://img.shields.io/twitter/follow/MPPFinance_?style=social)](https://twitter.com/MPPFinance_)

[Website](https://v0-mppf-inance-landing-page.vercel.app) · [Docs](https://github.com/nullprotocolagent/mppfinance-sdk/tree/main/docs) · [NPM](https://www.npmjs.com/package/@mppfinance/sdk)

</div>

---

## What is MPPFinance?

MPPFinance bridges the **Machine Payments Protocol** to the real world. Your AI agent pays via MPP — gets a virtual Visa card — spends anywhere online. No humans in the loop.

```ts
import { MPPFinance } from '@mppfinance/sdk'

const card = await MPPFinance.issue({
  agentId: 'agent-7x2k',
  amount: 50_00,        // $50.00
  currency: 'USD',
  rules: {
    merchant: 'aws.com',
    singleUse: true,
    expiresIn: 300,
  },
})

// card.number → ready in 0.3s
console.log(card.number) // "4111 •••• •••• 9821"
```

---

## Features

| Feature | Description |
|---------|-------------|
| ⚡ 300ms issuance | Virtual Visa ready in under 300ms |
| 🔒 On-chain rules | Spending limits enforced by MPP protocol |
| 🎯 Merchant whitelist | Restrict card to exact domains |
| 🔥 Single-use cards | Card burns after first charge |
| 🤖 MCP native | Works with Claude, GPT-4, Cursor out of the box |
| 🔑 Non-custodial | Your keys, your funds |

---

## Installation

```bash
npm install @mppfinance/sdk
# or
pnpm add @mppfinance/sdk
# or
yarn add @mppfinance/sdk
```

---

## Quick Start

### 1. Initialize

```ts
import { MPPFinance } from '@mppfinance/sdk'

const client = new MPPFinance({
  agentId: 'your-agent-id',
  network: 'solana',   // 'solana' | 'ethereum'
  testnet: true,       // use testnet for development
})
```

### 2. Issue a card

```ts
const card = await client.issue({
  amount: 100_00,   // $100.00
  currency: 'USD',
  rules: {
    merchant: 'stripe.com',
    singleUse: false,
    expiresIn: 86400,  // 24 hours
    maxPerTx: 50_00,   // $50 per transaction
  },
})

console.log(card.id)      // "card_7x2k..."
console.log(card.number)  // "4111 •••• •••• 9821"
console.log(card.cvv)     // "***" (revealed once)
console.log(card.expiry)  // "12/27"
```

### 3. List active cards

```ts
const cards = await client.list()
cards.forEach(card => {
  console.log(`${card.id} — ${card.merchant} — $${card.spent}`)
})
```

### 4. Revoke a card

```ts
await client.revoke('card_7x2k...')
```

### 5. Webhooks

```ts
client.on('charge', (event) => {
  console.log(`Charged $${event.amount} at ${event.merchant}`)
})

client.on('expired', (event) => {
  console.log(`Card ${event.cardId} expired`)
})
```

---

## MCP Tool (Claude / GPT / Cursor)

MPPFinance ships with an MCP tool for direct agent integration:

```json
{
  "mcpServers": {
    "mppfinance": {
      "command": "npx",
      "args": ["-y", "@mppfinance/sdk", "--mcp"],
      "env": {
        "MPPFINANCE_AGENT_ID": "your-agent-id",
        "MPPFINANCE_NETWORK": "solana"
      }
    }
  }
}
```

Available MCP tools:
- `issue_card` — issue a new virtual card with rules
- `list_cards` — list all active cards
- `revoke_card` — revoke a card by ID
- `get_balance` — get agent wallet balance
- `get_history` — get transaction history

---

## API Reference

### `MPPFinance(config)`

| Param | Type | Description |
|-------|------|-------------|
| `agentId` | `string` | Your agent identifier |
| `network` | `'solana' \| 'ethereum'` | Blockchain network |
| `testnet` | `boolean` | Use testnet (default: false) |
| `webhookUrl` | `string?` | Webhook endpoint for events |

### `client.issue(options)`

| Param | Type | Description |
|-------|------|-------------|
| `amount` | `number` | Amount in cents (e.g. `50_00` = $50) |
| `currency` | `'USD' \| 'EUR'` | Card currency |
| `rules.merchant` | `string?` | Allowed merchant domain |
| `rules.singleUse` | `boolean` | Burn after first charge |
| `rules.expiresIn` | `number` | TTL in seconds |
| `rules.maxPerTx` | `number?` | Max charge per transaction (cents) |

---

## Roadmap

- [x] Core SDK (TypeScript)
- [x] Solana network support
- [x] MCP tool
- [x] Single-use cards
- [x] Merchant whitelisting
- [ ] Ethereum mainnet (Q2 2026)
- [ ] Python SDK (Q2 2026)
- [ ] Rust SDK (Q3 2026)
- [ ] Recurring card billing (Q3 2026)
- [ ] Multi-agent sub-accounts (Q4 2026)

---

## License

MIT © 2026 MPPFinance
// v4 - Wed Jan 22 14:35:29 MSK 2025
// v10 - Sun Feb  2 14:34:27 MSK 2025
// v16 - Thu Feb 13 18:02:07 MSK 2025
// v22 - Mon Feb 24 19:30:03 MSK 2025
// v28 - Fri Mar  7 21:32:48 MSK 2025
// v34 - Tue Mar 18 21:55:54 MSK 2025
