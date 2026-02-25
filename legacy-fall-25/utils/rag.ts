/**
 * Local RAG (Retrieval-Augmented Generation) Service
 * 
 * Provides vector similarity search over pre-embedded medical content
 * to ground AI responses in trusted sources.
 */

import { GoogleGenAI } from "@google/genai";
import Constants from "expo-constants";

interface KnowledgeChunk {
  id: string;
  text: string;
  source: string;
  chunkIndex: number;
  embedding: number[];
}

interface KnowledgeBase {
  version: string;
  generatedAt: string;
  totalChunks: number;
  sources: string[];
  chunks: KnowledgeChunk[];
}

interface RetrievalResult {
  chunk: KnowledgeChunk;
  similarity: number;
}

export interface Citation {
  id: string;
  sourceTitle: string;
  excerpt: string;
  similarity: number;
}

export interface RAGContextWithCitations {
  context: string;
  citations: Citation[];
}

let knowledgeBase: KnowledgeBase | null = null;
let ai: GoogleGenAI | null = null;

const getApiKey = (): string => {
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    Constants.expoConfig?.extra?.GEMINI_API_KEY ||
    Constants.manifest2?.extra?.expoClient?.extra?.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return apiKey;
};

const getAI = (): GoogleGenAI => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return ai;
};

/**
 * Load the knowledge base from bundled assets
 */
export async function loadKnowledgeBase(): Promise<boolean> {
  if (knowledgeBase) return true;
  
  try {
    // Dynamic import for the bundled knowledge base
    const data = require('@/assets/medical-knowledge.json');
    knowledgeBase = data as KnowledgeBase;
    console.log(`[RAG] Loaded ${knowledgeBase.totalChunks} chunks from ${knowledgeBase.sources.length} sources`);
    return true;
  } catch (error) {
    console.warn('[RAG] Knowledge base not available:', error);
    return false;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Generate embedding for a query using Gemini
 */
async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${getApiKey()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [{ text: query }],
          },
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.embedding?.values || [];
  } catch (error) {
    console.error('[RAG] Error generating query embedding:', error);
    return [];
  }
}

/**
 * Retrieve relevant chunks for a given query
 */
export async function retrieveRelevantContext(
  query: string,
  topK: number = 3,
  minSimilarity: number = 0.3
): Promise<RetrievalResult[]> {
  // Ensure knowledge base is loaded
  const loaded = await loadKnowledgeBase();
  if (!loaded || !knowledgeBase) {
    console.warn('[RAG] Knowledge base not available');
    return [];
  }
  
  // Generate query embedding
  const queryEmbedding = await generateQueryEmbedding(query);
  if (queryEmbedding.length === 0) {
    return [];
  }
  
  // Calculate similarities
  const results: RetrievalResult[] = [];
  
  for (const chunk of knowledgeBase.chunks) {
    if (!chunk.embedding || chunk.embedding.length === 0) continue;
    
    const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
    if (similarity >= minSimilarity) {
      results.push({ chunk, similarity });
    }
  }
  
  // Sort by similarity and return top K
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
}

/**
 * Format source name for display
 */
function formatSourceName(source: string): string {
  return source
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\d+$/, '')
    .trim();
}

/**
 * Get formatted context for AI prompts
 */
export async function getRAGContext(query: string, topK: number = 3): Promise<string> {
  const results = await retrieveRelevantContext(query, topK);
  
  if (results.length === 0) {
    return '';
  }
  
  const contextParts = results.map((result, index) => {
    const sourceLabel = formatSourceName(result.chunk.source);
    return `[Source ${index + 1}: ${sourceLabel}]\n${result.chunk.text}`;
  });
  
  return `TRUSTED MEDICAL SOURCES:\n\n${contextParts.join('\n\n---\n\n')}`;
}

/**
 * Get formatted context with citation metadata for UI display
 */
export async function getRAGContextWithCitations(
  query: string, 
  topK: number = 3
): Promise<RAGContextWithCitations> {
  const results = await retrieveRelevantContext(query, topK);
  
  if (results.length === 0) {
    return { context: '', citations: [] };
  }
  
  // Group results by source to deduplicate citations
  const sourceMap = new Map<string, { 
    chunks: typeof results; 
    bestSimilarity: number;
  }>();
  
  for (const result of results) {
    const sourceName = result.chunk.source;
    const existing = sourceMap.get(sourceName);
    if (existing) {
      existing.chunks.push(result);
      existing.bestSimilarity = Math.max(existing.bestSimilarity, result.similarity);
    } else {
      sourceMap.set(sourceName, { 
        chunks: [result], 
        bestSimilarity: result.similarity 
      });
    }
  }
  
  // Create deduplicated citations (one per unique source)
  const citations: Citation[] = [];
  let citationIndex = 0;
  for (const [sourceName, data] of sourceMap.entries()) {
    citationIndex++;
    // Combine excerpts from multiple chunks of the same source
    const combinedExcerpt = data.chunks
      .slice(0, 2)
      .map(r => r.chunk.text.substring(0, 100))
      .join(' ... ');
    
    citations.push({
      id: `source-${citationIndex}`,
      sourceTitle: formatSourceName(sourceName),
      excerpt: combinedExcerpt.substring(0, 200) + (combinedExcerpt.length > 200 ? '...' : ''),
      similarity: Math.round(data.bestSimilarity * 100),
    });
  }
  
  const contextParts = results.map((result, index) => {
    const sourceLabel = formatSourceName(result.chunk.source);
    return `[Source ${index + 1}: ${sourceLabel}]\nWhen citing this source, use the marker [${index + 1}].\n${result.chunk.text}`;
  });
  
  const context = `TRUSTED MEDICAL SOURCES (cite using [1], [2], [3] markers):\n\n${contextParts.join('\n\n---\n\n')}`;
  
  return { context, citations };
}

/**
 * Check if the knowledge base is available
 */
export function isKnowledgeBaseAvailable(): boolean {
  return knowledgeBase !== null && knowledgeBase.totalChunks > 0;
}

/**
 * Get knowledge base statistics
 */
export function getKnowledgeBaseStats(): { totalChunks: number; sources: string[] } | null {
  if (!knowledgeBase) return null;
  
  return {
    totalChunks: knowledgeBase.totalChunks,
    sources: knowledgeBase.sources,
  };
}
