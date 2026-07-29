'use client';

import { useState, useEffect } from 'react';
import type { Clinic } from './types';
import { CalendarDays, Menu, Ticket, X } from 'lucide-react';

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
      className={`fixed top-0 left-0 right-0 z-40 bg-white transition-shadow duration-200 ${
        scrolled ? 'border-b border-[var(--site-line)]' : 'border-b border-transparent'
      }`}
    >
      {/* Hero-гийн 1120px контейнераас 48px-ээр гадуур — лого, товч арай захдаа */}
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

        {/* Лого */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--site-r-btn)] bg-[var(--site-accent)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9.2 2 7 4.2 7 7c0 1.8.8 3.4 2 4.5l1 7.5c.1.6.6 1 1.2 1 .5 0 1-.4 1.1-1L13 13v6c.1.6.6 1 1.1 1 .6 0 1.1-.4 1.2-1l1-7.5C17.2 10.4 18 8.8 18 7c0-2.8-2.2-5-5-5z" fill="white"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--site-ink)]">
            {clinic.name}
          </span>
        </div>

        {/* Desktop CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={`/c/${clinic.slug}/booking`}
            className="inline-flex items-center gap-1.5 rounded-[var(--site-r-btn)] border border-[var(--site-line)] px-3.5 py-2 text-[13px] font-semibold text-[var(--site-ink-soft)] hover:border-[var(--site-accent)] hover:text-[var(--site-accent)] transition-colors"
          >
            <Ticket className="w-3.5 h-3.5" />
            Захиалга шалгах
          </a>
          <button onClick={onBookClick} className="site-btn">
            <CalendarDays className="w-4 h-4" />
            Цаг авах
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-[var(--site-r-btn)] hover:bg-[var(--site-bg-soft)] transition"
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen
            ? <X className="w-5 h-5 text-[var(--site-ink-soft)]" />
            : <Menu className="w-5 h-5 text-[var(--site-ink-soft)]" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-[var(--site-line)] w-full max-w-[1280px] mx-auto px-5 sm:px-8 py-4 space-y-2">
          <button
            onClick={() => { onBookClick(); setMenuOpen(false); }}
            className="site-btn w-full"
          >
            <CalendarDays className="w-4 h-4" />
            Цаг авах
          </button>
          <a
            href={`/c/${clinic.slug}/booking`}
            className="site-btn-outline w-full"
          >
            <Ticket className="w-4 h-4" />
            Захиалга шалгах
          </a>
        </div>
      )}
    </header>
  );
}
