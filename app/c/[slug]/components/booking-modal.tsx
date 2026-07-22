'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Check } from 'lucide-react';
import type { Doctor, Service } from './types';
import {
  addClinicDays,
  clinicDateISO,
  clinicDayIndex,
  clinicInstantFrom,
} from '@/lib/booking/timezone';

type Props = {
  doctor: Doctor;
  clinicId: string;
  services: Service[];
  initialService?: Service | null;
  onClose: () => void;
};

const DAY_NAMES = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];

export default function BookingModal({ doctor, clinicId, services, initialService, onClose }: Props) {
  const doctorServices =
    doctor.service_ids && doctor.service_ids.length > 0
      ? services.filter(s => doctor.service_ids!.includes(s.id))
      : services;

  // Үйлчилгээнээс дамжиж ирсэн бол түүнийг урьдчилан сонгоно
  const preselected =
    (initialService && doctorServices.find(s => s.id === initialService.id)) ?? doctorServices[0] ?? null;

  // Огноог эмнэлгийн бүсээр — хэрэглэгчийн төхөөрөмжийн бүсээр биш
  const dates = Array.from({ length: 3 }, (_, i) => {
    const d = addClinicDays(new Date(), i);
    return {
      iso: clinicDateISO(d),
      label: i === 0 ? 'Өнөөдөр' : i === 1 ? 'Маргааш' : 'Нөгөөдөр',
      dayName: DAY_NAMES[clinicDayIndex(d)],
    };
  });

  const [selectedService, setSelectedService] = useState<Service | null>(preselected);
  const [selectedDate, setSelectedDate] = useState<string>(dates[1].iso);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingSlots(true);
    setSelectedTime('');
    setSlots([]);
    fetch(`/api/slots?clinicId=${clinicId}&doctorId=${doctor.id}&date=${selectedDate}`)
      .then(r => r.json())
      .then(data => { setSlots(data.slots ?? []); setLoadingSlots(false); })
      .catch(() => setLoadingSlots(false));
  }, [selectedDate, clinicId, doctor.id]);

  async function handleSubmit() {
    if (!selectedService || !selectedDate || !selectedTime || !customerName.trim() || !customerPhone.trim()) {
      setError('Бүх талбарыг бөглөнө үү');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicId,
        doctorId: doctor.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        service: selectedService.name,
        // Сонгосон цаг нь эмнэлгийн ханан дээрх цаг — offset-ийг гараар бичихгүй
        scheduledAt: clinicInstantFrom(selectedDate, selectedTime).toISOString(),
      }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setLoading(false); return; }
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
        <div
          className="site-card w-full max-w-sm p-8 text-center"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-[var(--site-accent-soft)] text-[var(--site-accent)] flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="site-h2 text-[22px] mb-5">Захиалга баталгаажлаа</h3>

          <div className="rounded-[var(--site-r-btn)] border border-[var(--site-line)] divide-y divide-[var(--site-line)] text-left mb-6">
            {[
              ['Эмч', doctor.name],
              ['Үйлчилгээ', selectedService?.name ?? '—'],
              ['Цаг', `${selectedDate} ${selectedTime}`],
              ['Нэр', customerName],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                <span className="text-[13px] text-[var(--site-muted)]">{label}</span>
                <span className="text-[13px] font-medium text-[var(--site-ink)] text-right">{value}</span>
              </div>
            ))}
          </div>

          <p className="site-body mb-5">Удахгүй танд холбогдох болно.</p>
          <button onClick={onClose} className="site-btn w-full">
            Хаах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 sm:p-4" onClick={onClose}>
      <div className="site-modal" onClick={e => e.stopPropagation()}>

        {/* Толгой */}
        <div className="site-modal-head">
          <div className="w-11 h-11 rounded-[var(--site-r-btn)] bg-[var(--site-accent-soft)] text-[var(--site-accent)] flex items-center justify-center font-semibold text-[17px] shrink-0">
            {doctor.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="site-eyebrow mb-0">Цаг захиалах</p>
            <h3 className="site-h3 truncate">{doctor.name}</h3>
            {doctor.specialty && (
              <p className="text-[13px] text-[var(--site-muted)] truncate">{doctor.specialty}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--site-bg-soft)] transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-[var(--site-muted)]" />
          </button>
        </div>

        {/* Гүйдэг хэсэг */}
        <div className="overflow-y-auto flex-1 p-5 space-y-6">

          {/* Үйлчилгээ */}
          <div>
            <p className="site-label">Үйлчилгээ</p>
            <div className="space-y-2">
              {doctorServices.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  aria-pressed={selectedService?.id === s.id}
                  className="site-option w-full flex items-center justify-between p-3.5"
                >
                  <span className="text-[14px] font-medium text-[var(--site-ink)]">{s.name}</span>
                  <span className="text-[14px] font-semibold text-[var(--site-accent)] ml-2 shrink-0">
                    {s.price_mnt.toLocaleString()}₮
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Өдөр */}
          <div>
            <p className="site-label">
              <Calendar className="w-3.5 h-3.5" /> Өдөр
            </p>
            <div className="grid grid-cols-3 gap-2">
              {dates.map(d => (
                <button
                  key={d.iso}
                  onClick={() => setSelectedDate(d.iso)}
                  aria-pressed={selectedDate === d.iso}
                  className="site-option p-3 text-center"
                >
                  <div className="text-[14px] font-medium text-[var(--site-ink)]">{d.label}</div>
                  <div className="text-[12px] text-[var(--site-muted)] mt-0.5">{d.dayName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Сул цаг */}
          <div>
            <p className="site-label">
              <Clock className="w-3.5 h-3.5" /> Сул цагууд
            </p>
            {loadingSlots ? (
              <div className="flex gap-1.5 py-5 justify-center">
                <div className="w-1.5 h-1.5 bg-[var(--site-accent)] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[var(--site-accent)] rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-1.5 h-1.5 bg-[var(--site-accent)] rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            ) : slots.length === 0 ? (
              <p className="site-body text-center py-4 rounded-[var(--site-r-btn)] bg-[var(--site-bg-soft)] border border-[var(--site-line)]">
                Энэ өдөр сул цаг байхгүй байна
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    aria-pressed={selectedTime === t}
                    className="site-option py-2.5 text-center text-[14px] font-medium text-[var(--site-ink)]"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Нэр, утас */}
          <div className="space-y-4">
            <div>
              <p className="site-label">
                <User className="w-3.5 h-3.5" /> Таны нэр
              </p>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Овог Нэр"
                className="site-input"
              />
            </div>
            <div>
              <p className="site-label">
                <Phone className="w-3.5 h-3.5" /> Утасны дугаар
              </p>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="9900 0000"
                className="site-input"
              />
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-[var(--site-r-btn)] px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Илгээх */}
        <div className="site-modal-foot">
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedService || !selectedDate || !selectedTime || !customerName.trim() || !customerPhone.trim()}
            className="site-btn w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Захиалж байна...' : 'Цаг захиалах'}
          </button>
        </div>
      </div>
    </div>
  );
}
