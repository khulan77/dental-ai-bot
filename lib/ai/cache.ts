import { createAdminClient } from '@/lib/db/supabase';
import { createEmbedding, normalizeQuestion } from './embedding';

const SIMILARITY_THRESHOLD = 0.92; // 92%+ ижил гэж үзнэ

export type CacheHit = {
  reply: string;
  source: 'exact' | 'semantic';
  similarity?: number;
  matchedQuestion?: string;
};

/**
 * Cache-ээс асуултын хариуг хайх.
 * Эхлээд exact match, дараа нь semantic.
 */
export async function findCachedReply(
  clinicId: string,
  question: string
): Promise<CacheHit | null> {
  const supabase = createAdminClient();
  const normalized = normalizeQuestion(question);

  // 1. EXACT MATCH (хурдан, хямд)
  const { data: exactMatch } = await supabase
    .from('response_cache')
    .select('id, reply')
    .eq('clinic_id', clinicId)
    .eq('question_normalized', normalized)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (exactMatch) {
    // Hit counter нэмэх (background-д, хариулт хүлээхгүй)
    void supabase.rpc('increment_cache_hit', { p_cache_id: exactMatch.id });
    
    return {
      reply: exactMatch.reply,
      source: 'exact',
    };
  }

  // 2. SEMANTIC SEARCH (илүү ухаалаг)
  try {
    const embedding = await createEmbedding(normalized);

    const { data: semanticMatch } = await supabase.rpc('search_cache', {
      p_clinic_id: clinicId,
      p_query_embedding: embedding,
      p_threshold: SIMILARITY_THRESHOLD,
      p_limit: 1,
    });

    if (semanticMatch && semanticMatch.length > 0) {
      const match = semanticMatch[0];
      void supabase.rpc('increment_cache_hit', { p_cache_id: match.id });

      return {
        reply: match.reply,
        source: 'semantic',
        similarity: match.similarity,
        matchedQuestion: match.question,
      };
    }
  } catch (error) {
    // Embedding эсвэл search алдвал — OpenAI рүү буцаана
    console.error('Semantic search failed:', error);
  }

  return null;
}

/**
 * Хариултыг cache-д хадгалах.
 * Зөвхөн "общие" асуултыг хадгалах — хувийн мэдээлэл бүхий хариултыг ХАДГАЛАХГҮЙ.
 */
export async function cacheReply(
  clinicId: string,
  question: string,
  reply: string
): Promise<void> {
  // Cache хийх ёсгүй мессежүүдийг шалгах
  if (!shouldCache(question, reply)) {
    return;
  }

  try {
    const normalized = normalizeQuestion(question);
    const embedding = await createEmbedding(normalized);

    const supabase = createAdminClient();
    await supabase.from('response_cache').insert({
      clinic_id: clinicId,
      question,
      question_normalized: normalized,
      question_embedding: embedding,
      reply,
    });
  } catch (error) {
    // Cache write fail болсон ч bot үргэлжлүүлэн ажиллах ёстой
    console.error('Failed to cache reply:', error);
  }
}

/**
 * Cache хийж болох эсэхийг шалгах.
 */
function shouldCache(question: string, reply: string): boolean {
  // Хэт богино асуулт болих
  if (question.trim().length < 3) return false;
  if (question.trim().length > 200) return false;

  // Booking агуулсан хариулт — cache хийхгүй
  if (reply.includes('[BOOKING]')) return false;

  // Хувийн нэр, утасны дугаар бүхий асуулт — cache хийхгүй
  const phonePattern = /\d{8}/;  // 8 оронтой тоо = утас
  const namePattern = /намайг|нэр маань|би.*гэдэг/i;
  
  if (phonePattern.test(question) || namePattern.test(question)) {
    return false;
  }

  // Огноо/цаг өвөрмөц бүхий асуулт — cache хийхгүй
  if (/маргааш|өчигдөр|өнөөдөр|нөгөөдөр|\d{1,2}:\d{2}/i.test(question)) {
    return false;
  }

  return true;
}

/**
 * Клиникийн бүх cache устгах (үнэ/үйлчилгээ өөрчилсөн үед).
 */
export async function invalidateClinicCache(clinicId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from('response_cache')
    .delete()
    .eq('clinic_id', clinicId);
}

/**
 * Cache статистик авах.
 */
export async function getCacheStats(clinicId: string) {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('response_cache')
    .select('hit_count, created_at')
    .eq('clinic_id', clinicId);

  if (error || !data) {
    return { totalCached: 0, totalHits: 0, savingsUsd: 0 };
  }

  const totalCached = data.length;
  const totalHits = data.reduce((sum, c) => sum + (c.hit_count ?? 0), 0);
  
  // GPT-4o-mini average ~$0.0002 per request
  const savingsUsd = totalHits * 0.0002;

  return { totalCached, totalHits, savingsUsd };
}