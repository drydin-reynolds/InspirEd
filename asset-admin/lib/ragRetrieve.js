const Chunk = require('../models/Chunk')
const Asset = require('../models/Asset')
const { embedText } = require('./geminiRag')

function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  const m = Math.sqrt(na) * Math.sqrt(nb)
  return m === 0 ? 0 : dot / m
}

function formatSourceLabel(chunk) {
  const s = chunk.sourceTitle || chunk.sourceAssetId || 'source'
  return String(s)
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .trim()
}

/**
 * Brute-force retrieval over stored embeddings (prototype scale).
 * Replace with Atlas $vectorSearch at larger corpus sizes.
 *
 * @returns {Promise<{ results: { chunk: object, similarity: number }[], queryEmbedding: number[] }>}
 */
async function retrieveChunks(query, options = {}) {
  const {
    apiKey,
    topK = 5,
    minSimilarity = 0.3,
    clinicalReviewedOnly = false
  } = options

  const queryEmbedding = await embedText(query, apiKey)
  if (!queryEmbedding.length) {
    return { results: [], queryEmbedding: [] }
  }

  const filter = {
    embedding: { $exists: true, $ne: null, $not: { $size: 0 } }
  }

  const chunks = await Chunk.find(filter).lean()
  const results = []

  for (const chunk of chunks) {
    if (clinicalReviewedOnly && chunk.clinicallyReviewed === false) continue
    if (!chunk.embedding?.length) continue
    const similarity = cosineSimilarity(queryEmbedding, chunk.embedding)
    if (similarity >= minSimilarity) {
      results.push({ chunk, similarity })
    }
  }

  results.sort((a, b) => b.similarity - a.similarity)
  return {
    results: results.slice(0, topK),
    queryEmbedding
  }
}

/**
 * Format prompt context + citation list aligned with [1]..[n] markers.
 * Loads Asset rows so citations can include PDF paths for in-app viewing.
 */
async function buildContextAndCitations(retrievalResults) {
  if (!retrievalResults.length) {
    return { context: '', citations: [] }
  }

  const uniqueAssetIds = [...new Set(retrievalResults.map((r) => r.chunk.asset).filter(Boolean))]
  let assetById = new Map()
  if (uniqueAssetIds.length > 0) {
    const assets = await Asset.find({ _id: { $in: uniqueAssetIds } })
      .select('_id file_path')
      .lean()
    assetById = new Map(assets.map((a) => [String(a._id), a]))
  }

  const contextParts = retrievalResults.map((r, index) => {
    const label = formatSourceLabel(r.chunk)
    return `[Source ${index + 1}: ${label}]\nWhen citing this source, use the marker [${index + 1}].\n${r.chunk.text}`
  })

  const context = `TRUSTED MEDICAL SOURCES (cite using [1], [2], [3] markers):\n\n${contextParts.join(
    '\n\n---\n\n'
  )}`

  const citations = retrievalResults.map((r) => {
    const aid = r.chunk.asset ? String(r.chunk.asset) : ''
    const asset = aid ? assetById.get(aid) : null
    const fp = asset?.file_path ? String(asset.file_path) : ''
    const sourceFilePath = /\.pdf$/i.test(fp) ? fp : undefined
    const assetMongoId = asset?._id != null ? String(asset._id) : undefined

    const row = {
      id: `chunk-${r.chunk._id}`,
      sourceTitle: formatSourceLabel(r.chunk),
      excerpt:
        String(r.chunk.text || '').slice(0, 200) +
        (String(r.chunk.text || '').length > 200 ? '...' : ''),
      similarity: Math.round(r.similarity * 100)
    }
    if (sourceFilePath) row.sourceFilePath = sourceFilePath
    if (assetMongoId) row.assetMongoId = assetMongoId
    return row
  })

  return { context, citations }
}

module.exports = {
  retrieveChunks,
  buildContextAndCitations,
  cosineSimilarity
}
