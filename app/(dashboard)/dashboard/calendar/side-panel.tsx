'use client';

import { useEffect, useEffectEvent, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const noopSubscribe = () => () => {};

/**
 * Баруун талаас гарах самбар. Том дэлгэцэнд арын хуанли идэвхтэй хэвээр
 * (өөр нүд дарж цагаа сольж болно), утсан дээр бүтэн дэлгэц. Esc — хаана.
 */
export default function SidePanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const handleKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => handleKey(e);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // body руу portal — эцэг элемент transform-той (анимаци) бол fixed нь
  // цонхоос биш тэр элементээс хэмжигдэж, самбар тасарч харагддаг.
  // Сервер дээр document байхгүй тул hydration-ы дараа л зурна.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted) return null;

  return createPortal(
    <>
      {/* Утсан дээр л бүрхүүл — том дэлгэцэнд хуанли дарагдах ёстой */}
      <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40" onClick={onClose} />
      <aside
        role="dialog"
        aria-label={title}
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right-8 fade-in duration-200"
      >
        <div className="shrink-0 flex items-center justify-between px-5 h-16 border-b border-slate-200">
          <h2 className="text-[17px] font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Хаах"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </aside>
    </>,
    document.body
  );
}
