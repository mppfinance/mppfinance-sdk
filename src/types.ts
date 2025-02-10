export interface MPPFinanceConfig {
  agentId: string
  network?: 'solana' | 'ethereum'
  testnet?: boolean
  webhookUrl?: string
  apiKey?: string
}

export interface SpendingRules {
  merchant?: string
  singleUse?: boolean
  expiresIn?: number
  maxPerTx?: number
  maxPerDay?: number
}

export interface CardOptions {
  amount: number
  currency?: 'USD' | 'EUR'
  rules?: SpendingRules
  metadata?: Record<string, string>
}

export interface CardResult {
  id: string
  number: string
  cvv: string
  expiry: string
  merchant?: string
  amount: number
  currency: string
  spent: number
  status: 'active' | 'used' | 'expired' | 'revoked'
  createdAt: Date
  expiresAt?: Date
  rules: SpendingRules
}

export interface CardEvent {
  type: 'charge' | 'expired' | 'revoked' | 'issued'
  cardId: string
  amount?: number
  merchant?: string
  timestamp: Date
}

export type EventHandler = (event: CardEvent) => void
// v2 - Sat Jan 18 23:47:48 MSK 2025
// v8 - Thu Jan 30 05:35:32 MSK 2025
// v14 - Mon Feb 10 08:20:34 MSK 2025
