'use client';

import type { Clinic, SectionLink } from './types';
import { Globe, Mail, Phone } from 'lucide-react';
import Logo from './logo';
import { scrollToSection } from './nav';

// lucide-react брэндийн лого агуулахаа больсон тул inline SVG
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const HEADING = 'text-[12px] font-semibold text-[var(--site-muted)] uppercase tracking-[0.12em] mb-4';

export default function Footer({ clinic, links }: { clinic: Clinic; links: SectionLink[] }) {
  const phone = clinic.owner_phone;

  // Бүгд Тохиргоо → Үндсэн хэсгийн өгөгдлөөс
  const socials = [
    clinic.facebook_url && { icon: FacebookIcon, label: 'Facebook', href: clinic.facebook_url },
    clinic.instagram_url && { icon: InstagramIcon, label: 'Instagram', href: clinic.instagram_url },
    clinic.website && { icon: Globe, label: 'Веб сайт', href: clinic.website },
  ].filter(Boolean) as { icon: (p: { className?: string }) => React.ReactNode; label: string; href: string }[];

  return (
    <footer className="bg-white border-t border-[var(--site-line)] px-5 sm:px-8 pt-14 pb-8">
      <div className="site-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] gap-10 pb-10 border-b border-[var(--site-line)]">

          <div>
            <div className="mb-4">
              <Logo name={clinic.name} />
            </div>
            <p className="site-body max-w-xs">
              Мэргэжлийн шүдний эмчилгээ, онлайн цаг захиалга, 24 цагийн AI ассистент.
            </p>
            {socials.length > 0 && (
              <div className="flex gap-2 mt-5">
                {socials.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="w-9 h-9 flex items-center justify-center rounded-[var(--site-r-btn)] border border-[var(--site-line)] text-[var(--site-muted)] hover:text-[var(--site-accent)] hover:border-[var(--site-accent)] transition-colors"
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className={HEADING}>Хуудас</h4>
            <ul className="space-y-2.5">
              {links.map(l => (
                <li key={l.id}>
                  <a href={`#${l.id}`} onClick={e => scrollToSection(e, l.id)} className="site-link">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`/c/${clinic.slug}/booking`} className="site-link">
                  Захиалга шалгах
                </a>
              </li>
            </ul>
          </div>

          {(phone || clinic.owner_email) && (
            <div>
              <h4 className={HEADING}>Холбоо барих</h4>
              <ul className="space-y-3">
                {phone && (
                  <li>
                    <a href={`tel:${phone}`} className="site-link inline-flex items-center gap-2.5">
                      <Phone className="w-4 h-4 shrink-0" />
                      {phone}
                    </a>
                  </li>
                )}
                {clinic.owner_email && (
                  <li>
                    <a href={`mailto:${clinic.owner_email}`} className="site-link inline-flex items-center gap-2.5 break-all">
                      <Mail className="w-4 h-4 shrink-0" />
                      {clinic.owner_email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-6">
          <p className="text-[12px] text-[var(--site-muted)]">
            © {new Date().getFullYear()} {clinic.name}. Бүх эрх хамгаалагдсан.
          </p>
          <p className="text-[12px] text-[var(--site-muted)]">
            Powered by <span className="font-semibold text-[var(--site-accent)]">Dental Clinic</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
