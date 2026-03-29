import type { MPPFinanceConfig, CardOptions, CardResult, ApprovalRequest, ApprovalResult } from './types'

type EventHandler = (event: any) => void

export class MPPFinance {
  private config: MPPFinanceConfig
  private handlers: Record<string, EventHandler[]> = {}
  private cards: Map<string, CardResult> = new Map()
  private dailySpend: Map<string, number> = new Map()

  constructor(config: MPPFinanceConfig) {
    this.config = config
  }

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

    this.cards.set(card.id, card)
    this._emit('issued', { type: 'issued', cardId: card.id, timestamp: new Date() })
    return card
  }

  /**
   * Simulate a charge on a card.
   * If the card has requireApproval: true, the onApprovalRequired callback is called first.
   * Throws if denied, over limit, wrong merchant, or card expired/revoked.
   */
  async charge(cardId: string, amount: number, merchant?: string): Promise<ApprovalResult> {
    const card = this.cards.get(cardId)
    if (!card) throw new Error(`Card ${cardId} not found`)
    if (card.status !== 'active') throw new Error(`Card ${cardId} is ${card.status}`)

    // Check expiry
    if (card.expiresAt && card.expiresAt < new Date()) {
      card.status = 'expired'
      this._emit('expired', { type: 'expired', cardId, timestamp: new Date() })
      throw new Error(`Card ${cardId} has expired`)
    }

    // Check merchant whitelist
    if (card.rules.merchant && merchant && !merchant.includes(card.rules.merchant)) {
      const result: ApprovalResult = { approved: false, reason: `Merchant ${merchant} not allowed. Only ${card.rules.merchant}` }
      this._emit('charge.denied', { type: 'charge.denied', cardId, amount, merchant, timestamp: new Date() })
      return result
    }

    // Check per-tx limit
    if (card.rules.maxPerTx && amount > card.rules.maxPerTx) {
      const result: ApprovalResult = {
        approved: false,
        reason: `Amount $${(amount / 100).toFixed(2)} exceeds per-tx limit $${(card.rules.maxPerTx / 100).toFixed(2)}`,
      }
      this._emit('charge.denied', { type: 'charge.denied', cardId, amount, merchant, timestamp: new Date() })
      return result
    }

    // Check daily spend limit
    if (card.rules.maxPerDay) {
      const today = new Date().toDateString()
      const key = `${cardId}:${today}`
      const todaySpend = this.dailySpend.get(key) ?? 0
      if (todaySpend + amount > card.rules.maxPerDay) {
        const result: ApprovalResult = {
          approved: false,
          reason: `Daily limit reached. Spent $${(todaySpend / 100).toFixed(2)} of $${(card.rules.maxPerDay / 100).toFixed(2)}`,
        }
        this._emit('charge.denied', { type: 'charge.denied', cardId, amount, merchant, timestamp: new Date() })
        return result
      }
    }

    // Check total card balance
    if (card.spent + amount > card.amount) {
      const result: ApprovalResult = {
        approved: false,
        reason: `Insufficient balance. Available: $${((card.amount - card.spent) / 100).toFixed(2)}`,
      }
      this._emit('charge.denied', { type: 'charge.denied', cardId, amount, merchant, timestamp: new Date() })
      return result
    }

    // Approval gate — ask human/system before proceeding
    if (card.rules.requireApproval) {
      const request: ApprovalRequest = {
        cardId,
        amount,
        currency: card.currency,
        merchant,
        agentId: this.config.agentId,
        timestamp: new Date(),
      }

      const approved = this.config.onApprovalRequired
        ? await this.config.onApprovalRequired(request)
        : false // default: deny if no handler registered

      if (!approved) {
        const result: ApprovalResult = { approved: false, reason: 'Approval denied or no approval handler registered' }
        this._emit('charge.denied', { type: 'charge.denied', cardId, amount, merchant, timestamp: new Date() })
        return result
      }
    }

    // Execute charge
    card.spent += amount
    const today = new Date().toDateString()
    const key = `${cardId}:${today}`
    this.dailySpend.set(key, (this.dailySpend.get(key) ?? 0) + amount)

    if (card.rules.singleUse) {
      card.status = 'used'
    }

    this._emit('charge', { type: 'charge', cardId, amount, merchant, timestamp: new Date() })
    this._emit('charge.approved', { type: 'charge.approved', cardId, amount, merchant, timestamp: new Date() })

    return { approved: true }
  }

  async list(): Promise<CardResult[]> {
    return Array.from(this.cards.values())
  }

  async revoke(cardId: string): Promise<void> {
    const card = this.cards.get(cardId)
    if (card) card.status = 'revoked'
    this._emit('revoked', { type: 'revoked', cardId, timestamp: new Date() })
  }

  async getBalance(): Promise<{ sol: number; usd: number }> {
    return { sol: 0, usd: 0 }
  }

  async getHistory(limit = 20): Promise<any[]> {
    return []
  }

  on(event: string, handler: EventHandler): this {
    if (!this.handlers[event]) this.handlers[event] = []
    this.handlers[event].push(handler)
    return this
  }

  private _emit(event: string, data: any): void {
    ;(this.handlers[event] ?? []).forEach(h => h(data))
  }
}
