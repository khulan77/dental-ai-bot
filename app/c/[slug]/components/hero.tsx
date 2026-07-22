'use client';

import type { Clinic, Doctor, Service } from './types';
import { CalendarDays, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';

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

  // Хаяг, утас хоёулаа байхгүй бол баруун карт хоосон харагдана — тэгвэл огт харуулахгүй
  const hasContactCard = Boolean(clinic.address || phone);

  return (
    <section className="site-section bg-white pt-32 sm:pt-36">
      <div className="site-container">
        <div
          className={`grid gap-14 lg:gap-16 items-center ${
            hasContactCard ? 'lg:grid-cols-[1.1fr_0.9fr]' : 'max-w-2xl'
          }`}
        >

          {/* ЗҮҮН — текст */}
          <div>
            <span className="site-eyebrow">{clinic.name}</span>

            <h1 className="site-h1 mb-5">
              Шүдний эрүүл мэнд,
              <br />
              таны инээмсэглэл
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

          {/* БАРУУН — бодит мэдээллийн карт */}
          {hasContactCard && (
          <div className="site-card p-7">
            <h2 className="site-h3 mb-5">Эмнэлгийн мэдээлэл</h2>

            <div className="space-y-5">
              {clinic.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 group"
                >
                  <div className="site-icon-tile shrink-0">
                    <MapPin className="w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-[var(--site-muted)] mb-0.5">Хаяг</div>
                    <div className="text-[14px] font-medium text-[var(--site-ink)] leading-relaxed group-hover:text-[var(--site-accent)] transition-colors">
                      {clinic.address}
                    </div>
                  </div>
                </a>
              )}

              {phone && (
                <a href={`tel:${phone}`} className="flex gap-4 group">
                  <div className="site-icon-tile shrink-0">
                    <Phone className="w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-[var(--site-muted)] mb-0.5">Утас</div>
                    <div className="text-[14px] font-medium text-[var(--site-ink)] group-hover:text-[var(--site-accent)] transition-colors">
                      {phone}
                    </div>
                  </div>
                </a>
              )}

              <div className="flex gap-4">
                <div className="site-icon-tile shrink-0">
                  <CalendarDays className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <div className="text-[13px] text-[var(--site-muted)] mb-0.5">Цаг захиалга</div>
                  <div className="text-[14px] font-medium text-[var(--site-ink)]">
                    Онлайнаар 24 цагийн турш
                  </div>
                </div>
              </div>
            </div>

            <button onClick={onBookClick} className="site-btn w-full mt-7">
              Эмч сонгож цаг авах
            </button>
          </div>
          )}

        </div>
      </div>
    </section>
  );
}
