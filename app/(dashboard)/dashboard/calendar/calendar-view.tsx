'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DaySchedule, TimeSlot } from '@/lib/booking/slots';
import { clinicDateISOLabel } from '@/lib/booking/timezone';

type Doctor = {
  id: string;
  name: string;
  specialty: string | null;
  custom_hours: any;
  service_ids: string[];
};

const DOCTOR_COLORS = [
  { bg: 'from-blue-500 to-cyan-500', light: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  { bg: 'from-purple-500 to-pink-500', light: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  { bg: 'from-emerald-500 to-teal-500', light: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  { bg: 'from-orange-500 to-amber-500', light: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  { bg: 'from-rose-500 to-red-500', light: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
];

export default function CalendarView({
  schedule,
  doctors,
  selectedDoctorId,
}: {
  schedule: DaySchedule[];
  doctors: Doctor[];
  selectedDoctorId: string;
}) {
  const router = useRouter();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const selectedDay = schedule[selectedDayIdx];

  function handleDoctorChange(doctorId: string) {
    const params = new URLSearchParams();
    if (doctorId !== 'all') {
      params.set('doctor', doctorId);
    }
    router.push(`/dashboard/calendar${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <div className="space-y-6">
      {/* Doctor selector tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 inline-flex gap-1 flex-wrap">
        <DoctorTab
          label="🦷 Бүгд"
          active={selectedDoctorId === 'all'}
          onClick={() => handleDoctorChange('all')}
          color={null}
        />
        {doctors.map((doctor, idx) => {
          const color = DOCTOR_COLORS[idx % DOCTOR_COLORS.length];
          return (
            <DoctorTab
              key={doctor.id}
              label={doctor.name}
              specialty={doctor.specialty}
              active={selectedDoctorId === doctor.id}
              onClick={() => handleDoctorChange(doctor.id)}
              color={color}
            />
          );
        })}
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {schedule.map((day, idx) => {
          const date = new Date(day.date);
          const dayNum = date.getDate();
          const isToday = idx === 0;
          const isSelected = idx === selectedDayIdx;
          const availableCount = day.slots.filter(s => s.available).length;

          return (
            <button
              key={day.date}
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all min-w-[100px] ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-600 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-medium opacity-80">
                {isToday ? 'Өнөөдөр' : day.dayName}
              </div>
              <div className="text-2xl font-bold mt-0.5">{dayNum}</div>
              <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                {day.isOpen ? `${availableCount} сул` : 'Амарна'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold">
              {clinicDateISOLabel(selectedDay.date)}
            </h2>
            {selectedDay.isOpen && (
              <p className="text-sm text-slate-500 mt-1">
                {selectedDay.slots.filter(s => s.available).length} сул цаг /{' '}
                {selectedDay.slots.length} нийт слот
                {selectedDay.doctorName && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • 👨‍⚕️ {selectedDay.doctorName}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></div>
              <span className="text-slate-600">Сул</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
              <span className="text-slate-600">Завгүй</span>
            </div>
          </div>
        </div>

        {/* Slots grid */}
        {!selectedDay.isOpen ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-5xl mb-2">😴</p>
            <p className="font-medium">
              {selectedDoctorId === 'all'
                ? 'Энэ өдөр клиник амарна'
                : `${selectedDay.doctorName ?? 'Эмч'} энэ өдөр амарна`}
            </p>
          </div>
        ) : selectedDay.slots.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-5xl mb-2">⏰</p>
            <p className="font-medium">Энэ өдөр илүү цаг алга</p>
            <p className="text-sm mt-1">Ажлын цаг дууссан</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {selectedDay.slots.map(slot => (
              <SlotCard key={slot.start} slot={slot} />
            ))}
          </div>
        )}
      </div>

      {/* Today's bookings */}
      {selectedDay.slots.some(s => !s.available) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">📋 Энэ өдрийн захиалга</h3>
          <div className="space-y-2">
            {selectedDay.slots
              .filter(s => !s.available)
              .filter((s, idx, arr) =>
                arr.findIndex(x => x.appointmentId === s.appointmentId) === idx
              )
              .map(slot => (
                <div
                  key={slot.appointmentId}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-sm font-medium text-blue-700">
                      {slot.customerName?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{slot.customerName}</p>
                      <p className="text-xs text-slate-500">{slot.start}</p>
                    </div>
                  </div>
                  {slot.status === 'pending' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                      ⏳ Баталгаажаагүй
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Doctors summary - зөвхөн "Бүгд" сонгосон үед */}
      {selectedDoctorId === 'all' && doctors.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">👨‍⚕️ Эмч тус бүрийн хуваарь</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {doctors.map((doctor, idx) => {
              const color = DOCTOR_COLORS[idx % DOCTOR_COLORS.length];
              return (
                <button
                  key={doctor.id}
                  onClick={() => handleDoctorChange(doctor.id)}
                  className={`p-4 rounded-xl border-2 transition text-left hover:shadow-md ${color.border} ${color.light}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center text-white font-bold`}
                    >
                      {doctor.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${color.text}`}>{doctor.name}</p>
                      {doctor.specialty && (
                        <p className="text-xs text-slate-600">{doctor.specialty}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {doctor.custom_hours ? '🕐 Өөрийн хуваарьтай' : '🕐 Клиникийн ажлын цаг'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DoctorTab({
  label,
  specialty,
  active,
  onClick,
  color,
}: {
  label: string;
  specialty?: string | null;
  active: boolean;
  onClick: () => void;
  color: { bg: string; light: string; text: string } | null;
}) {
  if (active && color) {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl bg-gradient-to-r ${color.bg} text-white text-sm font-semibold shadow-sm`}
      >
        {label}
        {specialty && <span className="ml-1 opacity-80 text-xs">({specialty})</span>}
      </button>
    );
  }

  if (active) {
    return (
      <button
        onClick={onClick}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow-sm"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition"
    >
      {label}
      {specialty && <span className="ml-1 opacity-60 text-xs">({specialty})</span>}
    </button>
  );
}

function SlotCard({ slot }: { slot: TimeSlot }) {
  if (slot.available) {
    return (
      <div className="px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center hover:bg-emerald-100 transition cursor-pointer">
        <p className="text-sm font-semibold text-emerald-900">{slot.start}</p>
        <p className="text-[10px] text-emerald-600 mt-0.5">Сул</p>
      </div>
    );
  }

  // Хүлээгдэж буй захиалга — баталгаажсанаас өнгөөр нь ялгана
  const isPending = slot.status === 'pending';

  return (
    <div
      className={`px-3 py-2.5 rounded-lg border text-center ${
        isPending ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
      }`}
      title={`${slot.customerName ?? 'Захиалсан'}${isPending ? ' — баталгаажаагүй' : ''}`}
    >
      <p className={`text-sm font-semibold ${isPending ? 'text-amber-900' : 'text-red-900'}`}>
        {slot.start}
      </p>
      <p
        className={`text-[10px] mt-0.5 truncate ${
          isPending ? 'text-amber-700' : 'text-red-600'
        }`}
      >
        {isPending ? '⏳ ' : ''}
        {slot.customerName ?? 'Захиалсан'}
      </p>
    </div>
  );
}