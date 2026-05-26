import type { DoctorStat } from '@/lib/dashboard/stats';

const COLORS = [
  { bg: 'from-blue-500 to-cyan-500', light: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
  { bg: 'from-purple-500 to-pink-500', light: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500' },
  { bg: 'from-emerald-500 to-teal-500', light: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  { bg: 'from-orange-500 to-amber-500', light: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500' },
  { bg: 'from-rose-500 to-red-500', light: 'bg-rose-50', text: 'text-rose-700', bar: 'bg-rose-500' },
];

export default function DoctorStats({ doctors }: { doctors: DoctorStat[] }) {
  const maxRevenue = Math.max(...doctors.map(d => d.totalRevenue), 1);
  const totalRevenue = doctors.reduce((sum, d) => sum + d.totalRevenue, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-slate-900">👨‍⚕️ Эмч тус бүрийн ажиллагаа</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Нийт орлого ₮{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-2">👨‍⚕️</p>
          <p className="text-sm">Эмч хараахан байхгүй</p>
          <p className="text-xs mt-1">
            Settings → Эмч нар хэсгээс нэмнэ үү
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor, idx) => {
            const color = COLORS[idx % COLORS.length];
            const widthPct = (doctor.totalRevenue / maxRevenue) * 100;
            const percentage = totalRevenue > 0
              ? ((doctor.totalRevenue / totalRevenue) * 100).toFixed(0)
              : '0';

            return (
              <div
                key={doctor.id}
                className={`rounded-xl border p-4 ${color.light} border-slate-200`}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center text-white font-bold shadow-sm`}
                  >
                    {doctor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold ${color.text}`}>
                        {doctor.name}
                      </p>
                      {doctor.specialty && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-white rounded text-slate-600 font-medium">
                          {doctor.specialty}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doctor.appointmentCount} нийт захиалга •{' '}
                      {doctor.thisWeekCount} энэ 7 хоногт
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${color.text}`}>
                      ₮{doctor.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {percentage}% нийтээс
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color.bar} transition-all duration-500 rounded-full`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/60 text-xs">
                  <div>
                    <span className="text-slate-500">Дундаж захиалга:</span>{' '}
                    <span className="font-semibold text-slate-700">
                      ₮{doctor.avgRevenuePerBooking.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">7 хоног:</span>{' '}
                    <span className="font-semibold text-slate-700">
                      ₮{doctor.thisWeekRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}