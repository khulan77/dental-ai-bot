'use client';

import type { Clinic, Branch } from './types';
import { MapPin, Phone, CalendarDays, MessageCircle } from 'lucide-react';

const QUICK_QUESTIONS = [
  'Өдөрт хэдэн удаа шүдээ угаах хэрэгтэй вэ?',
  'Шүд өвдвөл яах хэрэгтэй вэ?',
  'Шүдийг цагаан болгох аргууд юу вэ?',
  'Хэдэн сард нэг удаа эмчид үзүүлэх хэрэгтэй вэ?',
  'Суулгамал шүд ба бэхэлгээний ялгаа юу вэ?',
];

export default function Contact({
  clinic,
  branches = [],
  onBookClick,
  onAskQuestion,
}: {
  clinic: Clinic;
  branches?: Branch[];
  onBookClick: () => void;
  onAskQuestion: (q: string) => void;
}) {
  const phone = clinic.owner_phone;
  const hasBranches = branches.length > 0;

  return (
    <>
      <section className="site-section">
        <div className="site-container max-w-4xl">

          {/* CTA */}
          <div className="site-card p-10 sm:p-14 text-center">
            <span className="site-eyebrow">Цаг захиалга</span>
            <h2 className="site-h2 mb-4">Өнөөдөр цагаа захиалаарай</h2>
            <p className="site-lead max-w-md mx-auto mb-8">
              AI ассистенттэй 24 цагийн турш чатлаж, хүссэн эмчээсээ хялбархан цаг авах боломжтой.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={onBookClick} className="site-btn">
                <CalendarDays className="w-4 h-4" />
                Цаг захиалах
              </button>
              {phone && (
                <a href={`tel:${phone}`} className="site-btn-outline">
                  <Phone className="w-4 h-4" />
                  {phone}
                </a>
              )}
            </div>
          </div>

          {/* Салбартай эмнэлэг — салбар бүрийн хаяг, утас */}
          {hasBranches ? (
            <div className="mt-8">
              <p className="site-eyebrow text-center block">Манай салбарууд</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {branches.map(b => (
                  <div key={b.id} className="site-card p-5">
                    <div className="flex items-start gap-4">
                      <div className="site-icon-tile shrink-0">
                        <MapPin className="w-[18px] h-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-[var(--site-ink)]">{b.name}</div>
                        {b.address && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-[var(--site-muted)] leading-relaxed hover:text-[var(--site-accent)] transition-colors block mt-0.5"
                          >
                            {b.address}
                          </a>
                        )}
                        {b.phone && (
                          <a
                            href={`tel:${b.phone}`}
                            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--site-muted)] hover:text-[var(--site-accent)] transition-colors mt-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {b.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            (clinic.address || phone) && (
              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                {clinic.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-card site-card-hover flex items-start gap-4 p-5 group"
                  >
                    <div className="site-icon-tile shrink-0">
                      <MapPin className="w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <div className="text-[13px] text-[var(--site-muted)] mb-0.5">Хаяг</div>
                      <div className="text-[14px] font-medium text-[var(--site-ink)] leading-relaxed group-hover:text-[var(--site-accent)] transition-colors">
                        {clinic.address}
                      </div>
                    </div>
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="site-card site-card-hover flex items-start gap-4 p-5 group">
                    <div className="site-icon-tile shrink-0">
                      <Phone className="w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <div className="text-[13px] text-[var(--site-muted)] mb-0.5">Утас</div>
                      <div className="text-[14px] font-medium text-[var(--site-ink)] group-hover:text-[var(--site-accent)] transition-colors">
                        {phone}
                      </div>
                    </div>
                  </a>
                )}
              </div>
            )
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-[var(--site-line)] px-5 sm:px-8 pt-16 pb-8">
        <div className="site-container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 pb-12 border-b border-[var(--site-line)]">

            {/* Багана 1 — Брэнд */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-[var(--site-r-btn)] bg-[var(--site-accent)] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C9.2 2 7 4.2 7 7c0 1.8.8 3.4 2 4.5l1 7.5c.1.6.6 1 1.2 1 .5 0 1-.4 1.1-1L13 13v6c.1.6.6 1 1.1 1 .6 0 1.1-.4 1.2-1l1-7.5C17.2 10.4 18 8.8 18 7c0-2.8-2.2-5-5-5z" fill="white"/>
                  </svg>
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-[var(--site-ink)]">{clinic.name}</span>
              </div>
              <p className="site-body">
                Мэргэжлийн шүдний эмчилгээ, орчин үеийн технологи, AI ассистент — таны инээмсэглэлийн төлөө.
              </p>
            </div>

            {/* Багана 2 — Түгээмэл асуултууд */}
            <div>
              <h4 className="text-[12px] font-semibold text-[var(--site-muted)] uppercase tracking-[0.12em] mb-5">
                Түгээмэл асуултууд
              </h4>
              <ul className="space-y-2.5">
                {QUICK_QUESTIONS.map(q => (
                  <li key={q}>
                    <button
                      onClick={() => onAskQuestion(q)}
                      className="group flex items-start gap-2.5 text-left w-full"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[var(--site-muted)] mt-0.5 shrink-0 group-hover:text-[var(--site-accent)] transition-colors" />
                      <span className="text-[13px] text-[var(--site-muted)] group-hover:text-[var(--site-accent)] transition-colors leading-snug">
                        {q}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Багана 3 — Холбоо барих */}
            <div>
              <h4 className="text-[12px] font-semibold text-[var(--site-muted)] uppercase tracking-[0.12em] mb-5">
                Холбоо барих
              </h4>
              <div className="space-y-4">
                {phone && (
                  <a href={`tel:${phone}`} className="flex items-center gap-3 group">
                    <Phone className="w-4 h-4 text-[var(--site-muted)] shrink-0" />
                    <span className="text-[13px] text-[var(--site-muted)] group-hover:text-[var(--site-accent)] transition-colors">{phone}</span>
                  </a>
                )}
                {clinic.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group"
                  >
                    <MapPin className="w-4 h-4 text-[var(--site-muted)] shrink-0 mt-0.5" />
                    <span className="text-[13px] text-[var(--site-muted)] group-hover:text-[var(--site-accent)] transition-colors leading-relaxed">{clinic.address}</span>
                  </a>
                )}
                <button onClick={onBookClick} className="site-btn mt-1">
                  <CalendarDays className="w-4 h-4" />
                  Цаг захиалах
                </button>
              </div>
            </div>
          </div>

          {/* Доод мөр */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8">
            <p className="text-[12px] text-[var(--site-muted)]">
              © {new Date().getFullYear()} {clinic.name}. Бүх эрх хамгаалагдсан.
            </p>
            <p className="text-[12px] text-[var(--site-muted)]">
              Powered by <span className="font-semibold text-[var(--site-accent)]">Dental AI</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
