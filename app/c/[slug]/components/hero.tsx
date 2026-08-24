'use client';

import type { Clinic, Doctor, Service } from './types';
import { CalendarDays, Phone, Clock, ShieldCheck } from 'lucide-react';

export default function Hero({
  clinic,
  doctors,
  services,
  onBookClick,
}: {
  clinic: Clinic;
  doctors: Doctor[];
  services: Service[];
  onBookClick: () => void;
}) {
  const phone = clinic.owner_phone;

  // Зөвхөн бодит өгөгдөл. Байхгүй бол тэр мөр огт харагдахгүй.
  const facts = [
    doctors.length > 0 && {
      icon: ShieldCheck,
      label: 'Мэргэшсэн эмч',
      value: `${doctors.length}`,
    },
    services.length > 0 && {
      icon: Clock,
      label: 'Үйлчилгээний төрөл',
      value: `${services.length}`,
    },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  return (
    <section className="site-section bg-white pt-32 sm:pt-36">
      <div className="site-container">
        <div className="max-w-2xl">
          <span className="site-eyebrow">{clinic.name}</span>

          <h1 className="site-h1 mb-5">
            Эрүүл шүд,
            <br />
            итгэлтэй инээмсэглэл
          </h1>

          <p className="site-lead max-w-lg mb-8">
            {clinic.about ??
              'Орчин үеийн тоног төхөөрөмж, туршлагатай эмч нарын хамт олон таны шүдний эрүүл мэндийг хариуцан ажиллаж байна.'}
          </p>

          <div className="flex flex-wrap gap-3">
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

          {facts.length > 0 && (
            <div className="inline-flex flex-wrap gap-10 mt-12 pt-8 border-t border-[var(--site-line)]">
              {facts.map(fact => (
                <div key={fact.label}>
                  <div className="text-[28px] font-bold text-[var(--site-ink)] leading-none mb-1.5">
                    {fact.value}
                  </div>
                  <div className="text-[13px] text-[var(--site-muted)]">{fact.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
