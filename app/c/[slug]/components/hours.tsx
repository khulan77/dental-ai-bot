'use client';

import { useSyncExternalStore } from 'react';
import { Clock } from 'lucide-react';
import { zonedParts } from '@/lib/booking/timezone';
import type { BusinessHours, DayHours } from './types';

/** Даваагаас эхэлсэн долоо хоног. idx нь Date#getDay (0 = Ням). */
const WEEK: { key: keyof BusinessHours; label: string; idx: number }[] = [
  { key: 'mon', label: 'Даваа', idx: 1 },
  { key: 'tue', label: 'Мягмар', idx: 2 },
  { key: 'wed', label: 'Лхагва', idx: 3 },
  { key: 'thu', label: 'Пүрэв', idx: 4 },
  { key: 'fri', label: 'Баасан', idx: 5 },
  { key: 'sat', label: 'Бямба', idx: 6 },
  { key: 'sun', label: 'Ням', idx: 0 },
];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Минут тутам шинэчлэгдэх "эмнэлгийн одоогийн цаг".
// Сервер дээр null — нээлттэй/хаалттай гэдгийг зөвхөн хөтөч дээр тооцно,
// үгүй бол серверийн болон хэрэглэгчийн цаг зөрж hydration алдаа гарна.
const subscribe = (tick: () => void) => {
  const id = setInterval(tick, 60_000);
  return () => clearInterval(id);
};
const readNow = () => {
  const p = zonedParts(new Date());
  return p.weekday * 1440 + p.hour * 60 + p.minute;
};

function useClinicNow(): { weekday: number; minutes: number } | null {
  const v = useSyncExternalStore(subscribe, readNow, () => -1);
  return v < 0 ? null : { weekday: Math.floor(v / 1440), minutes: v % 1440 };
}

function hoursOn(hours: BusinessHours, weekday: number): DayHours {
  return hours[WEEK.find(d => d.idx === weekday)!.key];
}

/** "Одоо нээлттэй · 18:00 хүртэл" гэх мэт нэг мөр */
export function useOpenStatus(hours: BusinessHours | null) {
  const now = useClinicNow();
  if (!hours || !now) return null;

  const today = hoursOn(hours, now.weekday);
  if (!today) return { open: false, text: 'Өнөөдөр амарна' };

  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  if (now.minutes < open) return { open: false, text: `Хаалттай · ${today.open}-д нээгдэнэ` };
  if (now.minutes >= close) return { open: false, text: 'Өнөөдрийн ажил дууссан' };
  return { open: true, text: `Одоо нээлттэй · ${today.close} хүртэл` };
}

export function OpenStatusPill({ hours }: { hours: BusinessHours | null }) {
  const status = useOpenStatus(hours);
  if (!status) return null;

  return (
    <span
      className={`inline-flex items-center gap-2 text-[13px] font-medium ${
        status.open ? 'text-[var(--site-accent)]' : 'text-[var(--site-muted)]'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          status.open ? 'bg-[var(--site-accent)] soft-pulse' : 'bg-[#CBD5E1]'
        }`}
      />
      {status.text}
    </span>
  );
}

/** Долоо хоногийн цагийн хуваарь — өнөөдрийг тодруулна */
export function WeeklyHours({ hours, note }: { hours: BusinessHours; note?: string }) {
  const now = useClinicNow();

  return (
    <div className="site-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="site-icon-tile shrink-0">
          <Clock className="w-[18px] h-[18px]" />
        </div>
        <div className="min-w-0">
          <h3 className="site-h3">Ажлын цаг</h3>
          <OpenStatusPill hours={hours} />
        </div>
      </div>

      <ul className="divide-y divide-[var(--site-line)]">
        {WEEK.map(day => {
          const h = hours[day.key];
          const isToday = now?.weekday === day.idx;
          return (
            <li
              key={day.key}
              className={`flex items-center justify-between py-2.5 text-[14px] ${
                isToday ? 'font-semibold text-[var(--site-ink)]' : 'text-[var(--site-ink-soft)]'
              }`}
            >
              <span className="flex items-center gap-2">
                {day.label}
                {isToday && (
                  <span className="text-[11px] font-semibold text-[var(--site-accent)] bg-[var(--site-accent-soft)] rounded-[var(--site-r-pill)] px-2 py-0.5">
                    Өнөөдөр
                  </span>
                )}
              </span>
              <span className={h ? 'tabular-nums' : 'text-[var(--site-muted)] font-normal'}>
                {h ? `${h.open} – ${h.close}` : 'Амарна'}
              </span>
            </li>
          );
        })}
      </ul>

      {note && <p className="site-body text-[12px] mt-3">{note}</p>}
    </div>
  );
}
