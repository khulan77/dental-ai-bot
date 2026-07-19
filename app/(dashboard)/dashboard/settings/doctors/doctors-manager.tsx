'use client';

import { useState } from 'react';
import { addDoctor, updateDoctor, deleteDoctor } from '@/lib/db/clinic-actions';
import type { BusinessHoursData } from '@/lib/db/clinic-actions';
import DoctorForm from './doctor-form';

type Service = {
  id: string;
  name: string;
  price_mnt: number;
  duration_minutes: number;
};

type Doctor = {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  service_ids: string[];
  custom_hours: BusinessHoursData | null;
};

export default function DoctorsManager({
  services,
  clinicHours,
  initialDoctors,
}: {
  services: Service[];
  clinicHours: BusinessHoursData;
  initialDoctors: Doctor[];
}) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleAdd(data: any) {
    setLoading(true);
    const result = await addDoctor(data);

    if (result.success && result.doctor) {
      setDoctors([...doctors, result.doctor]);
      setShowAddForm(false);
      showMessage('success', 'Эмч амжилттай нэмэгдлээ!');
    } else {
      showMessage('error', result.error ?? 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  async function handleUpdate(doctorId: string, data: any) {
    setLoading(true);
    const result = await updateDoctor(doctorId, data);

    if (result.success) {
      setDoctors(doctors.map(d => (d.id === doctorId ? { ...d, ...data } : d)));
      setEditingId(null);
      showMessage('success', 'Амжилттай шинэчлэгдлээ!');
    } else {
      showMessage('error', result.error ?? 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  async function handleDelete(doctorId: string, name: string) {
    if (!confirm(`${name}-г устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return;

    setLoading(true);
    const result = await deleteDoctor(doctorId);

    if (result.success) {
      setDoctors(doctors.filter(d => d.id !== doctorId));
      showMessage('success', 'Эмч устгагдлаа');
    } else {
      showMessage('error', result.error ?? 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? '✓' : '⚠️'} {message.text}
        </div>
      )}

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition font-medium"
        >
          + Шинэ эмч нэмэх
        </button>
      )}

      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="font-semibold text-blue-900 mb-4">Шинэ эмч</h3>
          <DoctorForm
            services={services}
            clinicHours={clinicHours}
            onCancel={() => setShowAddForm(false)}
            onSubmit={handleAdd}
            loading={loading}
            submitLabel="Нэмэх"
          />
        </div>
      )}

      <div className="space-y-3">
        {doctors.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">👨‍⚕️</p>
            <p>Эмч хараахан байхгүй</p>
            <p className="text-sm mt-1">Дээрх товчийг дарж эмчээ нэмнэ үү</p>
          </div>
        )}

        {doctors.map(doctor => (
          <div
            key={doctor.id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden"
          >
            {editingId === doctor.id ? (
              <div className="p-5 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-4">Засах: {doctor.name}</h4>
                <DoctorForm
                  initialData={doctor}
                  services={services}
                  clinicHours={clinicHours}
                  onCancel={() => setEditingId(null)}
                  onSubmit={data => handleUpdate(doctor.id, data)}
                  loading={loading}
                  submitLabel="Хадгалах"
                />
              </div>
            ) : (
              <div className="p-5 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-lg font-bold text-blue-700 flex-shrink-0">
                      {doctor.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900">{doctor.name}</h4>
                        {doctor.specialty && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {doctor.specialty}
                          </span>
                        )}
                      </div>
                      {doctor.bio && (
                        <p className="text-sm text-slate-600 mt-1">{doctor.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {doctor.service_ids.length === 0 ? (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                            ✨ Бүх үйлчилгээ
                          </span>
                        ) : (
                          doctor.service_ids.map(sid => {
                            const service = services.find(s => s.id === sid);
                            return (
                              <span
                                key={sid}
                                className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded"
                              >
                                {service?.name ?? sid}
                              </span>
                            );
                          })
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">
                        {doctor.custom_hours
                          ? '🕐 Өөрийн хуваарьтай'
                          : '🕐 Клиникийн default цагаар'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingId(doctor.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Засах"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(doctor.id, doctor.name)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Устгах"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}