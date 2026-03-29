export interface MPPFinanceConfig {
  agentId: string
  network?: 'solana' | 'ethereum'
  testnet?: boolean
  webhookUrl?: string
  apiKey?: string
  /** Called before every charge when requireApproval is true on the card */
  onApprovalRequired?: (request: ApprovalRequest) => Promise<boolean>
}

export interface SpendingRules {
  merchant?: string
  singleUse?: boolean
  expiresIn?: number
  maxPerTx?: number
  maxPerDay?: number
  /** Require explicit approval before every charge */
  requireApproval?: boolean
}

export interface ApprovalRequest {
  cardId: string
  amount: number
  currency: string
  merchant?: string
  agentId: string
  timestamp: Date
}

export interface ApprovalResult {
  approved: boolean
  reason?: string
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
  type: 'charge' | 'charge.approved' | 'charge.denied' | 'expired' | 'revoked' | 'issued'
  cardId: string
  amount?: number
  merchant?: string
  timestamp: Date
}

export type EventHandler = (event: CardEvent) => void
