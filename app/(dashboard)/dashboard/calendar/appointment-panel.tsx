'use client';

import AppointmentActions from '../appointments/appointment-actions';
import CompleteToggle from '../appointments/complete-toggle';
import { isCheckable } from '../appointments/checkable';
import type { CalAppointment } from './types';
import { aptStartMin, money, statusStyle, toHHMM } from './cal-utils';
import { clinicCardDate } from '@/lib/booking/timezone';
import SidePanel from './side-panel';

/** Хуанли дээрх захиалга дээр дарахад — дэлгэрэнгүй ба төлөв өөрчлөх */
export default function AppointmentPanel({
  appointment: a,
  doctorName,
  branchName,
  onClose,
}: {
  appointment: CalAppointment;
  doctorName: string | null;
  branchName: string | null;
  onClose: () => void;
}) {
  const start = aptStartMin(a);
  const style = statusStyle(a.status);

  const rows: [string, string, React.ReactNode][] = [
    ['🕐', 'Цаг', `${clinicCardDate(new Date(a.scheduled_at))} · ${toHHMM(start)}–${toHHMM(start + a.duration_minutes)}`],
    ['🦷', 'Үйлчилгээ', a.service],
    ['💰', 'Төлбөр', a.price != null && <span className="font-semibold text-emerald-700">{money(a.price)}</span>],
    ['👩‍⚕️', 'Эмч', doctorName],
    ['📍', 'Салбар', branchName],
    ['#', 'Захиалгын код', a.booking_code && <span className="font-mono tracking-[0.15em]">{a.booking_code}</span>],
    ['📝', 'Тэмдэглэл', a.notes],
  ];

  return (
    <SidePanel title="Захиалга" onClose={onClose}>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${style.pill}`}>
            {style.label}
          </span>
          <h3 className="text-[20px] font-bold text-slate-900 tracking-tight mt-2">{a.customer_name}</h3>
          {a.customer_phone && (
            <a
              href={`tel:${a.customer_phone}`}
              className="inline-flex items-center gap-1.5 mt-1 text-[15px] font-medium text-blue-600 hover:underline"
            >
              📞 {a.customer_phone}
            </a>
          )}
        </div>

        <dl className="rounded-xl border border-slate-200 divide-y divide-slate-100">
          {rows.filter(([, , v]) => v).map(([icon, label, value]) => (
            <div key={label} className="flex items-start gap-3 px-4 py-3">
              <span className="w-5 text-center text-[14px] text-slate-400 shrink-0">{icon}</span>
              <dt className="w-28 shrink-0 text-[13px] text-slate-400">{label}</dt>
              <dd className="flex-1 min-w-0 text-[14px] text-slate-800 break-words">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Баталгаажсан захиалгыг нэг дарж дуусгана, дахин дарж буцаана */}
        {isCheckable(a.status) && (
          <CompleteToggle appointmentId={a.id} status={a.status} label />
        )}

        {a.status !== 'completed' && (
          <div>
            <p className="text-[12px] font-medium text-slate-500 mb-2">Төлөв өөрчлөх</p>
            <AppointmentActions appointmentId={a.id} status={a.status} />
          </div>
        )}
      </div>
    </SidePanel>
  );
}
