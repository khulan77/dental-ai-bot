'use client';

import { useState } from 'react';
import type { BusinessHoursData } from '@/lib/db/clinic-actions';

const DAYS: { key: keyof BusinessHoursData; label: string }[] = [
  { key: 'mon', label: 'Даваа' },
  { key: 'tue', label: 'Мягмар' },
  { key: 'wed', label: 'Лхагва' },
  { key: 'thu', label: 'Пүрэв' },
  { key: 'fri', label: 'Баасан' },
  { key: 'sat', label: 'Бямба' },
  { key: 'sun', label: 'Ням' },
];

const TIME_OPTIONS = (() => {
  const options: string[] = [];
  for (let hour = 6; hour < 24; hour++) {
    options.push(`${hour.toString().padStart(2, '0')}:00`);
    options.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return options;
})();

export type BranchFormData = {
  name: string;
  address: string;
  phone: string;
  business_hours: BusinessHoursData | null;
};

export default function BranchForm({
  initialData,
  clinicHours,
  onCancel,
  onSubmit,
  loading,
  submitLabel,
}: {
  initialData?: {
    name: string;
    address: string | null;
    phone: string | null;
    business_hours: BusinessHoursData | null;
  };
  clinicHours: BusinessHoursData;
  onCancel: () => void;
  onSubmit: (data: BranchFormData) => void;
  loading: boolean;
  submitLabel: string;
}) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [phone, setPhone] = useState(initialData?.phone ?? '');
  const [useCustomHours, setUseCustomHours] = useState(
    initialData?.business_hours !== null && initialData?.business_hours !== undefined
  );
  const [customHours, setCustomHours] = useState<BusinessHoursData>(
    initialData?.business_hours ?? clinicHours
  );

  function toggleDay(day: keyof BusinessHoursData) {
    setCustomHours(prev => ({
      ...prev,
      [day]: prev[day] === null ? { open: '09:00', close: '18:00' } : null,
    }));
  }

  function updateTime(day: keyof BusinessHoursData, field: 'open' | 'close', value: string) {
    setCustomHours(prev => {
      const current = prev[day];
      if (!current) return prev;
      return { ...prev, [day]: { ...current, [field]: value } };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      business_hours: useCustomHours ? customHours : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Салбарын нэр</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Жнь: Төв салбар, 2-р салбар"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Хаяг</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Жнь: СБД, 1-р хороо, Энхтайваны өргөн чөлөө 15"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Утас (заавал биш)</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Жнь: 7700 1234"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Ажлын цаг */}
      <div className="bg-white rounded-lg border border-slate-200 p-3">
        <p className="text-xs font-medium text-slate-700 mb-2">Ажлын цаг</p>

        <label className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={!useCustomHours}
            onChange={e => setUseCustomHours(!e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-sm font-medium">🕐 Клиникийн ажлын цагтай ижил</span>
        </label>

        {useCustomHours && (
          <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
            <p className="text-xs text-slate-500 mb-2">Энэ салбарын өөрийн цаг:</p>
            {DAYS.map(day => {
              const dayHours = customHours[day.key];
              const isOpen = dayHours !== null;
              return (
                <div
                  key={day.key}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={`relative w-8 h-4 rounded-full transition ${
                        isOpen ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                          isOpen ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className={`text-xs ${isOpen ? 'text-slate-900' : 'text-slate-400'}`}>
                      {day.label}
                    </span>
                  </div>

                  {isOpen ? (
                    <div className="flex items-center gap-1">
                      <select
                        value={dayHours.open}
                        onChange={e => updateTime(day.key, 'open', e.target.value)}
                        className="px-1.5 py-0.5 rounded border border-slate-200 text-xs bg-white"
                      >
                        {TIME_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span className="text-slate-400 text-xs">—</span>
                      <select
                        value={dayHours.close}
                        onChange={e => updateTime(day.key, 'close', e.target.value)}
                        className="px-1.5 py-0.5 rounded border border-slate-200 text-xs bg-white"
                      >
                        {TIME_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Амарна</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Хадгалж байна...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
        >
          Болих
        </button>
      </div>
    </form>
  );
}
