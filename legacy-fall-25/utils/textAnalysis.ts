/**
 * Text Analysis Utilities for Automatic Reading Level Detection
 * Uses SMOG (Simple Measure of Gobbledygook) Index
 */

/**
 * Count syllables in a word
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  const vowels = 'aeiouy';
  let syllableCount = 0;
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      syllableCount++;
    }
    previousWasVowel = isVowel;
  }

  if (word.endsWith('e')) {
    syllableCount--;
  }

  if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
    syllableCount++;
  }

  return Math.max(1, syllableCount);
}

/**
 * Count sentences in text
 */
function countSentences(text: string): number {
  const sentences = text.match(/[.!?]+/g);
  return sentences ? sentences.length : 1;
}

/**
 * Count polysyllabic words (3 or more syllables)
 */
function countPolysyllabicWords(text: string): number {
  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  return words.filter(word => countSyllables(word) >= 3).length;
}

/**
 * Calculate SMOG reading grade level
 * Formula: SMOG grade = 3 + sqrt(polysyllable count × 30 / sentence count)
 */
export function calculateSMOGLevel(text: string): number {
  if (!text || text.trim().length < 10) {
    return 8;
  }

  const sentences = countSentences(text);
  const polysyllables = countPolysyllabicWords(text);

  if (sentences === 0) return 8;

  const smog = 3 + Math.sqrt((polysyllables * 30) / sentences);

  return Math.max(6, Math.min(18, Math.round(smog)));
}

/**
 * Convert SMOG grade to reading level description
 */
export function getReadingLevelDescription(grade: number): string {
  if (grade <= 8) return 'Middle School';
  if (grade <= 12) return 'High School';
  return 'College';
}

/**
 * Analyze text and return reading level with confidence
 */
export interface ReadingLevelAnalysis {
  grade: number;
  description: string;
  confidence: 'low' | 'medium' | 'high';
  wordCount: number;
}

export function analyzeReadingLevel(text: string): ReadingLevelAnalysis {
  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  const wordCount = words.length;

  let confidence: 'low' | 'medium' | 'high';
  if (wordCount < 20) {
    confidence = 'low';
  } else if (wordCount < 50) {
    confidence = 'medium';
  } else {
    confidence = 'high';
  }

  const grade = calculateSMOGLevel(text);
  const description = getReadingLevelDescription(grade);

  return {
    grade,
    description,
    confidence,
    wordCount,
  };
}
