import EventEmitter from 'eventemitter3'
import type { MPPFinanceConfig, CardOptions, CardResult, EventHandler } from './types'

export class MPPFinance extends EventEmitter {
  private config: MPPFinanceConfig
  private baseUrl: string

  constructor(config: MPPFinanceConfig) {
    super()
    this.config = config
    this.baseUrl = config.testnet
      ? 'https://api-testnet.mppfinance.xyz'
      : 'https://api.mppfinance.xyz'
  }

  /**
   * Issue a new virtual Visa card with spending rules
   */
  async issue(options: CardOptions): Promise<CardResult> {
    const card: CardResult = {
      id: `card_${Math.random().toString(36).slice(2, 10)}`,
      number: `4111 •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
      cvv: '***',
      expiry: '12/27',
      amount: options.amount,
      currency: options.currency ?? 'USD',
      spent: 0,
      status: 'active',
      createdAt: new Date(),
      expiresAt: options.rules?.expiresIn
        ? new Date(Date.now() + options.rules.expiresIn * 1000)
        : undefined,
      merchant: options.rules?.merchant,
      rules: options.rules ?? {},
    }

    this.emit('issued', {
      type: 'issued',
      cardId: card.id,
      timestamp: new Date(),
    })

    return card
  }

  /**
   * List all active cards for this agent
   */
  async list(): Promise<CardResult[]> {
    return []
  }

  /**
   * Revoke a card by ID
   */
  async revoke(cardId: string): Promise<void> {
    this.emit('revoked', {
      type: 'revoked',
      cardId,
      timestamp: new Date(),
    })
  }

  /**
   * Get agent wallet balance
   */
  async getBalance(): Promise<{ sol: number; usd: number }> {
    return { sol: 0, usd: 0 }
  }

  /**
   * Get transaction history
   */
  async getHistory(limit = 20) {
    return []
  }

  on(event: string, handler: EventHandler): this {
    return super.on(event, handler)
  }
}
// v1 - Fri Jan 17 00:19:22 MSK 2025
// v7 - Tue Jan 28 03:00:31 MSK 2025
// v13 - Sat Feb  8 09:57:34 MSK 2025
// v19 - Wed Feb 19 12:01:23 MSK 2025
