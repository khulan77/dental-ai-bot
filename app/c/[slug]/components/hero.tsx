'use client';

import type { Clinic, Doctor, Service } from './types';
import {
  ArrowRight,
  CalendarDays,
  Phone,
  Sparkles,
  Shield,
  Award,
  Clock,
} from 'lucide-react';

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
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-white">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/30 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/40 blur-[100px] rounded-full -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ═════ LEFT CONTENT ═════ */}
          <div className="lg:col-span-7">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/60 mb-8 animate-fade-up">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700 tracking-[0.15em] uppercase">
                Орчин үеийн шүдний эмнэлэг
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1] animate-fade-up-delay-1">
              Таны инээмсэглэл
              <span className="block text-blue-600 mt-2">
                бидний бахархал
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-500 max-w-xl animate-fade-up-delay-2">
              {clinic.about ??
                'Орчин үеийн технологи, мэргэжлийн эмч нар болон AI системийг хослуулсан премиум шүдний эмнэлэг.'}
            </p>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600 animate-fade-up-delay-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Баталгаатай</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Мэргэжлийн</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium">24/7 Цаг авалт</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3 animate-fade-up-delay-3">
              <button
                onClick={onChatClick}
                className="group px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_15px_40px_rgba(37,99,235,0.35)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.45)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  <span>Цаг авах</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="px-8 py-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-blue-400 text-slate-800 font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  {phone}
                </a>
              )}
            </div>

            {/* Stats - Minimal version */}
          {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-6 sm:gap-8 max-w-md">
              <Stat value={doctors.length || '5'} label="Эмч" />
              <Stat value={services.length || '10'} label="Үйлчилгээ" />
              <Stat value="4.9" label="Үнэлгээ" />
            </div>
          </div>

          {/* ═════ RIGHT VISUAL ═════ */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[480px] aspect-[5/6]">

              {/* Floating Top - Doctor badge */}
              <div className="absolute -top-4 right-0 z-20 bg-white border border-slate-200 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-float">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  DR
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-none">
                    Мэргэжлийн баг
                  </div>
                  <div className="text-[10px] text-blue-600 mt-1 font-semibold uppercase tracking-wider">
                    Олон улсын туршлага
                  </div>
                </div>
              </div>

              {/* MAIN GLASS CARD */}
              <div className="relative h-full rounded-[36px] overflow-hidden bg-gradient-to-br from-white to-blue-50/50 border-2 border-white shadow-[0_30px_80px_rgba(37,99,235,0.15)]">
                
                {/* Inner Background glows */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-200/40 blur-[80px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-100/40 blur-[60px] rounded-full" />

                {/* Top label */}
                <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/50">
                  <span className="text-[10px] font-bold text-blue-700 tracking-[0.2em] uppercase">
                    ✦ On Diagnostic
                  </span>
                </div>

                {/* Tooth - centered */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-200/30 blur-3xl rounded-full scale-125" />
                    <div className="relative text-[200px] drop-shadow-2xl animate-float-slow leading-none">
                      🦷
                    </div>
                  </div>
                </div>

                {/* Bottom status bar */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 p-4 flex items-center justify-between shadow-md">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                      Status
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      Perfect Health
                    </div>
                  </div>
                  <div className="text-3xl font-black text-blue-600">
                    98%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="text-4xl sm:text-5xl font-black text-slate-900 leading-none">
        {value}
      </div>
      <div className="mt-3 text-[10px] sm:text-xs font-semibold text-slate-500 tracking-[0.15em] uppercase">
        {label}
      </div>
    </div>
  );
}