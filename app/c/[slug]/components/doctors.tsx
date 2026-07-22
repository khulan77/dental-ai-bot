'use client';

import Image from 'next/image';
import type { Doctor } from './types';
import { CalendarDays } from 'lucide-react';

export default function Doctors({
  doctors,
  onBookClick,
}: {
  doctors: Doctor[];
  onChatClick: () => void;
  onBookClick: (doctor: Doctor) => void;
}) {
  if (doctors.length === 0) return null;

  return (
    <section id="doctors" className="site-section">
      <div className="site-container">

        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="site-eyebrow">Манай баг</span>
          <h2 className="site-h2 mb-4">Мэргэжлийн эмч нар</h2>
          <p className="site-lead">
            Таны инээмсэглэлийг бүтээх туршлагатай эмч нараас бүрдсэн хамт олон.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map(doctor => (
            <div key={doctor.id} className="site-card site-card-hover p-6 flex flex-col">

              <div className="flex items-center gap-4 mb-5">
                {doctor.avatar_url ? (
                  <Image
                    src={doctor.avatar_url}
                    alt={doctor.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[var(--site-accent-soft)] text-[var(--site-accent)] flex items-center justify-center text-[18px] font-semibold shrink-0">
                    {doctor.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="site-h3 truncate">{doctor.name}</h3>
                  {doctor.specialty && (
                    <p className="text-[13px] text-[var(--site-accent)] font-medium mt-0.5 truncate">
                      {doctor.specialty}
                    </p>
                  )}
                </div>
              </div>

              {doctor.bio && (
                <p className="site-body mb-6 line-clamp-3">{doctor.bio}</p>
              )}

              <button
                onClick={() => onBookClick(doctor)}
                className="site-btn w-full mt-auto"
              >
                <CalendarDays className="w-4 h-4" />
                Цаг авах
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
