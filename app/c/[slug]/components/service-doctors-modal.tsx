'use client';

import { X, ChevronRight, Clock, Stethoscope } from 'lucide-react';
import type { Doctor, Service } from './types';
import { effectivePrice, isDiscountActive } from '@/lib/booking/pricing';

type Props = {
  service: Service;
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
  onClose: () => void;
};

/**
 * Үйлчилгээ дээр дарахад — тухайн эмчилгээг хийдэг эмч нарыг харуулна.
 * service_ids хоосон эмч = бүх үйлчилгээ хийдэг.
 */
export default function ServiceDoctorsModal({ service, doctors, onSelectDoctor, onClose }: Props) {
  const eligible = doctors.filter(
    (d) => !d.service_ids || d.service_ids.length === 0 || d.service_ids.includes(service.id)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 sm:p-4"
      onClick={onClose}
    >
      <div className="site-modal" onClick={(e) => e.stopPropagation()}>

        {/* Толгой */}
        <div className="site-modal-head">
          <div className="w-11 h-11 rounded-[var(--site-r-btn)] bg-[var(--site-accent-soft)] text-[var(--site-accent)] flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="site-eyebrow mb-0">Эмч сонгох</p>
            <h3 className="site-h3 truncate">{service.name}</h3>
            <p className="text-[13px] text-[var(--site-muted)] flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {service.duration_minutes} мин ·{' '}
              {isDiscountActive(service) ? (
                <>
                  <span className="line-through">₮{service.price_mnt.toLocaleString()}</span>
                  <span className="font-semibold text-[var(--site-sale)]">
                    ₮{effectivePrice(service).toLocaleString()}
                  </span>
                  <span className="site-sale-badge text-[10px]">
                    -{service.discount_percent}%
                  </span>
                </>
              ) : (
                <>₮{service.price_mnt.toLocaleString()}</>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--site-bg-soft)] transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-[var(--site-muted)]" />
          </button>
        </div>

        {/* Эмч нарын жагсаалт */}
        <div className="overflow-y-auto flex-1 p-5">
          {eligible.length === 0 ? (
            <p className="site-body text-center py-10">
              Энэ үйлчилгээнд одоогоор эмч бүртгэгдээгүй байна.
            </p>
          ) : (
            <div className="space-y-2.5">
              <p className="site-label">Энэ үйлчилгээг хийдэг эмч нар</p>
              {eligible.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => onSelectDoctor(doctor)}
                  className="site-option w-full flex items-center gap-3 p-3.5 group"
                >
                  <div className="w-11 h-11 rounded-full bg-[var(--site-accent-soft)] text-[var(--site-accent)] flex items-center justify-center font-semibold text-[16px] shrink-0">
                    {doctor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-medium text-[var(--site-ink)] truncate">{doctor.name}</h4>
                    {doctor.specialty && (
                      <p className="text-[13px] text-[var(--site-muted)] truncate">{doctor.specialty}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--site-muted)] group-hover:text-[var(--site-accent)] transition-colors shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
