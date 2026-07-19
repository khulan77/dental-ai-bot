'use client';

import type { Clinic } from './types';
import { MapPin, Phone, CalendarDays, Star, MessageCircle } from 'lucide-react';

const QUICK_QUESTIONS = [
  'Өдөрт хэдэн удаа шүдээ угаах хэрэгтэй вэ?',
  'Шүд өвдвөл яах хэрэгтэй вэ?',
  'Шүдийг цагаан болгох аргууд юу вэ?',
  'Хэдэн сард нэг удаа эмчид үзүүлэх хэрэгтэй вэ?',
  'Суулгамал шүд ба бэхэлгээний ялгаа юу вэ?',
];

export default function Contact({
  clinic,
  onBookClick,
  onAskQuestion,
}: {
  clinic: Clinic;
  onBookClick: () => void;
  onAskQuestion: (q: string) => void;
}) {
  const phone = clinic.owner_phone;

  return (
    <>
      <section
        className="relative bg-white py-24 sm:py-32 px-5 sm:px-8 overflow-hidden"
        style={{ fontFamily: 'var(--font-jakarta, var(--font-sans))' }}
      >
        {/* BG decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-50/40 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">

          {/* Main CTA card */}
          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-blue-400 to-blue-500 p-10 sm:p-16 overflow-hidden text-center shadow-2xl shadow-blue-500/30">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/10" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full border border-white/10" />
            <div className="absolute top-1/2 right-8 -translate-y-1/2 w-80 h-80 rounded-full border border-white/5" />

            <div className="relative flex justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <h2 className="relative text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Өнөөдөр цаг авч
              <br />
              <span className="italic font-light" style={{ fontFamily: 'var(--font-serif)' }}>
                инээмсэглэлээ сэргээ
              </span>
            </h2>
            <p className="relative text-blue-100 text-[15px] leading-relaxed max-w-md mx-auto mb-10">
              AI ассистенттэй 24/7 чатлаж, хялбархан цаг захиалаарай. Хүлээх шаардлагагүй.
            </p>

            <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onBookClick}
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-blue-600 text-[15px] font-bold hover:bg-blue-50 transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
              >
                <CalendarDays className="w-5 h-5" />
                Цаг захиалах
              </button>
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white/10 border border-white/20 text-white text-[15px] font-semibold hover:bg-white/20 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  {phone}
                </a>
              )}
            </div>

            <div className="relative flex flex-wrap justify-center gap-6 mt-10 pt-10 border-t border-white/10">
              {[
                { icon: '⚡', text: '24/7 хариулна' },
                { icon: '🔒', text: 'Найдвартай захиалга' },
                { icon: '✅', text: 'Үнэгүй зөвлөгөө' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2 text-blue-100">
                  <span className="text-[16px]">{item.icon}</span>
                  <span className="text-[13px] font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact info cards */}
          {(clinic.address || phone) && (
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {clinic.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors">
                    <MapPin className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Хаяг</div>
                    <div className="text-[14px] font-semibold text-slate-800 leading-relaxed group-hover:text-blue-600 transition-colors">{clinic.address}</div>
                    <div className="text-[11px] text-blue-500 mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Google Maps-д нээх →</div>
                  </div>
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="flex items-start gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-blue-200 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors">
                    <Phone className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Утас</div>
                    <div className="text-[14px] font-semibold text-slate-800">{phone}</div>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="bg-slate-900 text-white px-5 sm:px-8 pt-16 pb-8"
        style={{ fontFamily: 'var(--font-jakarta, var(--font-sans))' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 pb-12 border-b border-white/10">

            {/* Col 1 — Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C9.2 2 7 4.2 7 7c0 1.8.8 3.4 2 4.5l1 7.5c.1.6.6 1 1.2 1 .5 0 1-.4 1.1-1L13 13v6c.1.6.6 1 1.1 1 .6 0 1.1-.4 1.2-1l1-7.5C17.2 10.4 18 8.8 18 7c0-2.8-2.2-5-5-5z" fill="white"/>
                  </svg>
                </div>
                <span className="text-[16px] font-bold tracking-tight">{clinic.name}</span>
              </div>
              <p className="text-slate-400 text-[13px] leading-relaxed mb-6">
                Мэргэжлийн шүдний эмчилгээ, орчин үеийн технологи, AI ассистент — таны инээмсэглэлийн төлөө.
              </p>
              <div className="flex items-center gap-2 text-[12px] text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                AI ассистент · 24/7 ажиллана
              </div>
            </div>

            {/* Col 2 — Quick dental questions */}
            <div>
              <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-5">
                Түгээмэл асуултууд
              </h4>
              <ul className="space-y-2">
                {QUICK_QUESTIONS.map(q => (
                  <li key={q}>
                    <button
                      onClick={() => onAskQuestion(q)}
                      className="group flex items-start gap-2.5 text-left w-full"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                      <span className="text-[13px] text-slate-400 group-hover:text-white transition-colors leading-snug">
                        {q}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Contact */}
            <div>
              <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-5">
                Холбоо барих
              </h4>
              <div className="space-y-4">
                {phone && (
                  <a href={`tel:${phone}`} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-blue-500 flex items-center justify-center transition-colors flex-shrink-0">
                      <Phone className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[13px] text-slate-400 group-hover:text-white transition-colors">{phone}</span>
                  </a>
                )}
                {clinic.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-blue-500 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[13px] text-slate-400 group-hover:text-white transition-colors leading-relaxed">{clinic.address}</span>
                  </a>
                )}
                <button
                  onClick={onBookClick}
                  className="flex items-center gap-2 mt-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  Цаг захиалах
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8">
            <p className="text-[12px] text-slate-600">
              © {new Date().getFullYear()} {clinic.name}. Бүх эрх хамгаалагдсан.
            </p>
            <p className="text-[12px] text-slate-600">
              Powered by{' '}
              <span className="font-semibold text-blue-500">Dental AI</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
