'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { updateAppointmentStatus } from '@/lib/db/appointment-actions';
import { isCheckable } from './checkable';

/**
 * Баталгаажсан захиалгыг нэг дарж "Дууссан" болгоно. Дахин дарвал
 * "Баталгаажсан" руу буцна (андуурч тэмдэглэснээ засна).
 *
 * Серверийн хариуг хүлээлгүй шууд чагтална (useOptimistic) — амжилтгүй бол
 * хуучин төлөв рүүгээ буцаж, алдааг title-д харуулна.
 */
export default function CompleteToggle({
  appointmentId,
  status,
  size = 'md',
  label,
}: {
  appointmentId: string;
  status: string;
  size?: 'sm' | 'md';
  /** Хажууд нь бичих тайлбар (дэлгэрэнгүй самбарт) */
  label?: boolean;
}) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isCheckable(status)) return null;
  const checked = optimisticStatus === 'completed';

  function toggle(e: React.MouseEvent) {
    // Хуанлийн багана, <summary> зэрэг эцэг элементийн дарцыг өдөөхгүй
    e.preventDefault();
    e.stopPropagation();
    const next = checked ? 'confirmed' : 'completed';
    setError(null);
    startTransition(async () => {
      setOptimisticStatus(next);
      const res = await updateAppointmentStatus(appointmentId, next);
      if (!res.success) setError(res.error ?? 'Алдаа гарлаа');
    });
  }

  const box = size === 'sm' ? 'w-[18px] h-[18px]' : 'w-6 h-6';
  const icon = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? 'Дууссан — буцаах' : 'Дууссан гэж тэмдэглэх'}
      title={error ?? (checked ? 'Дууссан · дахин дарж буцаана' : 'Дууссан гэж тэмдэглэх')}
      onClick={toggle}
      onMouseMove={e => e.stopPropagation()}
      disabled={pending}
      className={`group/check inline-flex items-center gap-2 shrink-0 ${label ? 'rounded-xl px-3 py-2 border transition ' + (checked ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50') : ''}`}
    >
      <span
        className={`${box} rounded-full border-2 flex items-center justify-center transition ${
          checked
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'bg-white border-slate-300 text-transparent group-hover/check:border-emerald-500 group-hover/check:text-emerald-500'
        } ${error ? 'ring-2 ring-red-300' : ''} ${pending ? 'opacity-70' : ''}`}
      >
        <svg viewBox="0 0 16 16" fill="none" className={icon} aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label && (
        <span className={`text-[14px] font-medium ${checked ? 'text-emerald-700' : 'text-slate-700'}`}>
          {checked ? 'Үйлчилгээ дууссан' : 'Дууссан гэж тэмдэглэх'}
        </span>
      )}
    </button>
  );
}
