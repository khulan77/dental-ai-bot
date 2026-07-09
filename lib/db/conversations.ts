import { createAdminClient } from '@/lib/db/supabase';
import type { Message, Conversation } from '@/types/database';

/**
 * DM (Instagram/Messenger) харилцааны түүхийг хадгалах helper-үүд.
 * Вэб чат түүхээ клиент талд хадгалдаг бол DM-д сервер тал хадгалах ёстой.
 */

/**
 * Тухайн хэрэглэгчийн идэвхтэй харилцааг олох, эс бөгөөс шинээр үүсгэх.
 */
export async function getOrCreateConversation(
  clinicId: string,
  messengerId: string,
  channel: 'instagram' | 'messenger'
): Promise<Conversation> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('customer_messenger_id', messengerId)
    .maybeSingle();

  if (existing) return existing as Conversation;

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({
      clinic_id: clinicId,
      customer_messenger_id: messengerId,
      channel,
      messages: [],
      status: 'active',
    })
    .select('*')
    .single();

  if (error) throw error;
  return created as Conversation;
}

/**
 * Харилцаанд шинэ мессежүүд нэмж, last_message_at-г шинэчлэх.
 */
export async function appendMessages(
  conversationId: string,
  existing: Message[],
  newMessages: Message[]
): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from('conversations')
    .update({
      messages: [...existing, ...newMessages],
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId);
}
