import type { ActivityItem } from '@/lib/dashboard/stats';

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900">⚡ Сүүлийн үйл явдал</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Реал-тайм activity feed
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-sm">Үйл явдал хараахан байхгүй</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
            >
              <div className="text-xl flex-shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  {formatRelativeTime(item.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Дөнгөж сая';
  if (diffMins < 60) return `${diffMins} минутын өмнө`;
  if (diffHours < 24) return `${diffHours} цагийн өмнө`;
  if (diffDays < 7) return `${diffDays} өдрийн өмнө`;
  return then.toLocaleDateString('mn-MN');
}