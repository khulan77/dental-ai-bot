'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone } from 'lucide-react';
import type { Doctor, Service } from './types';

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

  const dates = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      label: i === 0 ? 'Өнөөдөр' : i === 1 ? 'Маргааш' : 'Нөгөөдөр',
      dayName: DAY_NAMES[d.getDay()],
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
        scheduledAt: `${selectedDate}T${selectedTime}:00+08:00`,
      }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setLoading(false); return; }
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Захиалга баталгаажлаа!</h3>
          <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-1.5 mb-6">
            <p className="text-sm text-slate-700"><span className="font-medium">Эмч:</span> {doctor.name}</p>
            <p className="text-sm text-slate-700"><span className="font-medium">Үйлчилгээ:</span> {selectedService?.name}</p>
            <p className="text-sm text-slate-700"><span className="font-medium">Цаг:</span> {selectedDate} {selectedTime}</p>
            <p className="text-sm text-slate-700"><span className="font-medium">Нэр:</span> {customerName}</p>
          </div>
          <p className="text-slate-400 text-xs mb-5">Удахгүй танд холбогдох болно</p>
          <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition">
            Хаах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-white sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-slate-100 flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm shadow-blue-500/30">
            {doctor.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Цаг захиалах</p>
            <h3 className="font-semibold text-slate-900 truncate leading-tight">{doctor.name}</h3>
            {doctor.specialty && <p className="text-xs text-slate-500">{doctor.specialty}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition flex-shrink-0">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Service */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Үйлчилгээ</p>
            <div className="space-y-2">
              {doctorServices.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    selectedService?.id === s.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-medium text-slate-900">{s.name}</span>
                  <span className="text-sm font-semibold text-blue-600 ml-2 flex-shrink-0">
                    {s.price_mnt.toLocaleString()}₮
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Өдөр
            </p>
            <div className="grid grid-cols-3 gap-2">
              {dates.map(d => (
                <button
                  key={d.iso}
                  onClick={() => setSelectedDate(d.iso)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDate === d.iso
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-900">{d.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{d.dayName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Сул цагууд
            </p>
            {loadingSlots ? (
              <div className="flex gap-1.5 py-5 justify-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                Энэ өдөр сул цаг байхгүй байна
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      selectedTime === t
                        ? 'border-blue-400 bg-blue-500 text-white shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name & Phone */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Таны нэр
              </p>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Овог Нэр"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Утасны дугаар
              </p>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="9900 0000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="p-5 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedService || !selectedDate || !selectedTime || !customerName.trim() || !customerPhone.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-blue-400 to-blue-500 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none text-white rounded-xl font-semibold text-sm transition-all"
          >
            {loading ? 'Захиалж байна...' : 'Цаг захиалах →'}
          </button>
        </div>
      </div>
    </div>
  );
}
