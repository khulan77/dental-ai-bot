'use client';

import type { Clinic, Doctor, Service } from './types';
import { CalendarDays, Phone, Star, ChevronRight } from 'lucide-react';

export default function Hero({
  clinic,
  doctors,
  services,
  onChatClick,
}: {
  clinic: Clinic;
  doctors: Doctor[];
  services: Service[];
  onChatClick: () => void;
}) {
  const phone = clinic.owner_phone;

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#F7F9FC]"
      style={{ fontFamily: 'var(--font-jakarta, var(--font-sans))' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-sky-50/60 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-20 sm:pt-36 sm:pb-28 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div className="premium-reveal-1">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[12px] font-semibold text-blue-600 tracking-wide uppercase">
                Премиум шүдний эмнэлэг
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-6">
              Таны гэрэлт
              <br />
              <span className="text-blue-600 relative">
                инээмсэглэл
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M3 9C60 3 180 3 297 9" stroke="#BFDBFE" strokeWidth="5" strokeLinecap="round"/>
                </svg>
              </span>
              <br />
              <span className="text-slate-400 font-light italic" style={{ fontFamily: 'var(--font-serif)' }}>
                манай бахархал
              </span>
            </h1>

            {/* Description */}
            <p className="text-[16px] text-slate-500 leading-relaxed max-w-lg mb-10">
              {clinic.about ?? 'Орчин үеийн технологи, туршлагатай эмч нар болон AI системийн хослол. Таны инээмсэглэлийн төлөө.'}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mb-12">
              <button
                onClick={onChatClick}
                className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-[15px] font-semibold transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95"
              >
                <CalendarDays className="w-5 h-5" />
                Цаг захиалах
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[15px] font-semibold transition-all hover:shadow-md"
                >
                  <Phone className="w-5 h-5 text-slate-400" />
                  {phone}
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              {[
                { value: `${doctors.length || 5}+`, label: 'Эмч' },
                { value: `${services.length || 10}+`, label: 'Үйлчилгээ' },
                { value: '4.9', label: 'Үнэлгээ', star: true },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-8">
                  {i > 0 && <div className="w-px h-8 bg-slate-200" />}
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">{s.value}</span>
                      {s.star && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Visual card */}
          <div className="hidden lg:block premium-reveal-2">
            <div className="relative">

              {/* Main card */}
              <div className="relative rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-blue-600 p-8 shadow-2xl shadow-blue-500/20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-6 right-6 w-40 h-40 rounded-full border-2 border-white" />
                  <div className="absolute bottom-6 left-6 w-24 h-24 rounded-full border border-white" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white" />
                </div>
                <div className="relative flex flex-col items-center py-8">
                  <div className="text-[110px] leading-none mb-4" style={{ filter: 'drop-shadow(0 8px 32px rgba(255,255,255,0.2))' }}>
                    🦷
                  </div>
                  <div className="text-white/60 text-[12px] uppercase tracking-widest mb-1">Dental Score</div>
                  <div className="text-white text-6xl font-black">98%</div>
                  <div className="text-white/70 text-[13px] mt-1">Perfect Health</div>
                </div>

                {/* Bottom stat row */}
                <div className="relative grid grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden mt-4">
                  {[
                    { v: '500+', l: 'Үйлчлүүлэгч' },
                    { v: '3+', l: 'Жил' },
                    { v: '24/7', l: 'Онлайн' },
                  ].map(item => (
                    <div key={item.l} className="bg-white/10 py-4 text-center">
                      <div className="text-white font-bold text-[18px]">{item.v}</div>
                      <div className="text-white/60 text-[11px] mt-0.5">{item.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge top-right */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">✓</div>
                <div>
                  <div className="text-[12px] font-bold text-slate-900">ISO Баталгаат</div>
                  <div className="text-[11px] text-slate-400">Олон улсын стандарт</div>
                </div>
              </div>

              {/* Floating badge bottom-left */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-[12px] font-bold text-slate-900">200+ сэтгэгдэл</div>
                <div className="text-[11px] text-slate-400">Хэрэглэгчдийн дүгнэлт</div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L1440 60L1440 20C1200 50 960 60 720 50C480 40 240 10 0 40L0 60Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
