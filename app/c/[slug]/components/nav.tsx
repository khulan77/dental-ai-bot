'use client';

import type { Clinic } from './types';
import { CalendarDays } from 'lucide-react';

export default function Nav({ 
  clinic, 
  onChatClick 
}: { 
  clinic: Clinic;
  onChatClick: () => void;
}) {
  return (
    <nav className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 bg-blue-200/50 rounded-2xl blur-md" />
            {/* Logo */}
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200/50 flex items-center justify-center shadow-sm">
              <span className="text-2xl">🦷</span>
            </div>
          </div>
          <div>
            <div className="font-bold text-slate-900 text-base sm:text-lg leading-tight truncate max-w-[200px]">
              {clinic.name}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-[0.15em] uppercase">
              Шүдний төв
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          
          {/* Status badge - desktop only */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              Хүлээн авч байна
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={onChatClick}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Цаг авах</span>
          </button>
        </div>
      </div>
    </nav>
  );
}