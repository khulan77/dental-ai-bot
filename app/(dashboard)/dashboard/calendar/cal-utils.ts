import { clinicMinutesOfDay } from '@/lib/booking/timezone';
import type { CalAppointment } from './types';

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const toHHMM = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** 20000 → "20,000₮" (хяналтын самбарын бусад хэсэгтэй ижил хэлбэр) */
export const money = (n: number) => `${n.toLocaleString('en-US')}₮`;

/** Орлогод тооцох захиалгуудын нийт дүн — ирээгүйг хасна */
export const totalPrice = (items: CalAppointment[]) =>
  items.reduce((sum, a) => (a.status === 'no_show' ? sum : sum + (a.price ?? 0)), 0);

/** Захиалгын эхлэх минут — эмнэлгийн бүсээр (хөтчийн бүсээс хамаарахгүй) */
export const aptStartMin = (a: CalAppointment) => clinicMinutesOfDay(new Date(a.scheduled_at));

const WEEKDAYS = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];

/** 'YYYY-MM-DD' → "9-р сарын 14, Даваа" */
export function dateLabel(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${m}-р сарын ${d}, ${WEEKDAYS[new Date(`${iso}T00:00:00Z`).getUTCDay()]}`;
}

export function shiftISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Хуанли дээрх захиалгын блокийн өнгө — төлөвөөр */
export const STATUS_STYLE: Record<string, { label: string; block: string; dot: string; pill: string }> = {
  pending: {
    label: 'Хүлээгдэж буй',
    block: 'bg-amber-50 border-amber-400 text-amber-950 hover:bg-amber-100',
    dot: 'bg-amber-400',
    pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
  confirmed: {
    label: 'Баталгаажсан',
    block: 'bg-blue-50 border-blue-500 text-blue-950 hover:bg-blue-100',
    dot: 'bg-blue-500',
    pill: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  },
  reminded: {
    label: 'Сануулга илгээсэн',
    block: 'bg-blue-50 border-blue-500 text-blue-950 hover:bg-blue-100',
    dot: 'bg-blue-500',
    pill: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  },
  completed: {
    label: 'Дууссан',
    block: 'bg-slate-100 border-slate-400 text-slate-600 hover:bg-slate-200',
    dot: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
  },
  no_show: {
    label: 'Ирээгүй',
    block: 'bg-rose-50 border-rose-400 text-rose-900 hover:bg-rose-100',
    dot: 'bg-rose-400',
    pill: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
  },
};

export const statusStyle = (status: string) => STATUS_STYLE[status] ?? STATUS_STYLE.confirmed;
