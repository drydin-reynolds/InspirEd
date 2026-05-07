/**
 * Gemini REST helpers for RAG ingestion and retrieval (prototype).
 * Requires GEMINI_API_KEY in environment for PDF extraction and embeddings.
 */

const EMBEDDING_MODEL = 'models/text-embedding-004'
const PDF_MODEL = 'models/gemini-2.0-flash:generateContent'

async function callGeminiAPI(endpoint, body, apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not configured')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${endpoint}?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${errText}`)
  }

  return response.json()
}

/**
 * @param {string} text
 * @param {string} [apiKey]
 * @returns {Promise<number[]>}
 */
async function embedText(text, apiKey) {
  const trimmed = String(text || '').slice(0, 8000)
  if (!trimmed.trim()) return []

  const response = await callGeminiAPI(
    `${EMBEDDING_MODEL}:embedContent`,
    {
      model: EMBEDDING_MODEL,
      content: { parts: [{ text: trimmed }] }
    },
    apiKey
  )

  return response.embedding?.values || []
}

/**
 * Extract plain text from a PDF buffer using Gemini (same approach as scripts/process-pdfs.js).
 * @param {Buffer} pdfBuffer
 * @param {string} [apiKey]
 */
async function extractTextFromPdfBuffer(pdfBuffer, apiKey) {
  const base64PDF = pdfBuffer.toString('base64')

  const response = await callGeminiAPI(
    PDF_MODEL,
    {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64PDF
              }
            },
            {
              text: `Extract all the text content from this medical PDF document.
Preserve structure including section headings and paragraphs.
Return the full extracted text, maintaining readability.`
            }
          ]
        }
      ]
    },
    apiKey
  )

  return response.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

const CHAT_MODEL = 'models/gemini-2.5-flash:generateContent'

/**
 * @param {string} prompt
 * @param {string} [apiKey]
 */
async function generateText(prompt, apiKey) {
  const response = await callGeminiAPI(
    CHAT_MODEL,
    {
      contents: [{ parts: [{ text: prompt }] }]
    },
    apiKey
  )
  return response.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

module.exports = {
  callGeminiAPI,
  embedText,
  extractTextFromPdfBuffer,
  generateText,
  EMBEDDING_MODEL
}
