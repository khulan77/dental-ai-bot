'use client';

import { X, ChevronRight, Clock, Stethoscope } from 'lucide-react';
import type { Doctor, Service } from './types';

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-slate-100 flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/30">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Эмч сонгох</p>
            <h3 className="font-semibold text-slate-900 truncate leading-tight">{service.name}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {service.duration_minutes} мин · ₮{service.price_mnt.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition flex-shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Doctors list */}
        <div className="overflow-y-auto flex-1 p-5">
          {eligible.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🦷</div>
              <p className="text-sm text-slate-500">
                Энэ үйлчилгээнд одоогоор эмч бүртгэгдээгүй байна.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Энэ үйлчилгээг хийдэг эмч нар
              </p>
              {eligible.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => onSelectDoctor(doctor)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all group"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm shadow-blue-500/20">
                    {doctor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{doctor.name}</h4>
                    {doctor.specialty && (
                      <p className="text-xs text-blue-600 truncate">{doctor.specialty}</p>
                    )}
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Цаг авах боломжтой
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
