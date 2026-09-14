'use client';

import { useState, useEffect } from 'react';
import type { Clinic, SectionLink } from './types';
import { CalendarDays, Menu, Ticket, X } from 'lucide-react';
import Logo from './logo';

/** Хуудсан доторх хэсэг рүү зөөлөн гүйлгэнэ (толгойн өндрийг .site-section тооцно) */
export function scrollToSection(e: React.MouseEvent, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Nav({
  clinic,
  links,
  onBookClick,
}: {
  clinic: Clinic;
  links: SectionLink[];
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
      className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur transition-shadow duration-200 border-b ${
        scrolled || menuOpen ? 'border-[var(--site-line)]' : 'border-transparent'
      }`}
    >
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        <a
          href="#top"
          onClick={e => { scrollToSection(e, 'top'); setMenuOpen(false); }}
          className="min-w-0"
          aria-label={`${clinic.name} — нүүр`}
        >
          <Logo name={clinic.name} />
        </a>

        {/* Хэсгүүд — өргөн дэлгэцэнд */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Хэсгүүд">
          {links.map(l => (
            <a key={l.id} href={`#${l.id}`} onClick={e => scrollToSection(e, l.id)} className="site-link">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <a href={`/c/${clinic.slug}/booking`} className="site-btn-outline py-2 px-3.5 text-[13px]">
            <Ticket className="w-3.5 h-3.5" />
            Захиалга шалгах
          </a>
          <button onClick={onBookClick} className="site-btn py-2">
            <CalendarDays className="w-4 h-4" />
            Цаг авах
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden w-10 h-10 -mr-2 flex items-center justify-center rounded-[var(--site-r-btn)] hover:bg-[var(--site-bg-soft)] transition shrink-0"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Цэс хаах' : 'Цэс нээх'}
          aria-expanded={menuOpen}
        >
          {menuOpen
            ? <X className="w-5 h-5 text-[var(--site-ink-soft)]" />
            : <Menu className="w-5 h-5 text-[var(--site-ink-soft)]" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-white px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col py-2" aria-label="Хэсгүүд">
            {links.map(l => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={e => { scrollToSection(e, l.id); setMenuOpen(false); }}
                className="py-3 text-[15px] font-medium text-[var(--site-ink-soft)] border-b border-[var(--site-line)] last:border-b-0"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <a href={`/c/${clinic.slug}/booking`} className="site-btn-outline">
              <Ticket className="w-4 h-4" />
              Шалгах
            </a>
            <button onClick={() => { onBookClick(); setMenuOpen(false); }} className="site-btn">
              <CalendarDays className="w-4 h-4" />
              Цаг авах
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
