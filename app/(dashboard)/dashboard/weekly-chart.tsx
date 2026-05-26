'use client';

import type { DailyStat } from '@/lib/dashboard/stats';

export default function WeeklyChart({ data }: { data: DailyStat[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900">7 хоногийн trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Захиалга {totalCount}, Орлого ₮{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-blue-500 to-indigo-500"></div>
            <span className="text-slate-600">Захиалга</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-48 mb-2">
        {data.map((day, idx) => {
          const heightPct = (day.count / maxCount) * 100;
          const isToday = idx === data.length - 1;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 h-full">
              <div className="flex-1 w-full flex items-end relative group">
                {day.count > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                    {day.count} цаг • ₮{day.revenue.toLocaleString()}
                  </div>
                )}
                <div
                  className={`w-full rounded-t-lg transition-all hover:opacity-80 ${
                    isToday
                      ? 'bg-gradient-to-t from-indigo-500 to-purple-500'
                      : 'bg-gradient-to-t from-blue-500 to-indigo-500'
                  }`}
                  style={{
                    height: day.count > 0 ? `${Math.max(heightPct, 5)}%` : '2px',
                    opacity: day.count === 0 ? 0.2 : 1,
                  }}
                />
              </div>
              <div className="text-center">
                <p className={`text-[10px] font-medium ${isToday ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {day.label}
                </p>
                <p className="text-[10px] text-slate-400">
                  {new Date(day.date).getDate()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}