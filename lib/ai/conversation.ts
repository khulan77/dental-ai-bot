
import { openai, AI_MODEL } from './client';
import type { Clinic, Message } from '@/types/database';
import { findCachedReply, cacheReply } from './cache';

export type BookingData = {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
};

function buildSystemPrompt(clinic: Clinic): string {
  const servicesList = clinic.services
    .map(s => `- ${s.name}: ${s.price_mnt.toLocaleString()}₮ (${s.duration_minutes} минут)`)
    .join('\n');

  const hoursList = Object.entries(clinic.business_hours)
    .map(([day, hours]) => {
      const dayMn: Record<string, string> = {
        mon: 'Даваа', tue: 'Мягмар', wed: 'Лхагва', thu: 'Пүрэв',
        fri: 'Баасан', sat: 'Бямба', sun: 'Ням'
      };
      if (!hours) return `${dayMn[day]}: Амарна`;
      return `${dayMn[day]}: ${hours.open} - ${hours.close}`;
    })
    .join('\n');

  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterISO = dayAfter.toISOString().split('T')[0];

  return `Чи "${clinic.name}"-ийн AI туслах. Зорилго: үйлчлүүлэгчтэй ярилцаж, цаг захиалга авах.

ӨНӨӨДРИЙН ОГНОО: ${todayISO}
МАРГААШ: ${tomorrowISO}
НӨГӨӨДӨР: ${dayAfterISO}

ҮЙЛЧИЛГЭЭ БА ҮНЭ:
${servicesList}

АЖЛЫН ЦАГ:
${hoursList}

ХАРИЛЦАХ ХЭВ МАЯГ: ${clinic.bot_personality}

ДҮРМҮҮД:
1. Үргэлж монгол хэлээр хариул.
2. Богино, эелдэг хариулт өг (2-3 өгүүлбэр).
3. Үнэ асуувал шууд хэл, тоог ₮ тэмдэгтэй бич.
4. Цаг авах хүсэлтэй бол: нэр, утас, үйлчилгээ, өдөр, цаг асуу.
5. Эмчилгээний нарийн зөвлөгөө битгий өг.
6. ОГНООГ ӨГӨХ ҮЕД заавал ${todayISO}-аас хойших огноо өг. 2023, 2024 он ХЭРЭГЛЭХГҮЙ!
7. "Маргааш" гэвэл ${tomorrowISO}, "Нөгөөдөр" гэвэл ${dayAfterISO}.
8. Цаг захиалах бүх мэдээлэл цуглуулсан бол төгсгөлд:
[BOOKING]{"name": "...", "phone": "...", "service": "...", "date": "YYYY-MM-DD", "time": "HH:MM"}[/BOOKING]
9. Тодорхойгүй бол асуу, таамаглах хэрэггүй.`;
}


export async function generateReply(
  clinic: Clinic,
  history: Message[],
  userMessage: string
): Promise<{
  reply: string;
  booking?: BookingData;
  source: 'cache_exact' | 'cache_semantic' | 'openai';
  similarity?: number;
}> {
  // 1. Эхний мессеж байж history хоосон бол cache шалгана
  // (Дунд яриа дотор cache хэрэглэхгүй — context чухал)
  const isFirstMessage = history.length === 0;

  if (isFirstMessage) {
    const cached = await findCachedReply(clinic.id, userMessage);
    
    if (cached) {
      console.log(`✨ Cache hit (${cached.source})`, cached.similarity ?? '');
      return {
        reply: cached.reply,
        source: cached.source === 'exact' ? 'cache_exact' : 'cache_semantic',
        similarity: cached.similarity,
      };
    }
  }

  // 2. Cache miss — OpenAI дуудна
  const systemPrompt = buildSystemPrompt(clinic);

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.map(m => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 300,
  });

  const fullReply = response.choices[0]?.message?.content ?? 'Уучлаарай, дахин оролдоно уу.';
  const booking = extractBooking(fullReply);
  const cleanReply = fullReply.replace(/\[BOOKING\].*?\[\/BOOKING\]/s, '').trim();

  // 3. Cache-д хадгалах (background-д, response блоклохгүй)
  if (isFirstMessage && !booking) {
    void cacheReply(clinic.id, userMessage, cleanReply);
  }

  return { reply: cleanReply, booking, source: 'openai' };
}

// ... extractBooking функц өмнөхтэй ижил үлдээ ...

function extractBooking(text: string): BookingData | undefined {
  const match = text.match(/\[BOOKING\](.*?)\[\/BOOKING\]/s);
  if (!match) return undefined;

  try {
    const parsed = JSON.parse(match[1]);
    if (parsed.name && parsed.phone && parsed.service && parsed.date && parsed.time) {
      return parsed as BookingData;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
