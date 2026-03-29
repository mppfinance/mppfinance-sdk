#!/usr/bin/env node

import { MPPFinance } from './client'

const args = process.argv.slice(2)

async function demo() {
  const pkg = require('../package.json')
  console.log(`\n\x1b[90m  MPPFinance SDK\x1b[0m \x1b[2mv${pkg.version}\x1b[0m\n`)

  // --- Demo 1: basic card issue + charge with approval ---
  console.log('  \x1b[1mDemo 1 — requireApproval\x1b[0m\n')

  const client = new MPPFinance({
    agentId: 'demo-agent',
    network: 'solana',
    testnet: true,
    onApprovalRequired: async (req) => {
      console.log(`  \x1b[33m⚡ approval requested\x1b[0m`)
      console.log(`     agent    ${req.agentId}`)
      console.log(`     amount   $${(req.amount / 100).toFixed(2)} ${req.currency}`)
      console.log(`     merchant ${req.merchant ?? '—'}`)
      console.log(`     time     ${req.timestamp.toISOString()}`)
      await sleep(400)
      console.log(`  \x1b[32m✓ approved\x1b[0m\n`)
      return true
    },
  })

  console.log('  \x1b[90m→\x1b[0m issuing card...')
  await sleep(300)

  const card = await client.issue({
    amount: 100_00,
    currency: 'USD',
    rules: {
      merchant: 'aws.com',
      singleUse: false,
      maxPerTx: 30_00,
      maxPerDay: 60_00,
      requireApproval: true,
    },
  })

  console.log(`  \x1b[32m✓\x1b[0m card \x1b[1m${card.id}\x1b[0m ready\n`)
  console.log(`     number   ${card.number}`)
  console.log(`     amount   $${(card.amount / 100).toFixed(2)} ${card.currency}`)
  console.log(`     merchant ${card.merchant}`)
  console.log(`     rules    requireApproval ✓  maxPerTx $${(card.rules.maxPerTx! / 100).toFixed(2)}  maxPerDay $${(card.rules.maxPerDay! / 100).toFixed(2)}\n`)

  // Charge 1 — approved
  console.log('  \x1b[90m→\x1b[0m charging $25.00 at aws.com...')
  const r1 = await client.charge(card.id, 25_00, 'aws.com')
  console.log(`  ${r1.approved ? '\x1b[32m✓' : '\x1b[31m✗'} charge ${r1.approved ? 'completed' : 'denied: ' + r1.reason}\x1b[0m`)

  // Charge 2 — exceeds maxPerTx
  console.log('\n  \x1b[90m→\x1b[0m charging $50.00 at aws.com (over maxPerTx)...')
  await sleep(200)
  const r2 = await client.charge(card.id, 50_00, 'aws.com')
  console.log(`  ${r2.approved ? '\x1b[32m✓' : '\x1b[31m✗'} charge ${r2.approved ? 'completed' : 'denied: ' + r2.reason}\x1b[0m`)

  // Charge 3 — wrong merchant
  console.log('\n  \x1b[90m→\x1b[0m charging $10.00 at stripe.com (wrong merchant)...')
  await sleep(200)
  const r3 = await client.charge(card.id, 10_00, 'stripe.com')
  console.log(`  ${r3.approved ? '\x1b[32m✓' : '\x1b[31m✗'} charge ${r3.approved ? 'completed' : 'denied: ' + r3.reason}\x1b[0m`)

  console.log('\n  ─────────────────────────────────────────')
  console.log('  \x1b[90mdocs\x1b[0m  https://github.com/mppfinance/mppfinance-sdk')
  console.log('  \x1b[90mnpm\x1b[0m   npm install mppfinance\n')
}

async function mcp() {
  const { MPPFinanceMCP } = require('./mcp')
  const server = new MPPFinanceMCP({
    agentId: process.env.MPPFINANCE_AGENT_ID ?? 'agent',
    network: process.env.MPPFINANCE_NETWORK ?? 'solana',
    testnet: process.env.MPPFINANCE_TESTNET === 'true',
  })

  process.stdin.setEncoding('utf8')

  const send = (id: unknown, result: unknown) => {
    const msg = JSON.stringify({ jsonrpc: '2.0', id, result })
    process.stdout.write('Content-Length: ' + Buffer.byteLength(msg) + '\r\n\r\n' + msg)
  }

  const sendError = (id: unknown, code: number, message: string) => {
    const msg = JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } })
    process.stdout.write('Content-Length: ' + Buffer.byteLength(msg) + '\r\n\r\n' + msg)
  }

  let buffer = ''
  process.stdin.on('data', async (chunk: string) => {
    buffer += chunk
    const parts = buffer.split('\r\n\r\n')
    if (parts.length < 2) return
    buffer = parts.slice(2).join('\r\n\r\n')
    const body = parts[1]
    if (!body) return

    let req: any
    try { req = JSON.parse(body) } catch { return }

    if (req.method === 'initialize') {
      send(req.id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'mppfinance', version: require('../package.json').version },
      })
    } else if (req.method === 'tools/list') {
      send(req.id, { tools: server.tools() })
    } else if (req.method === 'tools/call') {
      try {
        const result = await server.call(req.params.name, req.params.arguments ?? {})
        send(req.id, { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] })
      } catch (e: any) {
        sendError(req.id, -32603, e.message)
      }
    } else {
      send(req.id, {})
    }
  })
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

if (args.includes('--mcp')) {
  mcp()
} else {
  demo().catch(console.error)
}
