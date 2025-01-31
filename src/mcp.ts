import { MPPFinance } from './client'
import type { MPPFinanceConfig } from './types'

/**
 * MCP Server for MPPFinance
 * Compatible with Claude, GPT-4, Cursor, and any MCP client
 */
export class MPPFinanceMCP {
  private client: MPPFinance

  constructor(config: MPPFinanceConfig) {
    this.client = new MPPFinance(config)
  }

  tools() {
    return [
      {
        name: 'issue_card',
        description: 'Issue a virtual Visa card with spending rules for an AI agent',
        inputSchema: {
          type: 'object',
          properties: {
            amount: { type: 'number', description: 'Amount in cents (e.g. 5000 = $50.00)' },
            currency: { type: 'string', enum: ['USD', 'EUR'], default: 'USD' },
            merchant: { type: 'string', description: 'Allowed merchant domain (e.g. aws.com)' },
            singleUse: { type: 'boolean', description: 'Burn card after first charge' },
            expiresIn: { type: 'number', description: 'TTL in seconds' },
          },
          required: ['amount'],
        },
      },
      {
        name: 'list_cards',
        description: 'List all active virtual cards for this agent',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'revoke_card',
        description: 'Revoke an active virtual card',
        inputSchema: {
          type: 'object',
          properties: {
            cardId: { type: 'string', description: 'Card ID to revoke' },
          },
          required: ['cardId'],
        },
      },
      {
        name: 'get_balance',
        description: 'Get agent wallet balance in SOL and USD',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_history',
        description: 'Get transaction history',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of records', default: 20 },
          },
        },
      },
    ]
  }

  async call(toolName: string, args: Record<string, unknown>) {
    switch (toolName) {
      case 'issue_card':
        return this.client.issue({
          amount: args.amount as number,
          currency: (args.currency as 'USD' | 'EUR') ?? 'USD',
          rules: {
            merchant: args.merchant as string | undefined,
            singleUse: args.singleUse as boolean | undefined,
            expiresIn: args.expiresIn as number | undefined,
          },
        })
      case 'list_cards':
        return this.client.list()
      case 'revoke_card':
        return this.client.revoke(args.cardId as string)
      case 'get_balance':
        return this.client.getBalance()
      case 'get_history':
        return this.client.getHistory(args.limit as number)
      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  }
}
// v3 - Mon Jan 20 22:08:47 MSK 2025
// v9 - Sat Feb  1 00:30:35 MSK 2025
