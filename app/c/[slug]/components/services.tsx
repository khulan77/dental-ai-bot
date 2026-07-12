'use client';

import type { Service } from './types';
import { Clock, ArrowUpRight } from 'lucide-react';

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
    <section
      className="bg-white py-24 sm:py-32 px-5 sm:px-8"
      style={{ fontFamily: 'var(--font-jakarta, var(--font-sans))' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16 premium-reveal-1">
          <span className="inline-block text-[12px] font-bold text-blue-600 tracking-[0.2em] uppercase mb-4">
            — Үйлчилгээнүүд —
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Бүх төрлийн{' '}
            <span className="italic font-light text-blue-600" style={{ fontFamily: 'var(--font-serif)' }}>
              эмчилгээ
            </span>
          </h2>
          <p className="text-[15px] text-slate-500 leading-relaxed">
            Орчин үеийн тоног төхөөрөмж, мэргэшсэн эмч нарын гараар хийгдэх бүх үйлчилгээ
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, idx) => (
            <button
              key={service.id}
              onClick={onChatClick}
              className="group text-left bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              {/* Icon row */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  {SERVICE_ICONS[idx % SERVICE_ICONS.length]}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-500">{service.duration_minutes} мин</span>
                </div>
              </div>

              {/* Name */}
              <h3 className="text-[16px] font-bold text-slate-900 mb-2 leading-snug">
                {service.name}
              </h3>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Үнэ</div>
                  <div className="text-[20px] font-extrabold text-blue-600">
                    ₮{service.price_mnt.toLocaleString()}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
