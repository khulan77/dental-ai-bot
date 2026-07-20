'use client';

import { useState } from 'react';
import type { BusinessHoursData } from '@/lib/db/clinic-actions';

type Service = {
  id: string;
  name: string;
};

type DoctorFormData = {
  name: string;
  specialty: string;
  email: string;
  bio: string;
  service_ids: string[];
  custom_hours: BusinessHoursData | null;
};

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

export default function DoctorForm({
  initialData,
  services,
  clinicHours,
  onCancel,
  onSubmit,
  loading,
  submitLabel,
}: {
  initialData?: {
    name: string;
    specialty: string | null;
    email?: string | null;
    bio: string | null;
    service_ids: string[];
    custom_hours: BusinessHoursData | null;
  };
  services: Service[];
  clinicHours: BusinessHoursData;
  onCancel: () => void;
  onSubmit: (data: DoctorFormData) => void;
  loading: boolean;
  submitLabel: string;
}) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [specialty, setSpecialty] = useState(initialData?.specialty ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [bio, setBio] = useState(initialData?.bio ?? '');
  const [allServices, setAllServices] = useState(
    initialData?.service_ids.length === 0 || !initialData
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialData?.service_ids ?? []
  );
  const [useCustomHours, setUseCustomHours] = useState(
    initialData?.custom_hours !== null && initialData?.custom_hours !== undefined
  );
  const [customHours, setCustomHours] = useState<BusinessHoursData>(
    initialData?.custom_hours ?? clinicHours
  );

  function toggleService(serviceId: string) {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  }

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
      specialty: specialty.trim(),
      email: email.trim(),
      bio: bio.trim(),
      service_ids: allServices ? [] : selectedServiceIds,
      custom_hours: useCustomHours ? customHours : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Үндсэн мэдээлэл */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Нэр</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Жнь: Ану эмч"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Мэргэжил</label>
          <input
            type="text"
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
            placeholder="Жнь: Терапевт, Ортодонт, Хирург"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Имэйл (заавал биш)
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Жнь: anu@emneleg.mn"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Энэ эмчид цаг захиалагдвал энэ хаяг руу мэдэгдэл очно. Хоосон бол зөвхөн
            эмнэлгийн эзэн мэдэгдэл авна.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Тухай (заавал биш)
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Жнь: 10 жилийн туршлагатай. Шүдний цайруулах мэргэжилтэн."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Үйлчилгээ */}
      <div className="bg-white rounded-lg border border-slate-200 p-3">
        <p className="text-xs font-medium text-slate-700 mb-2">Хийдэг үйлчилгээ</p>

        <label className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={allServices}
            onChange={e => setAllServices(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-sm font-medium">✨ Бүх үйлчилгээг хийнэ</span>
        </label>

        {!allServices && (
          <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
            {services.length === 0 ? (
              <p className="text-xs text-slate-400 p-2">
                Эхлээд "Үйлчилгээ" tab-аас үйлчилгээ нэмнэ үү
              </p>
            ) : (
              services.map(service => (
                <label
                  key={service.id}
                  className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedServiceIds.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm">{service.name}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Хуваарь */}
      <div className="bg-white rounded-lg border border-slate-200 p-3">
        <p className="text-xs font-medium text-slate-700 mb-2">Хуваарь</p>

        <label className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={!useCustomHours}
            onChange={e => setUseCustomHours(!e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-sm font-medium">
            🕐 Клиникийн ажлын цагтай ижил
          </span>
        </label>

        {useCustomHours && (
          <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
            <p className="text-xs text-slate-500 mb-2">
              Эмчийн өөрийн хуваарийг тохируулна:
            </p>
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

      {/* Submit */}
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