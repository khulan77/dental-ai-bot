'use client';

import { useState } from 'react';
import type { DaySchedule, TimeSlot } from '@/lib/booking/slots';

export default function CalendarView({ schedule }: { schedule: DaySchedule[] }) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const selectedDay = schedule[selectedDayIdx];

  return (
    <div className="space-y-6">
      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {schedule.map((day, idx) => {
          const date = new Date(day.date);
          const dayNum = date.getDate();
          const monthShort = date.toLocaleDateString('mn-MN', { month: 'short' });
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
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold">
              {new Date(selectedDay.date).toLocaleDateString('mn-MN', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            {selectedDay.isOpen && (
              <p className="text-sm text-slate-500 mt-1">
                {selectedDay.slots.filter(s => s.available).length} сул цаг /{' '}
                {selectedDay.slots.length} нийт слот
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
            <p className="font-medium">Энэ өдөр клиник амарна</p>
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
              // Уникаль booking-уудыг л харуулах
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
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
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

  return (
    <div
      className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-center"
      title={slot.customerName ?? 'Захиалсан'}
    >
      <p className="text-sm font-semibold text-red-900">{slot.start}</p>
      <p className="text-[10px] text-red-600 mt-0.5 truncate">
        {slot.customerName ?? 'Захиалсан'}
      </p>
    </div>
  );
}