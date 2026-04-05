/**
 * Loads chunks from Mongo, embeds the user question (Gemini), scores by vector similarity.
 * For modest corpus sizes; can move to Atlas Vector Search later.
 */

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

/** Must match dimension used when chunks were embedded (see process-pdfs.js). */
const EMBEDDING_DIM = 768

async function embedQuery(text, apiKey) {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in asset-admin/.env')
  // text-embedding-004 was removed from v1beta; use current embedding model.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text: String(text).slice(0, 8000) }] },
      outputDimensionality: EMBEDDING_DIM,
      taskType: 'RETRIEVAL_QUERY',
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini embed ${res.status}: ${errText}`)
  }
  const data = await res.json()
  return parseEmbedValues(data)
}

/** REST shape varies by API version; normalize to number[]. */
function parseEmbedValues(data) {
  if (!data || typeof data !== 'object') return []
  const e = data.embedding
  if (Array.isArray(e?.values) && e.values.length) return e.values
  if (Array.isArray(e?.value) && e.value.length) return e.value
  if (Array.isArray(e) && typeof e[0] === 'number') return e
  const first = Array.isArray(data.embeddings) ? data.embeddings[0] : null
  if (Array.isArray(first?.values) && first.values.length) return first.values
  return []
}

async function searchRagChunks({ query, RagChunk, topK = 3, minSimilarity = 0.3 }) {
  const apiKey = process.env.GEMINI_API_KEY
  const queryEmbedding = await embedQuery(query, apiKey)
  if (!queryEmbedding.length) {
    console.warn('[RAG] Empty query embedding — check Gemini embedContent JSON shape')
    return []
  }

  const docs = await RagChunk.find(
    {},
    { chunkId: 1, text: 1, source: 1, chunkIndex: 1, embedding: 1 }
  ).lean()

  const firstEmb = docs.find((d) => d.embedding?.length)?.embedding
  if (firstEmb && firstEmb.length !== queryEmbedding.length) {
    console.warn(
      `[RAG] Query embedding dim ${queryEmbedding.length} != chunk dim ${firstEmb.length}; fix outputDimensionality or re-sync`
    )
  }

  const scored = []
  for (const doc of docs) {
    if (!doc.embedding?.length) continue
    if (doc.embedding.length !== queryEmbedding.length) continue
    const similarity = cosineSimilarity(queryEmbedding, doc.embedding)
    scored.push({
      chunk: {
        id: doc.chunkId,
        text: doc.text,
        source: doc.source,
        chunkIndex: doc.chunkIndex ?? 0,
      },
      similarity,
    })
  }
  scored.sort((a, b) => b.similarity - a.similarity)

  const above = scored.filter((r) => r.similarity >= minSimilarity)
  if (above.length > 0) {
    return above.slice(0, topK)
  }

  // Query/doc vectors from different embedding models often score below minSimilarity;
  // still return best matches until chunks are re-embedded with the same model.
  if (scored.length > 0) {
    console.warn(
      `[RAG] No chunk >= minSimilarity ${minSimilarity}; returning top ${topK} by raw score (re-run process-pdfs + sync-rag for aligned embeddings)`
    )
    return scored.slice(0, topK)
  }

  return []
}

module.exports = { searchRagChunks, cosineSimilarity, embedQuery }
