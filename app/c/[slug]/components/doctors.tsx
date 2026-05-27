'use client';

import type { Doctor } from './types';
import { ArrowRight, GraduationCap, Sparkles, Award } from 'lucide-react';

export default function Doctors({
  doctors,
  onChatClick,
}: {
  doctors: Doctor[];
  onChatClick: () => void;
}) {
  if (doctors.length === 0) return null;

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-white to-blue-50/30">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-200/20 blur-[120px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* ═════ HEADER ═════ */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/60 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-[12px] font-bold text-blue-700 tracking-[0.15em] uppercase">
              Багийн гишүүд
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05]">
            Мэргэжлийн{' '}
            <span className="text-blue-600">эмч нар</span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-500 leading-relaxed">
            Олон жилийн туршлагатай, олон улсын мэргэшилтэй эмч нараас бүрдсэн баг
          </p>
        </div>

        {/* ═════ DOCTORS GRID ═════ */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, idx) => (
            <div
              key={doctor.id}
              className="group relative bg-white border-2 border-slate-100 hover:border-blue-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 transition-all duration-500"
            >
              {/* Top decoration */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/50">
                <span className="text-[10px] font-bold text-blue-700 tracking-widest">
                  N°{String(idx + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="p-6 sm:p-7">
                
                {/* Avatar + Name */}
                <div className="flex items-start gap-4 mb-5">
                  
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-blue-200 rounded-2xl blur-md opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500" />
                    <div className="relative w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-300/50 group-hover:scale-105 transition-transform">
                      <span className="text-2xl font-black text-white drop-shadow-md">
                        {doctor.name.charAt(0)}
                      </span>
                    </div>
                    {/* Verified */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Name + Specialty */}
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">
                      {doctor.name}
                    </h3>
                    {doctor.specialty && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-600">
                          {doctor.specialty}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {doctor.bio ? (
                  <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 mb-5">
                    <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                      {doctor.bio}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-4 mb-5">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>Мэргэжлийн эмч</span>
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                    <span className="ml-1.5 text-xs font-bold text-slate-700">5.0</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Идэвхтэй
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={onChatClick}
                  className="group/btn w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-300/50 hover:shadow-lg hover:shadow-blue-400/50 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Цаг авах</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom hint */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Эмч сонгох бэрхтэй юу?{' '}
            <button
              onClick={onChatClick}
              className="font-bold text-blue-600 hover:text-blue-700 transition underline underline-offset-4 decoration-2 decoration-blue-300/50 hover:decoration-blue-500"
            >
              AI ассистенттэй чатлаарай →
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}