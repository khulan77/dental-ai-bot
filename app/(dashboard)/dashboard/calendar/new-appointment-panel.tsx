'use client';

import { useState, useTransition } from 'react';
import { createAppointment } from '@/lib/db/appointment-actions';
import type { CalAppointment, CalColumn, CalService } from './types';
import { aptStartMin, dateLabel, money, toHHMM, toMin } from './cal-utils';
import SidePanel from './side-panel';

/** Хуанлиас сонгосон нүд — эмч, өдөр, цаг. Бусад талбар маягт дотроо. */
export type Draft = { doctorId: string; date: string; time: string; duration: number };

const DURATIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240];
// 06:00 – 22:45, 15 минутын алхамтай
const TIMES = Array.from({ length: (23 - 6) * 4 }, (_, i) => toHHMM(6 * 60 + i * 15));

const INPUT =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const LABEL = 'block text-[12px] font-medium text-slate-600 mb-1.5';

export default function NewAppointmentPanel({
  draft,
  onDraftChange,
  viewDate,
  branchId,
  branchName,
  columns,
  appointments,
  services,
  onClose,
  onCreated,
}: {
  draft: Draft;
  /** Хуанли дээр өөр нүд дарахад эмч/цаг солигдоно — бичсэн нэр, утас хэвээр.
   *  Хугацаа ч энд байна — хуанли дээр урьдчилан харах блокийн өндөр. */
  onDraftChange: (d: Draft) => void;
  viewDate: string;
  branchId: string | null;
  branchName: string | null;
  columns: CalColumn[];
  appointments: CalAppointment[];
  services: CalService[];
  onClose: () => void;
  onCreated: (bookingCode: string | null, date: string) => void;
}) {
  const [serviceId, setServiceId] = useState('');
  const [customService, setCustomService] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'confirmed' | 'pending'>('confirmed');
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const column = columns.find(c => c.doctor.id === draft.doctorId) ?? null;
  const doctor = column?.doctor ?? null;

  // Энэ эмчийн хийдэг үйлчилгээ (service_ids хоосон = бүгд)
  const doctorServices = doctor && doctor.service_ids.length > 0
    ? services.filter(s => doctor.service_ids.includes(s.id))
    : services;
  const service = doctorServices.find(s => s.id === serviceId) ?? null;
  const serviceName = services.length > 0 ? service?.name ?? '' : customService.trim();

  const { duration } = draft;
  const start = toMin(draft.time);
  const end = start + duration;
  const timeOptions = TIMES.includes(draft.time) ? TIMES : [...TIMES, draft.time].sort();

  // Харж буй өдрийн захиалгатай давхцах эсэх — сервер ч мөн шалгана
  const conflict = draft.date === viewDate
    ? appointments.find(a => {
        if (a.doctor_id !== draft.doctorId || a.status === 'completed' || a.status === 'no_show') return false;
        const s = aptStartMin(a);
        return start < s + a.duration_minutes && end > s;
      })
    : undefined;

  const hours = draft.date === viewDate ? column?.hours : undefined;
  const offHours = hours === null
    ? 'Энэ эмч энэ өдөр амардаг.'
    : hours && (start < toMin(hours.open) || end > toMin(hours.close))
      ? `Ажлын цагаас гадуур (${hours.open}–${hours.close}).`
      : null;

  function pickService(id: string) {
    setServiceId(id);
    const s = services.find(x => x.id === id);
    if (s?.duration_minutes) onDraftChange({ ...draft, duration: s.duration_minutes });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startSaving(async () => {
      const res = await createAppointment({
        doctorId: draft.doctorId,
        branchId,
        customerName: name,
        customerPhone: phone,
        service: serviceName,
        date: draft.date,
        time: draft.time,
        durationMinutes: duration,
        status,
        notes,
      });
      if (res.success) onCreated(res.bookingCode, draft.date);
      else setError(res.error);
    });
  }

  return (
    <SidePanel title="Шинэ захиалга" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col h-full min-h-0">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Сонгосон цаг — хуанли дээр өөр нүд дарж солино */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <div className="text-[15px] font-semibold text-blue-950">
              {dateLabel(draft.date)} · {draft.time}–{toHHMM(end)}
            </div>
            <div className="text-[12px] text-blue-800/70 mt-0.5">
              {doctor?.name ?? 'Эмч сонгоогүй'}
              {branchName && ` · 📍 ${branchName}`}
            </div>
            <div className="text-[11px] text-blue-800/60 mt-1.5">Хуанли дээр өөр нүд дарж цаг, эмчээ сольж болно.</div>
          </div>

          <div>
            <label className={LABEL} htmlFor="apt-doctor">Эмч</label>
            <select
              id="apt-doctor"
              value={draft.doctorId}
              onChange={e => onDraftChange({ ...draft, doctorId: e.target.value })}
              className={INPUT}
            >
              {columns.map(c => (
                <option key={c.doctor.id} value={c.doctor.id}>
                  {c.doctor.name}{c.doctor.specialty ? ` — ${c.doctor.specialty}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="apt-service">Үйлчилгээ</label>
            {services.length > 0 ? (
              <select
                id="apt-service"
                value={service ? serviceId : ''}
                onChange={e => pickService(e.target.value)}
                className={INPUT}
                required
              >
                <option value="" disabled>Сонгох…</option>
                {doctorServices.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.duration_minutes} мин · {money(s.price)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="apt-service"
                value={customService}
                onChange={e => setCustomService(e.target.value)}
                placeholder="Жнь: Үзлэг"
                className={INPUT}
                required
              />
            )}
          </div>

          <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-2">
            <div>
              <label className={LABEL} htmlFor="apt-date">Огноо</label>
              <input
                id="apt-date"
                type="date"
                value={draft.date}
                onChange={e => e.target.value && onDraftChange({ ...draft, date: e.target.value })}
                className={`${INPUT} px-2.5`}
                required
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="apt-time">Цаг</label>
              <select
                id="apt-time"
                value={draft.time}
                onChange={e => onDraftChange({ ...draft, time: e.target.value })}
                className={`${INPUT} px-2.5 tabular-nums`}
              >
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="apt-duration">Хугацаа</label>
              <select
                id="apt-duration"
                value={duration}
                onChange={e => onDraftChange({ ...draft, duration: Number(e.target.value) })}
                className={`${INPUT} px-2.5`}
              >
                {(DURATIONS.includes(duration) ? DURATIONS : [...DURATIONS, duration].sort((a, b) => a - b)).map(d => (
                  <option key={d} value={d}>{d} мин</option>
                ))}
              </select>
            </div>
          </div>

          {conflict && (
            <p className="text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
              ⚠️ Өөр захиалгатай давхцаж байна:{' '}
              <b>{toHHMM(aptStartMin(conflict))}–{toHHMM(aptStartMin(conflict) + conflict.duration_minutes)} · {conflict.customer_name}</b>
            </p>
          )}
          {!conflict && offHours && (
            <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2">
              {offHours} Бүртгэж болно.
            </p>
          )}

          <div className="pt-1 border-t border-slate-100" />

          <div>
            <label className={LABEL} htmlFor="apt-name">Үйлчлүүлэгчийн нэр</label>
            <input
              id="apt-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Овог нэр"
              autoComplete="off"
              className={INPUT}
              required
              autoFocus
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="apt-phone">
              Утас <span className="text-slate-400 font-normal">(заавал биш)</span>
            </label>
            <input
              id="apt-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="9900 0000"
              autoComplete="off"
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="apt-notes">
              Тэмдэглэл <span className="text-slate-400 font-normal">(заавал биш)</span>
            </label>
            <textarea
              id="apt-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Жнь: Утсаар захиалсан, харшилтай"
              className={INPUT}
            />
          </div>

          <div>
            <span className={LABEL}>Төлөв</span>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
              {([
                ['confirmed', 'Баталгаажсан'],
                ['pending', 'Хүлээгдэж буй'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  aria-pressed={status === value}
                  className={`py-2 rounded-lg text-[13px] font-medium transition ${
                    status === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 px-5 py-4 flex items-center gap-3 bg-white">
          {service && (
            <div className="text-[13px] text-slate-500 mr-auto">
              <div className="font-semibold text-slate-900 text-[15px]">{money(service.price)}</div>
              {duration} мин
            </div>
          )}
          <button type="button" onClick={onClose} className={`px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition ${service ? '' : 'ml-auto'}`}>
            Болих
          </button>
          <button
            type="submit"
            disabled={saving || !!conflict}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold disabled:opacity-40 transition"
          >
            {saving ? 'Бүртгэж байна…' : 'Захиалга бүртгэх'}
          </button>
        </div>
      </form>
    </SidePanel>
  );
}
