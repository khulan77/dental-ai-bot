'use client';

import { useState, useEffect } from 'react';
import type { Clinic } from './types';
import { CalendarDays, Menu, X } from 'lucide-react';

export default function Nav({
  clinic,
  onBookClick,
}: {
  clinic: Clinic;
  onBookClick: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
      }`}
      style={{ fontFamily: 'var(--font-jakarta, var(--font-sans))' }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9.2 2 7 4.2 7 7c0 1.8.8 3.4 2 4.5l1 7.5c.1.6.6 1 1.2 1 .5 0 1-.4 1.1-1L13 13v6c.1.6.6 1 1.1 1 .6 0 1.1-.4 1.2-1l1-7.5C17.2 10.4 18 8.8 18 7c0-2.8-2.2-5-5-5z" fill="white"/>
            </svg>
          </div>
          <span className={`text-[15px] font-semibold tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
            {clinic.name}
          </span>
        </div>

        {/* Desktop CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[12px] font-medium text-emerald-700">Нээлттэй</span>
          </div>
          <button
            onClick={onBookClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
          >
            <CalendarDays className="w-4 h-4" />
            Цаг авах
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition"
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-5 py-4 space-y-3">
          <button
            onClick={() => { onBookClick(); setMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 text-white text-[14px] font-semibold"
          >
            <CalendarDays className="w-4 h-4" />
            Цаг авах
          </button>
        </div>
      )}
    </header>
  );
}
