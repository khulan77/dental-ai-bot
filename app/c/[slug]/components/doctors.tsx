'use client';

import type { Doctor } from './types';
import { GraduationCap, Star, CalendarDays } from 'lucide-react';

const AVATAR_COLORS = [
  'from-blue-500 to-blue-700',
  'from-violet-500 to-purple-700',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
];

export default function Doctors({
  doctors,
  onChatClick,
  onBookClick,
}: {
  doctors: Doctor[];
  onChatClick: () => void;
  onBookClick: (doctor: Doctor) => void;
}) {
  if (doctors.length === 0) return null;

  return (
    <section
      id="doctors"
      className="bg-[#F7F9FC] py-24 sm:py-32 px-5 sm:px-8"
      style={{ fontFamily: 'var(--font-jakarta, var(--font-sans))' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16 premium-reveal-1">
          <span className="inline-block text-[12px] font-bold text-blue-600 tracking-[0.2em] uppercase mb-4">
            — Манай баг —
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Мэргэжлийн{' '}
            <span className="italic font-light text-blue-600" style={{ fontFamily: 'var(--font-serif)' }}>
              эмч нар
            </span>
          </h2>
          <p className="text-[15px] text-slate-500 leading-relaxed">
            Олон жилийн туршлага, олон улсын мэргэшилтэй эмч нараас бүрдсэн манай баг
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, idx) => (
            <div
              key={doctor.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Card top — color banner + avatar */}
              <div className={`relative h-32 bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                {/* Decorative circles */}
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-2 border-white/20" />
                <div className="absolute bottom-0 right-12 w-12 h-12 rounded-full border border-white/10" />

                {/* Avatar */}
                <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-2xl font-black" style={{
                    background: `linear-gradient(135deg, ${AVATAR_COLORS[idx % AVATAR_COLORS.length].replace('from-', '').split(' ')[0].replace('-500', '').replace('-600', '')}, blue)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {doctor.name.charAt(0)}
                  </span>
                </div>

                {/* Rating badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[11px] font-bold text-slate-700">5.0</span>
                </div>
              </div>

              {/* Card body */}
              <div className="pt-12 px-6 pb-6">
                <h3 className="text-[17px] font-extrabold text-slate-900 mb-1">{doctor.name}</h3>
                {doctor.specialty && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[12px] font-medium text-blue-600">{doctor.specialty}</span>
                  </div>
                )}
                <p className="text-[13px] text-slate-500 leading-relaxed mb-5 line-clamp-2">
                  {doctor.bio ?? 'Мэргэжлийн шүдний эмч. Олон жилийн туршлагатай.'}
                </p>

                {/* Status */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Идэвхтэй
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Цаг авах боломжтой</span>
                </div>

                {/* Book button */}
                <button
                  onClick={() => onBookClick(doctor)}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
                >
                  <CalendarDays className="w-4 h-4" />
                  Цаг авах
                </button>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
