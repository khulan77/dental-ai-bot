'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Doctor, Branch } from './types';
import { CalendarDays, MapPin } from 'lucide-react';

export default function Doctors({
  doctors,
  branches = [],
  onBookClick,
}: {
  doctors: Doctor[];
  branches?: Branch[];
  onChatClick: () => void;
  // branchId — салбар сонгосон бол тухайн салбар (modal-д урьдчилан сонгоно)
  onBookClick: (doctor: Doctor, branchId?: string) => void;
}) {
  const hasBranches = branches.length > 0;

  // Салбартай бол эхний салбарыг анхнаас идэвхжүүлнэ → тухайн салбарын эмч л харагдана
  const [activeBranchId, setActiveBranchId] = useState<string>(branches[0]?.id ?? '');

  if (doctors.length === 0) return null;

  // Салбар сонгосон бол тухайн салбарт ажилладаг эмчээр шүүнэ
  const visibleDoctors = hasBranches
    ? doctors.filter(d => d.branch_ids?.includes(activeBranchId))
    : doctors;

  return (
    <section id="doctors" className="site-section">
      <div className="site-container">

        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="site-eyebrow">Манай баг</span>
          <h2 className="site-h2 mb-4">Мэргэжлийн эмч нар</h2>
          <p className="site-lead">
            {hasBranches
              ? 'Салбараа сонгоод тухайн салбарын эмчээс цаг захиалаарай.'
              : 'Таны инээмсэглэлийг бүтээх туршлагатай эмч нараас бүрдсэн хамт олон.'}
          </p>
        </div>

        {/* Салбарын шүүлт — олон салбартай эмнэлэгт л */}
        {hasBranches && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => setActiveBranchId(b.id)}
                aria-pressed={activeBranchId === b.id}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--site-r-pill)] text-[13px] font-medium border transition-colors ${
                  activeBranchId === b.id
                    ? 'bg-[var(--site-accent)] text-white border-[var(--site-accent)]'
                    : 'bg-[var(--site-bg)] text-[var(--site-ink-soft)] border-[var(--site-line)] hover:border-[#CBD5E1]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {b.name}
              </button>
            ))}
          </div>
        )}

        {visibleDoctors.length === 0 ? (
          <p className="site-body text-center py-8">
            Энэ салбарт одоогоор эмч бүртгэгдээгүй байна.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleDoctors.map(doctor => (
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
                  onClick={() => onBookClick(doctor, hasBranches ? activeBranchId : undefined)}
                  className="site-btn w-full mt-auto"
                >
                  <CalendarDays className="w-4 h-4" />
                  Цаг авах
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
