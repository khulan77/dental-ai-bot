import { openai, AI_MODEL } from './client';
import type { Clinic, Message } from '@/types/database';
import { findCachedReply, cacheReply } from './cache';
import { getAvailableSlotsForBot } from '@/lib/booking/slots';
import { createAdminClient } from '@/lib/db/supabase';

export type BookingData = {

  service: string;
  doctor_name?: string;
  customer_name: string;
  customer_phone: string;
  scheduled_at: string;
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

  return `Чи "${clinic.name}"-ийн AI захиалгын туслах. ГОЛ ЗОРИЛГО: Хэрэглэгчийн цаг захиалгыг бүрэн дуусгах.

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
1. Зөвхөн монгол хэлээр хариул
2. Товч (1-3 өгүүлбэр), эелдэг найрсаг
3. Үйлчилгээний үнэ, цагийг л өгсөн мэдээллээс хариул, үнэгүй санал болгохгүй
4. Цаг сонгоход ӨГСӨН СУЛ ЦАГУУДААС л санал болго (өөр цаг бодож болохгүй)
5. Эмчийн талаар зөвхөн ӨГСӨН ЭМЧ НАРЫН МЭДЭЭЛЛЭЭС хариул

ЗАХИАЛГЫН ДҮРМҮҮД (заавал дагах):
6. Хэрэглэгч ямар ч мессеж илгээсэн бай — цаг захиалгын мэдээлэл цуглуулахыг хичээ
7. Асуулт хариулсны дараа ЗААВАЛ "Цаг захиалъя уу?" гэж санал болго
8. Захиалгын мэдээлэл дараалан цуглуул: 1) Ямар үйлчилгээ? 2) Аль эмч? 3) Хэзээ? 4) Нэр? 5) Утас?
9. Customer тодорхой эмч сонгоогүй бол хамгийн сул байгаа эмчийг санал болго
10. Ажлын цагнаас гадуур бол маргааш эсвэл дараагийн ажлын өдөрт санал болго
11. Нэр, утас, цаг, үйлчилгээ БҮГД бэлэн болмогц хариултын төгсгөлд [BOOKING]...[/BOOKING] tag оруул

[BOOKING] format:
{
  "customer_name": "...",
  "customer_phone": "...",
  "scheduled_at": "2026-MM-DDTHH:MM:00+08:00",
  "service": "...",
  "doctor_name": "..."
}`;
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

  // Эмчийг дурдаж байна уу?
  const mentioningDoctor = /эмч|доктор|анү|бат|сараа|ану/i.test(userMessage);

  let availableSlotsInfo = '';
  let doctorsInfo = '';

  // Эмч нарын мэдээлэл болон сул цагуудыг бүх мессежд ачаалах
  const supabase = createAdminClient();
  const [{ data: doctors }, ...slotResults] = await Promise.all([
    supabase
      .from('doctors')
      .select('id, name, specialty, service_ids, custom_hours')
      .eq('clinic_id', clinic.id)
      .eq('is_active', true)
      .order('display_order'),
    getAvailableSlotsForBot(clinic.id, (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })()),
    getAvailableSlotsForBot(clinic.id, (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d; })()),
    getAvailableSlotsForBot(clinic.id, (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d; })()),
  ]);

  if (doctors && doctors.length > 0) {
    const services = (clinic.services ?? []) as Array<{ id: string; name: string }>;

    doctorsInfo = '\n\nЭМНЭЛГИЙН ЭМЧ НАР:\n';
    doctors.forEach(d => {
      const serviceIds = (d.service_ids ?? []) as string[];
      const serviceNames =
        serviceIds.length === 0
          ? 'бүх үйлчилгээ'
          : serviceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ');

      const hours = d.custom_hours ? 'өөрийн хуваарьтай' : 'клиникийн ажлын цагтай';
      doctorsInfo += `  • ${d.name}${d.specialty ? ` (${d.specialty})` : ''} — Хийдэг: ${serviceNames}. ${hours}\n`;
    });
  }

  const [tomSlots, dayAfterSlots, day3Slots] = slotResults;
  availableSlotsInfo = `\n\nДАРААГИЙН 3 ӨДРИЙН СУЛ ЦАГУУД (эмч тус бүрээр):\n${tomSlots}\n\n${dayAfterSlots}\n\n${day3Slots}\n\nЗөвхөн эдгээр цагуудаас санал болго! Эмчийн нэрийг заавал дурд.`;

  const systemPrompt = buildSystemPrompt(clinic) + doctorsInfo + availableSlotsInfo;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 400,
  });

  const fullReply = response.choices[0]?.message?.content ?? 'Уучлаарай, дахин оролдоно уу.';
  const booking = extractBooking(fullReply);
  const cleanReply = fullReply.replace(/\[BOOKING\][\s\S]*?\[\/BOOKING\]/, '').trim();

  if (isFirstMessage && !booking && !mentioningDoctor) {
    void cacheReply(clinic.id, userMessage, cleanReply);
  }

  return { reply: cleanReply, booking, source: 'openai' };
}

function extractBooking(text: string): BookingData | undefined {
  const match = text.match(/\[BOOKING\]([\s\S]*?)\[\/BOOKING\]/);
  if (!match) return undefined;

  try {
    const parsed = JSON.parse(match[1].trim());
    
    // Бүх шаардлагатай field байгаа эсэхийг шалгах
    if (
      !parsed.customer_name ||
      !parsed.customer_phone ||
      !parsed.scheduled_at ||
      !parsed.service
    ) {
      return undefined;
    }

    return {
      customer_name: parsed.customer_name,
      customer_phone: parsed.customer_phone,
      scheduled_at: parsed.scheduled_at,
      service: parsed.service,
      doctor_name: parsed.doctor_name,
    };
  } catch {
    return undefined;
  }
}