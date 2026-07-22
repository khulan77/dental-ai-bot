import { createAdminClient } from '@/lib/db/supabase';
import { clinicDateTimeLabel } from '@/lib/booking/timezone';

export const dynamic = 'force-dynamic';

async function getConversations() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Идэвхтэй', color: 'bg-green-100 text-green-700' },
  booked: { label: 'Цаг авсан', color: 'bg-blue-100 text-blue-700' },
  lost: { label: 'Алдсан', color: 'bg-gray-100 text-gray-700' },
};

export default async function ConversationsPage() {
  const conversations = await getConversations();

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Харилцан яриа</h1>
        <p className="text-gray-500 mt-1">
          Bot-ийн авсан бүх мессеж — нийт {conversations.length}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {conversations.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-2">💬</p>
            <p>Харилцан яриа алга</p>
            <p className="text-sm mt-1">
              Test page-ээс мессеж бичсний дараа энд харагдана
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map(conv => {
              const messages = (conv.messages ?? []) as Array<{
                role: string;
                content: string;
              }>;
              const lastMessage = messages[messages.length - 1];
              const status = statusLabels[conv.status] ?? statusLabels.active;
              const time = new Date(conv.last_message_at);

              return (
                <div
                  key={conv.id}
                  className="p-4 hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                      {conv.customer_name?.charAt(0) ?? '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {conv.customer_name ?? 'Тодорхойгүй'}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {lastMessage?.content ?? 'Мессеж байхгүй'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {clinicDateTimeLabel(time)} • {messages.length} мессеж
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}