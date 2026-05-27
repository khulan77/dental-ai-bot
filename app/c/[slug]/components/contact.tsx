'use client';

import type { Clinic } from './types';
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  Sparkles,
  Clock,
  MessageCircle,
  CalendarDays,
} from 'lucide-react';

export default function Contact({
  clinic,
  onChatClick,
}: {
  clinic: Clinic;
  onChatClick: () => void;
}) {
  const phone = clinic.owner_phone;

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white">
      {/* Subtle background glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/40 blur-[120px] rounded-full -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-100/30 blur-[120px] rounded-full translate-x-1/2" />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
        
        {/* Main card - DEEP NAVY instead of bright blue */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.5)]">
          
          {/* Subtle decorative blobs */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-400/5 rounded-full blur-[80px]" />

          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Noise/dot texture */}
          <div 
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 0.5px, transparent 0.5px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

          {/* CONTENT */}
          <div className="relative p-8 sm:p-12 lg:p-16 text-white">
            
            {/* ═════ HEADER ═════ */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-blue-100">
                  Холбоо барих
                </span>
              </div>

              {/* Title - more elegant */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
                Таны инээмсэглэл
                <span 
                  className="block mt-2 bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent"
                  style={{
                    backgroundSize: '200% auto',
                  }}
                >
                  бидний бахархал
                </span>
              </h2>

              {/* Description */}
              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto">
                AI ассистенттэй чатлаж <span className="font-semibold text-white">шууд цаг захиалах</span> боломжтой. 24/7 ажиллана.
              </p>

              {/* Inline features */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>24/7 ажиллана</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>Шууд хариулна</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                  <span>Цаг захиална</span>
                </div>
              </div>
            </div>

            {/* ═════ CONTACT CARDS ═════ */}
            {(clinic.address || phone) && (
              <div className="grid sm:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto">
                {clinic.address && (
                  <ContactCard 
                    icon={<MapPin className="w-5 h-5" />}
                    label="Хаяг" 
                    value={clinic.address} 
                  />
                )}
                {phone && (
                  <ContactCard 
                    icon={<Phone className="w-5 h-5" />}
                    label="Утас" 
                    value={phone}
                    href={`tel:${phone}`}
                  />
                )}
              </div>
            )}

            {/* ═════ CTA BUTTONS ═════ */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              
              {/* Main CTA - white with glow */}
              <button
                onClick={onChatClick}
                className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold shadow-[0_20px_50px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_25px_60px_-10px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span>Чат эхлүүлэх</span>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Secondary CTA */}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-blue-300" />
                  <span>{phone}</span>
                </a>
              )}
            </div>

            {/* ═════ TRUST BAR ═════ */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                <TrustItem value="200+" label="Сэтгэгдэл" />
                <Divider />
                <TrustItem value="4.9" label="Үнэлгээ" star />
                <Divider />
                <TrustItem value="24/7" label="Хариулна" />
                <Divider />
                <TrustItem value="100%" label="Баталгаа" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="group relative flex items-start gap-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-300 group-hover:bg-blue-500/25 group-hover:text-blue-200 group-hover:scale-110 transition-all">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">
          {label}
        </div>
        <div className="text-sm sm:text-base font-semibold break-words leading-snug text-white">
          {value}
        </div>
      </div>
      {href && (
        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0 mt-3" />
      )}
    </div>
  );

  if (href) return <a href={href} className="block">{content}</a>;
  return content;
}

function TrustItem({ value, label, star }: { value: string; label: string; star?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
        {value}
      </div>
      <div className="flex items-center gap-1">
        {star && (
          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )}
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
          {label}
        </span>
      </div>
    </div>
  );
}

function Divider() {
  return <span className="w-px h-6 bg-white/10" />;
}