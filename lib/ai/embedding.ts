import { openai } from './client';

const EMBEDDING_MODEL = 'text-embedding-3-small';

/**
 * Текстээс embedding vector үүсгэх.
 * text-embedding-3-small нь 1536 dimension буцаана.
 * Үнэ: $0.02 per 1M tokens (маш хямд)
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim().toLowerCase(),
  });

  return response.data[0].embedding;
}

/**
 * Асуултыг normalize хийх - exact match-д хэрэглэнэ.
 * Жишээ: "Үнэ хэд вэ? " → "үнэ хэд вэ"
 */
export function normalizeQuestion(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[?!.,;:]/g, '')   // тусгай тэмдэгт устгах
    .replace(/\s+/g, ' ');       // олон space → 1 space
}