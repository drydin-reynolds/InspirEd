#!/usr/bin/env node
/**
 * Smoke checks for asset-admin RAG endpoints (optional).
 *
 * Usage:
 *   RAG_BASE=http://localhost:3000 GEMINI_API_KEY=xxx node scripts/rag-smoke.mjs
 */

const base = (process.env.RAG_BASE || 'http://localhost:3000').replace(/\/$/, '')
const key = process.env.GEMINI_API_KEY || ''

async function main() {
  if (!key) {
    console.warn('GEMINI_API_KEY not set — /api/rag/retrieve and /api/rag/chat may fail.')
  }

  const statsRes = await fetch(`${base}/api/rag/stats`)
  console.log('GET /api/rag/stats', statsRes.status, await statsRes.text())

  const q = process.env.SMOKE_QUERY || 'pulmonary surfactant'
  const body = JSON.stringify({
    query: q,
    topK: 3,
    geminiApiKey: key,
    clinicalReviewedOnly: false,
  })

  const retRes = await fetch(`${base}/api/rag/retrieve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'x-gemini-api-key': key } : {}),
    },
    body,
  })
  const retText = await retRes.text()
  console.log('POST /api/rag/retrieve', retRes.status, retText.slice(0, 500))

  const chatRes = await fetch(`${base}/api/rag/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'x-gemini-api-key': key } : {}),
    },
    body: JSON.stringify({
      question: q,
      readingLevel: 8,
      conversationHistory: [],
      geminiApiKey: key,
      topK: 3,
      clinicalReviewedOnly: false,
    }),
  })
  const chatText = await chatRes.text()
  console.log('POST /api/rag/chat', chatRes.status, chatText.slice(0, 500))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
