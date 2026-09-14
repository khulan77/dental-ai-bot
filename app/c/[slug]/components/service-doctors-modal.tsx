'use client';

import Image from 'next/image';
import { ChevronRight, Clock } from 'lucide-react';
import type { Doctor, Service } from './types';
import { effectivePrice, isDiscountActive } from '@/lib/booking/pricing';
import Modal, { ModalClose } from './modal';
import DoctorAvatar from './doctor-avatar';

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
    <Modal label={`${service.name} — эмч сонгох`} onClose={onClose}>

      {/* Толгой */}
      <div className="site-modal-head">
        {service.image_url && (
          <Image
            src={service.image_url}
            alt=""
            width={64}
            height={64}
            className="w-16 h-16 rounded-[var(--site-r-btn)] object-cover shrink-0 bg-[var(--site-bg-soft)]"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="site-eyebrow mb-1">Эмч сонгох</p>
          <h3 className="site-h3 truncate">{service.name}</h3>
          <p className="text-[13px] text-[var(--site-muted)] flex flex-wrap items-center gap-1.5 mt-1">
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
              <span className="font-medium text-[var(--site-ink-soft)]">₮{service.price_mnt.toLocaleString()}</span>
            )}
          </p>
        </div>
        <ModalClose onClose={onClose} />
      </div>

      {/* Эмч нарын жагсаалт */}
      <div className="overflow-y-auto flex-1 p-5 pb-[max(20px,env(safe-area-inset-bottom))]">
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
                <DoctorAvatar doctor={doctor} size={44} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-medium text-[var(--site-ink)] truncate">{doctor.name}</h4>
                  {doctor.specialty && (
                    <p className="text-[13px] text-[var(--site-muted)] truncate">{doctor.specialty}</p>
                  )}
                </div>
                <span className="text-[13px] font-semibold text-[var(--site-accent)] shrink-0 hidden sm:inline">
                  Цаг авах
                </span>
                <ChevronRight className="w-5 h-5 text-[var(--site-muted)] group-hover:text-[var(--site-accent)] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
