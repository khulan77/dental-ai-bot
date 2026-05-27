'use client';

import type { Service } from './types';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';

const SERVICE_ICONS = ['🦷', '✨', '💎', '🪥', '😁', '🌟', '🩺', '💉'];

export default function Services({
  services,
  onChatClick,
}: {
  services: Service[];
  onChatClick: () => void;
}) {
  if (services.length === 0) return null;

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Background glows */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-200/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-100/30 blur-[120px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* ═════ HEADER ═════ */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/60 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-[12px] font-bold text-blue-700 tracking-[0.15em] uppercase">
              Манай үйлчилгээ
            </span>
          </div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05]">
            Бүх төрлийн{' '}
            <span className="text-blue-600">эмчилгээ</span>
          </h2>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-500 leading-relaxed">
            Орчин үеийн технологитой, мэргэжлийн түвшний шүдний эмчилгээний бүх үйлчилгээ
          </p>
        </div>

        {/* ═════ SERVICES GRID ═════ */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {services.map((service, idx) => (
            <button
              key={service.id}
              onClick={onChatClick}
              className="group relative text-left bg-white border-2 border-slate-100 hover:border-blue-200 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              {/* Hover glow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {SERVICE_ICONS[idx % SERVICE_ICONS.length]}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mb-2">
                  {service.name}
                </h3>

                {/* Duration */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-6">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{service.duration_minutes} минут</span>
                </div>

                {/* Price + Arrow */}
                <div className="flex items-end justify-between pt-5 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                      Үнэ
                    </div>
                    <div className="text-2xl font-black text-blue-600">
                      ₮{service.price_mnt.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-600 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}