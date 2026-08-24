'use client';

import { useState, useTransition } from 'react';
import {
  updateAppointmentStatus,
  type AppointmentStatus,
} from '@/lib/db/appointment-actions';

type Action = {
  status: AppointmentStatus;
  label: string;
  className: string;
  confirm?: string;
};

/** Тухайн төлөвөөс шилжиж болох үйлдлүүд */
function actionsFor(status: string): Action[] {
  switch (status) {
    case 'pending':
      return [
        {
          status: 'confirmed',
          label: 'Баталгаажуулах',
          className: 'border border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50',
        },
        {
          status: 'cancelled',
          label: 'Цуцлах',
          className: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
          confirm: 'Энэ захиалгыг цуцлах уу?',
        },
      ];
    case 'confirmed':
    case 'reminded':
      return [
        {
          status: 'completed',
          label: 'Дуусгах',
          className: 'border border-sky-300 text-sky-700 bg-sky-50/50 hover:bg-sky-50',
        },
        {
          status: 'no_show',
          label: 'Ирээгүй',
          className: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
        },
        {
          status: 'cancelled',
          label: 'Цуцлах',
          className: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
          confirm: 'Энэ захиалгыг цуцлах уу?',
        },
      ];
    case 'cancelled':
    case 'no_show':
      return [
        {
          status: 'confirmed',
          label: 'Сэргээх',
          className: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
        },
      ];
    default:
      return [];
  }
}

export default function AppointmentActions({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const actions = actionsFor(status);

  if (actions.length === 0) return <span className="text-xs text-slate-400">—</span>;

  function run(action: Action) {
    if (action.confirm && !confirm(action.confirm)) return;
    setError(null);
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, action.status);
      if (!result.success) setError(result.error ?? 'Алдаа гарлаа');
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map(action => (
        <button
          key={action.status}
          onClick={() => run(action)}
          disabled={pending}
          className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition disabled:opacity-40 ${action.className}`}
        >
          {action.label}
        </button>
      ))}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
