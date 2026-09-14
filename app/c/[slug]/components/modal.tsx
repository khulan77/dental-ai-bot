'use client';

import { useEffect, useEffectEvent } from 'react';
import { X } from 'lucide-react';

/**
 * Нийтийн сайтын бүх modal-ын бүрхүүл.
 * Esc дарахад хаагдана, нээлттэй үед арын хуудас гүйлгэгдэхгүй.
 * Утсан дээр доороос гарч ирэх sheet, том дэлгэцэн дээр голдоо.
 */
export default function Modal({
  label,
  onClose,
  panelClassName = 'site-modal',
  children,
}: {
  /** Дэлгэц уншигчид зориулсан нэр */
  label: string;
  onClose: () => void;
  panelClassName?: string;
  children: React.ReactNode;
}) {
  const handleEscape = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => handleEscape(e);
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`${panelClassName} animate-in slide-in-from-bottom-4 duration-200`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Хаах"
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--site-bg-soft)] transition-colors shrink-0"
    >
      <X className="w-5 h-5 text-[var(--site-muted)]" />
    </button>
  );
}
