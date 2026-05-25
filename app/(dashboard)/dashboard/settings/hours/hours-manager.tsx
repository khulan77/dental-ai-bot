'use client';

import { useState } from 'react';
import { updateBusinessHours } from '@/lib/db/clinic-actions';
import type { BusinessHoursData, DayHours } from '@/lib/db/clinic-actions';

const DAYS: { key: keyof BusinessHoursData; label: string }[] = [
  { key: 'mon', label: 'Даваа' },
  { key: 'tue', label: 'Мягмар' },
  { key: 'wed', label: 'Лхагва' },
  { key: 'thu', label: 'Пүрэв' },
  { key: 'fri', label: 'Баасан' },
  { key: 'sat', label: 'Бямба' },
  { key: 'sun', label: 'Ням' },
];

// Цагийн сонголтууд (06:00 - 23:30, 30 минут тутамд)
const TIME_OPTIONS = (() => {
  const options: string[] = [];
  for (let hour = 6; hour < 24; hour++) {
    options.push(`${hour.toString().padStart(2, '0')}:00`);
    options.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return options;
})();

export default function HoursManager({
  clinicId,
  initialHours,
}: {
  clinicId: string;
  initialHours: BusinessHoursData;
}) {
  const [hours, setHours] = useState<BusinessHoursData>(initialHours);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function toggleDay(day: keyof BusinessHoursData) {
    setHours(prev => ({
      ...prev,
      [day]: prev[day] === null ? { open: '09:00', close: '18:00' } : null,
    }));
  }

  function updateTime(
    day: keyof BusinessHoursData,
    field: 'open' | 'close',
    value: string
  ) {
    setHours(prev => {
      const current = prev[day];
      if (!current) return prev;
      return {
        ...prev,
        [day]: { ...current, [field]: value },
      };
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const result = await updateBusinessHours(clinicId, hours);

    if (result.success) {
      setMessage({ type: 'success', text: 'Ажлын цаг амжилттай хадгалагдлаа!' });
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Алдаа гарлаа' });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  }

  function applyToWeekdays() {
    const mondayHours = hours.mon;
    if (!mondayHours) {
      setMessage({ type: 'error', text: 'Эхлээд Даваа гаригийн цагаа тохируулна уу' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setHours(prev => ({
      ...prev,
      tue: { ...mondayHours },
      wed: { ...mondayHours },
      thu: { ...mondayHours },
      fri: { ...mondayHours },
    }));
  }

  return (
    <div className="space-y-4">
      {/* Quick action */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-900">⚡ Хурдан тохиргоо</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Даваа гаригийн цагийг ажлын өдрүүдэд хуулна
          </p>
        </div>
        <button
          onClick={applyToWeekdays}
          className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-50 transition"
        >
          Даваа → Бүх өдөр
        </button>
      </div>

      {/* Days list */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {DAYS.map((day, idx) => {
          const dayHours = hours[day.key];
          const isOpen = dayHours !== null;

          return (
            <div
              key={day.key}
              className={`flex items-center justify-between p-4 ${
                idx < DAYS.length - 1 ? 'border-b border-slate-100' : ''
              } ${isOpen ? 'bg-white' : 'bg-slate-50/50'}`}
            >
              {/* Day name + toggle */}
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleDay(day.key)}
                  className={`relative w-11 h-6 rounded-full transition ${
                    isOpen ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      isOpen ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span
                  className={`font-medium ${
                    isOpen ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {day.label}
                </span>
              </div>

              {/* Time selectors or "Амарна" */}
              {isOpen ? (
                <div className="flex items-center gap-2">
                  <select
                    value={dayHours.open}
                    onChange={e => updateTime(day.key, 'open', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TIME_OPTIONS.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <span className="text-slate-400 text-sm">—</span>

                  <select
                    value={dayHours.close}
                    onChange={e => updateTime(day.key, 'close', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TIME_OPTIONS.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-sm text-slate-400 italic">Амарна</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md disabled:opacity-50 transition-all"
        >
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>

        {message && (
          <div
            className={`text-sm font-medium ${
              message.type === 'success' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {message.type === 'success' ? '✓' : '⚠️'} {message.text}
          </div>
        )}
      </div>
    </div>
  );
}