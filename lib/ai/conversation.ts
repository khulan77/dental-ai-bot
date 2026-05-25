import { openai, AI_MODEL } from './client';
import type { Clinic, Message } from '@/types/database';
import { findCachedReply, cacheReply } from './cache';
import { getAvailableSlotsForBot } from '@/lib/booking/slots';

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

  // Клиникийн мэдээллийг нэгтгэх (хоосон field-үүдийг алгасна)
  const clinicInfo = [
    (clinic as any).about && `ТУХАЙ: ${(clinic as any).about}`,
    (clinic as any).address && `ХАЯГ: ${(clinic as any).address}`,
    clinic.owner_phone && `УТАС: ${clinic.owner_phone}`,
    clinic.owner_email && `ИМЭЙЛ: ${clinic.owner_email}`,
    (clinic as any).website && `ВЭБ САЙТ: ${(clinic as any).website}`,
    (clinic as any).facebook_url && `FACEBOOK: ${(clinic as any).facebook_url}`,
    (clinic as any).instagram_url && `INSTAGRAM: ${(clinic as any).instagram_url}`,
  ].filter(Boolean).join('\n');

  return `Чи "${clinic.name}"-ийн AI туслах. Зорилго: үйлчлүүлэгчтэй ярилцаж, цаг захиалга авах.

ӨНӨӨДРИЙН ОГНОО: ${todayISO}
МАРГААШ: ${tomorrowISO}
НӨГӨӨДӨР: ${dayAfterISO}

КЛИНИКИЙН МЭДЭЭЛЭЛ:
${clinicInfo || 'Тодорхой мэдээлэл байхгүй'}

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
9. Тодорхойгүй бол асуу, таамаглах хэрэггүй.
10. Хаяг, утас, веб сайт, сошиал хаяг асуувал — КЛИНИКИЙН МЭДЭЭЛЭЛ хэсгээс шууд хэл.
11. "Тухай" асуувал клиникийн ТУХАЙ хэсгийг ашиглан товч танилцуулга өг.`;
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

  // ШИНЭ: Сул цагуудыг авах (хэрэв хэрэглэгч цагтай холбоотой асуувал)
  const askingAboutTime = /цаг|маргааш|өчигдөр|өнөөдөр|нөгөөдөр|сул|захиал|book/i.test(userMessage);
  
  let availableSlotsInfo = '';
  if (askingAboutTime) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const day3 = new Date();
    day3.setDate(day3.getDate() + 3);

    const [tomSlots, dayAfterSlots, day3Slots] = await Promise.all([
      getAvailableSlotsForBot(clinic.id, tomorrow),
      getAvailableSlotsForBot(clinic.id, dayAfter),
      getAvailableSlotsForBot(clinic.id, day3),
    ]);

    availableSlotsInfo = `\n\nДАРААГИЙН 3 ӨДРИЙН СУЛ ЦАГУУД:\n${tomSlots}\n${dayAfterSlots}\n${day3Slots}\n\nҮүнээс гадуур огт цаг санал болгож БОЛОХГҮЙ!`;
  }

  const systemPrompt = buildSystemPrompt(clinic) + availableSlotsInfo;

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
  const cleanReply = fullReply.replace(/\[BOOKING\][\s\S]*?\[\/BOOKING\]/, '').trim();

  // Цагтай холбоотой асуултын хариуг cache хийхгүй (огноо өөрчлөгддөг)
  if (isFirstMessage && !booking && !askingAboutTime) {
    void cacheReply(clinic.id, userMessage, cleanReply);
  }

  return { reply: cleanReply, booking, source: 'openai' };
}

function extractBooking(text: string): BookingData | undefined {
  const match = text.match(/\[BOOKING\]([\s\S]*?)\[\/BOOKING\]/);
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