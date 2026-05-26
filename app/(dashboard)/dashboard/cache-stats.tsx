import type { CacheStats } from '@/lib/dashboard/stats';

export default function CacheStatsCard({ stats }: { stats: CacheStats }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/60 p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">⚡</span>
        <div>
          <h3 className="font-bold text-purple-900">AI Хэмнэлт</h3>
          <p className="text-xs text-purple-700">Сүүлийн 30 хоног</p>
        </div>
      </div>

      <div className="space-y-3">
        <StatRow
          label="Хэмнэсэн зардал"
          value={`₮${Math.round(stats.savedMnt).toLocaleString()}`}
          accent
        />
        <StatRow
          label="Cache hit rate"
          value={`${stats.hitRate.toFixed(0)}%`}
        />
        <StatRow
          label="Хадгалсан асуулт"
          value={stats.totalCached.toString()}
        />
        <StatRow
          label="Cache hit"
          value={stats.totalHits.toString()}
        />
        <StatRow
          label="Дундаж хариу"
          value={`${stats.avgResponseMs}ms`}
        />
      </div>

      {stats.totalHits > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-200/60">
          <p className="text-[10px] text-purple-700 leading-snug">
            💡 Cache системийн ачаар bot {stats.totalHits} удаа хурдан хариулсан. 
            Энэ нь OpenAI API-аас ₮{Math.round(stats.savedMnt).toLocaleString()} хэмнэсэн.
          </p>
        </div>
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-purple-700">{label}</span>
      <span
        className={`text-sm font-bold ${
          accent ? 'text-purple-900 text-base' : 'text-purple-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}