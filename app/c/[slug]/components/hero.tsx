'use client';

import type { Branch, Clinic, Doctor, Service } from './types';
import { CalendarDays, Phone, MapPin, ChevronRight, Clock } from 'lucide-react';
import { OpenStatusPill } from './hours';
import { scrollToSection } from './nav';

export default function Hero({
  clinic,
  doctors,
  services,
  branches,
  onBookClick,
}: {
  clinic: Clinic;
  doctors: Doctor[];
  services: Service[];
  branches: Branch[];
  onBookClick: () => void;
}) {
  const phone = clinic.owner_phone;
  const hasBranches = branches.length > 0;

  // Зөвхөн бодит өгөгдөл. Байхгүй бол тэр мөр огт харагдахгүй.
  const facts = [
    doctors.length > 0 && { label: 'Мэргэшсэн эмч', value: doctors.length },
    services.length > 0 && { label: 'Үйлчилгээ', value: services.length },
    hasBranches && { label: 'Салбар', value: branches.length },
  ].filter(Boolean) as { label: string; value: number }[];

  const address = hasBranches ? `${branches.length} салбартай` : clinic.address;
  const showInfo = !!(clinic.business_hours || address || phone);

  return (
    <section id="top" className="site-section pt-28 sm:pt-36 pb-16 sm:pb-24">
      <div className="site-container grid lg:grid-cols-[1fr_360px] gap-12 lg:gap-16 items-center">
        <div>
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

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onBookClick} className="site-btn px-6 py-3 text-[15px]">
              <CalendarDays className="w-4 h-4" />
              Онлайнаар цаг захиалах
            </button>
            {phone && (
              <a href={`tel:${phone}`} className="site-btn-outline px-6 py-3 text-[15px]">
                <Phone className="w-4 h-4" />
                {phone}
              </a>
            )}
          </div>

          {facts.length > 0 && (
            <div className="flex flex-wrap gap-x-10 gap-y-4 mt-10 pt-8 border-t border-[var(--site-line)] max-w-lg">
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

        {/* Ирэхээс өмнө хэрэгтэй мэдээлэл — нэг дор */}
        {showInfo && (
          <div className="site-card p-2">
            {clinic.business_hours && (
              <InfoRow icon={Clock} label="Ажлын цаг" href="#contact" sectionId="contact">
                <OpenStatusPill hours={clinic.business_hours} />
              </InfoRow>
            )}
            {address && (
              <InfoRow
                icon={MapPin}
                label={hasBranches ? 'Салбарууд' : 'Хаяг'}
                href={
                  hasBranches
                    ? '#contact'
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                }
                sectionId={hasBranches ? 'contact' : undefined}
              >
                <span className="text-[14px] font-medium text-[var(--site-ink)] line-clamp-2">{address}</span>
              </InfoRow>
            )}
            {phone && (
              <InfoRow icon={Phone} label="Утас" href={`tel:${phone}`}>
                <span className="text-[14px] font-medium text-[var(--site-ink)]">{phone}</span>
              </InfoRow>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  href,
  sectionId,
  children,
}: {
  icon: typeof Clock;
  label: string;
  href: string;
  /** Хуудсан доторх хэсэг рүү бол гүйлгэнэ */
  sectionId?: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      onClick={sectionId ? e => scrollToSection(e, sectionId) : undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group flex items-center gap-4 p-4 rounded-[var(--site-r-btn)] hover:bg-[var(--site-bg-soft)] transition-colors"
    >
      <div className="site-icon-tile shrink-0">
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-[var(--site-muted)] mb-0.5">{label}</div>
        {children}
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--site-muted)] group-hover:text-[var(--site-accent)] transition-colors shrink-0" />
    </a>
  );
}
