#!/usr/bin/env node
/**
 * Copies chunks + embeddings from assets/medical-knowledge.json into MongoDB (RagChunk).
 * Run from repo: cd asset-admin && npm run sync-rag
 * Needs: MONGO_URI in .env
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const RagChunk = require('../models/RagChunk')
const KNOWLEDGE_PATH = path.join(__dirname, '..', '..', 'assets', 'medical-knowledge.json')

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('Set MONGO_URI in asset-admin/.env')
    process.exit(1)
  }
  if (!fs.existsSync(KNOWLEDGE_PATH)) {
    console.error('Missing:', KNOWLEDGE_PATH)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(KNOWLEDGE_PATH, 'utf8'))
  const chunks = raw.chunks || []
  const withEmb = chunks.filter((c) => c.text && c.embedding?.length)
  if (!withEmb.length) {
    console.error('No chunks with embeddings in JSON.')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI)
  await RagChunk.deleteMany({})
  const docs = withEmb.map((c) => ({
    chunkId: c.id || `${c.source}_${c.chunkIndex}`,
    text: c.text,
    source: c.source,
    chunkIndex: c.chunkIndex ?? 0,
    embedding: c.embedding,
  }))
  await RagChunk.insertMany(docs, { ordered: false })
  console.log(`Inserted ${docs.length} RagChunk documents.`)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
