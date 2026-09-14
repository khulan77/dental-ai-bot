'use client';

import type { Clinic, Branch } from './types';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { WeeklyHours } from './hours';

const mapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

/** Хаяг, утас, ажлын цаг — эмнэлэг рүү ирэхэд хэрэгтэй бүх зүйл нэг дор */
export default function Contact({
  clinic,
  branches = [],
}: {
  clinic: Clinic;
  branches?: Branch[];
}) {
  const phone = clinic.owner_phone;
  const hasBranches = branches.length > 0;
  const hours = clinic.business_hours;

  const hasContacts = hasBranches || clinic.address || phone || clinic.owner_email;
  if (!hasContacts && !hours) return null;

  return (
    <section id="contact" className="site-section">
      <div className="site-container">

        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="site-eyebrow">Холбоо барих</span>
          <h2 className="site-h2 mb-4">{hasBranches ? 'Манай салбарууд' : 'Биднийг зорин ирэх'}</h2>
          <p className="site-lead">
            {hasBranches
              ? 'Танд ойр салбараа сонгоод зочлоорой.'
              : 'Хаяг, утас, ажлын цагаа нэг дороос хараарай.'}
          </p>
        </div>

        <div className={`grid gap-5 ${hours && hasContacts ? 'lg:grid-cols-[1fr_360px]' : 'max-w-2xl mx-auto'}`}>
          {hasContacts && (
            <div className={`grid gap-4 content-start ${hasBranches && branches.length > 1 ? 'sm:grid-cols-2' : ''}`}>
              {hasBranches ? (
                branches.map(b => (
                  <div key={b.id} className="site-card p-5 flex flex-col">
                    <div className="flex items-start gap-4">
                      <div className="site-icon-tile shrink-0">
                        <MapPin className="w-[18px] h-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-[var(--site-ink)]">{b.name}</h3>
                        {b.address && (
                          <p className="text-[13px] text-[var(--site-muted)] leading-relaxed mt-1">{b.address}</p>
                        )}
                      </div>
                    </div>
                    {(b.address || b.phone) && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--site-line)]">
                        {b.address && (
                          <a href={mapsUrl(b.address)} target="_blank" rel="noopener noreferrer" className="site-btn-outline py-2 px-3 text-[13px] flex-1">
                            <MapPin className="w-3.5 h-3.5" />
                            Газрын зураг
                          </a>
                        )}
                        {b.phone && (
                          <a href={`tel:${b.phone}`} className="site-btn-outline py-2 px-3 text-[13px] flex-1">
                            <Phone className="w-3.5 h-3.5" />
                            {b.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <>
                  {clinic.address && (
                    <ContactCard icon={MapPin} label="Хаяг" href={mapsUrl(clinic.address)} external>
                      {clinic.address}
                    </ContactCard>
                  )}
                  {phone && (
                    <ContactCard icon={Phone} label="Утас" href={`tel:${phone}`}>
                      {phone}
                    </ContactCard>
                  )}
                  {clinic.owner_email && (
                    <ContactCard icon={Mail} label="Имэйл" href={`mailto:${clinic.owner_email}`}>
                      <span className="break-all">{clinic.owner_email}</span>
                    </ContactCard>
                  )}
                </>
              )}
            </div>
          )}

          {hours && (
            <WeeklyHours
              hours={hours}
              note={hasBranches ? 'Салбар бүрийн цагийн хуваарь өөр байж болно. Сул цагийг захиалахдаа харна.' : undefined}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  label,
  href,
  external,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="site-card site-card-hover flex items-center gap-4 p-5 group"
    >
      <div className="site-icon-tile shrink-0">
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-[var(--site-muted)] mb-0.5">{label}</div>
        <div className="text-[15px] font-medium text-[var(--site-ink)] leading-relaxed group-hover:text-[var(--site-accent)] transition-colors">
          {children}
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-[var(--site-muted)] group-hover:text-[var(--site-accent)] transition-colors shrink-0" />
    </a>
  );
}
