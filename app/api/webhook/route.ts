import { createAdminClient } from '@/lib/db/supabase';
import { generateReply } from '@/lib/ai/conversation';
import { isSlotAvailable } from '@/lib/booking/slots';
import { getOrCreateConversation, appendMessages } from '@/lib/db/conversations';
import { verifyMetaSignature, sendTextMessage } from '@/lib/meta/graph';
import type { Clinic, Message } from '@/types/database';

/**
 * GET /api/webhook — Meta webhook баталгаажуулалт.
 * Meta hub.verify_token илгээх бөгөөд бидний META_VERIFY_TOKEN-той тааралдвал
 * hub.challenge-г буцаана.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge ?? '', { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

/**
 * POST /api/webhook — Instagram/Messenger DM хүлээн авч, бот хариулна.
 * Meta хурдан 200 хүлээдэг тул алдаа гарсан ч 200 буцаана (retry-storm-оос сэргийлж).
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  // 1. Гарын үсэг шалгах — Meta-аас ирсэн эсэхийг баталгаажуулах
  const signature = request.headers.get('x-hub-signature-256');
  if (!verifyMetaSignature(rawBody, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  let payload: MetaWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const channel: 'instagram' | 'messenger' =
    payload.object === 'instagram' ? 'instagram' : 'messenger';

  try {
    for (const entry of payload.entry ?? []) {
      const pageId = entry.id;
      for (const event of entry.messaging ?? []) {
        await handleMessagingEvent(pageId, channel, event);
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }

  // Meta-д үргэлж 200 буцаана
  return new Response('EVENT_RECEIVED', { status: 200 });
}

async function handleMessagingEvent(
  pageId: string,
  channel: 'instagram' | 'messenger',
  event: MetaMessagingEvent
): Promise<void> {
  // Зөвхөн текст мессежид хариулна (echo, delivery, reaction зэргийг алгасна)
  const text = event.message?.text?.trim();
  if (!text || event.message?.is_echo) return;

  const senderId = event.sender?.id;
  if (!senderId) return;

  const supabase = createAdminClient();

  // Хуудасны ID-аар клиникийг олох
  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('instagram_page_id', pageId)
    .maybeSingle();

  const pageToken = clinic?.meta_page_access_token as string | null | undefined;
  if (!clinic || !pageToken) {
    console.warn(`Webhook: клиник эсвэл access token олдсонгүй (pageId=${pageId})`);
    return;
  }

  const typedClinic = clinic as Clinic;

  // Харилцааны түүхийг ачаалах
  const conversation = await getOrCreateConversation(typedClinic.id, senderId, channel);
  const history = (conversation.messages ?? []) as Message[];

  // Бот хариулт үүсгэх
  const { reply: aiReply, booking } = await generateReply(typedClinic, history, text);
  let reply = aiReply;

  // Захиалга гарвал давхцал шалгаад insert хийх
  if (booking) {
    let doctorId: string | null = null;
    if (booking.doctor_name) {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('clinic_id', typedClinic.id)
        .ilike('name', `%${booking.doctor_name}%`)
        .single();
      doctorId = doctor?.id ?? null;
    }

    const available = await isSlotAvailable(typedClinic.id, doctorId, booking.scheduled_at);
    if (available) {
      await supabase.from('appointments').insert({
        clinic_id: typedClinic.id,
        conversation_id: conversation.id,
        doctor_id: doctorId,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        service: booking.service,
        scheduled_at: booking.scheduled_at,
        status: 'confirmed',
      });
      await supabase
        .from('conversations')
        .update({ status: 'booked' })
        .eq('id', conversation.id);
    } else {
      reply = 'Уучлаарай, энэ цаг аль хэдийн захиалагдсан байна. Өөр цаг сонгоно уу.';
    }
  }

  // Хариултыг хэрэглэгч рүү илгээх
  await sendTextMessage(pageToken, senderId, reply);

  // Түүхэнд хадгалах
  const now = new Date().toISOString();
  await appendMessages(conversation.id, history, [
    { role: 'user', content: text, timestamp: now },
    { role: 'assistant', content: reply, timestamp: now },
  ]);
}

// ── Meta webhook payload төрлүүд ────────────────────────────────────
type MetaWebhookPayload = {
  object?: string;
  entry?: MetaEntry[];
};

type MetaEntry = {
  id: string;
  messaging?: MetaMessagingEvent[];
};

type MetaMessagingEvent = {
  sender?: { id: string };
  recipient?: { id: string };
  message?: { text?: string; is_echo?: boolean };
};
