'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { clinicMinutesOfDay } from '@/lib/booking/timezone';
import type { CalAppointment, CalBranch, CalColumn, CalDoctor, CalService, DayHours } from './types';
import { aptStartMin, dateLabel, money, shiftISO, statusStyle, STATUS_STYLE, toHHMM, toMin, totalPrice } from './cal-utils';
import NewAppointmentPanel, { type Draft } from './new-appointment-panel';
import AppointmentPanel from './appointment-panel';
import CompleteToggle from '../appointments/complete-toggle';
import { isCheckable } from '../appointments/checkable';

/** Нэг мөр = 15 минут. 1 цаг = 80px. */
const STEP = 15;
const ROW_H = 20;
const HOUR_H = ROW_H * (60 / STEP);
const GUTTER = 56;

// Одоогийн цаг (минут) — минут тутам шинэчлэгдэнэ. Сервер дээр -1:
// улаан шугамыг зөвхөн хөтөч дээр зурна, үгүй бол hydration зөрнө.
const subscribeMinute = (tick: () => void) => {
  const id = setInterval(tick, 60_000);
  return () => clearInterval(id);
};
function useNowMinutes() {
  return useSyncExternalStore(subscribeMinute, () => clinicMinutesOfDay(new Date()), () => -1);
}

type View = {
  key: string;
  doctor: CalDoctor | null;
  hours: DayHours;
  items: CalAppointment[];
};

/** Давхцсан захиалгуудыг хажуу хажууд нь тавих эгнээ (lane) тооцоо */
function layoutLanes(items: CalAppointment[]) {
  const sorted = items
    .map(a => ({ id: a.id, start: aptStartMin(a), end: aptStartMin(a) + a.duration_minutes }))
    .sort((a, b) => a.start - b.start);
  const out = new Map<string, { lane: number; lanes: number }>();
  let cluster: typeof sorted = [];
  let clusterEnd = -1;

  const flush = () => {
    const laneEnds: number[] = [];
    for (const it of cluster) {
      let lane = laneEnds.findIndex(end => end <= it.start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(it.end);
      } else {
        laneEnds[lane] = it.end;
      }
      out.set(it.id, { lane, lanes: 0 });
    }
    for (const it of cluster) out.get(it.id)!.lanes = laneEnds.length;
  };

  for (const it of sorted) {
    if (cluster.length && it.start >= clusterEnd) {
      flush();
      cluster = [];
    }
    cluster.push(it);
    clusterEnd = Math.max(clusterEnd, it.end);
  }
  if (cluster.length) flush();
  return out;
}

export default function Scheduler({
  date,
  today,
  branches,
  branchId,
  columns,
  appointments,
  services,
  openNew,
}: {
  date: string;
  today: string;
  branches: CalBranch[];
  branchId: string | null;
  columns: CalColumn[];
  appointments: CalAppointment[];
  services: CalService[];
  openNew: boolean;
}) {
  const router = useRouter();
  const [navPending, startNav] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<{ col: string; row: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const nowMin = useNowMinutes();
  const isToday = date === today;

  // ── Багана ─────────────────────────────────────────────────────────
  const columnIds = new Set(columns.map(c => c.doctor.id));
  // Эмч оноогоогүй (чатаас ирсэн г.м.) эсвэл энэ салбараас хасагдсан эмчийн
  // захиалга алга болохгүйн тулд тусдаа багананд харуулна
  const stray = appointments.filter(a =>
    a.doctor_id
      ? !columnIds.has(a.doctor_id) && !!branchId && a.branch_id === branchId
      : !branchId || !a.branch_id || a.branch_id === branchId
  );

  const views: View[] = [
    ...columns.map(c => ({
      key: c.doctor.id,
      doctor: c.doctor,
      hours: c.hours,
      items: appointments.filter(a => a.doctor_id === c.doctor.id),
    })),
    ...(stray.length ? [{ key: '__none', doctor: null, hours: null, items: stray }] : []),
  ];

  // ── Харуулах цагийн хүрээ: хамгийн эрт нээхээс хамгийн орой хаах хүртэл ──
  const { startMin, endMin } = useMemo(() => {
    let s = Infinity;
    let e = -Infinity;
    for (const c of columns) {
      if (!c.hours) continue;
      s = Math.min(s, toMin(c.hours.open));
      e = Math.max(e, toMin(c.hours.close));
    }
    for (const a of appointments) {
      s = Math.min(s, aptStartMin(a));
      e = Math.max(e, aptStartMin(a) + a.duration_minutes);
    }
    if (!Number.isFinite(s)) {
      s = 9 * 60;
      e = 18 * 60;
    }
    // Өмнө, хойно нь нэг цагийн зай — ажлын бус цагт ч бүртгэж болно
    return {
      startMin: Math.max(0, Math.floor(s / 60) * 60 - 60),
      endMin: Math.min(24 * 60, Math.ceil(e / 60) * 60 + 60),
    };
  }, [columns, appointments]);

  const rows = (endMin - startMin) / STEP;
  const gridHeight = rows * ROW_H;
  const y = (minutes: number) => ((minutes - startMin) / STEP) * ROW_H;

  // Анх нээхэд: өнөөдөр бол одоогийн цаг руу, үгүй бол ажлын эхлэл рүү гүйлгэнэ
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const opens = columns.filter(c => c.hours).map(c => toMin(c.hours!.open));
    const target = isToday ? clinicMinutesOfDay(new Date()) - 60 : opens.length ? Math.min(...opens) : startMin;
    el.scrollTop = Math.max(0, ((target - startMin) / STEP) * ROW_H - 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  // ── Шинэ захиалгын маягт ────────────────────────────────────────────
  /** "+ Шинэ захиалга" — ажилладаг эхний эмч, дараагийн сул 15 минут */
  function defaultDraft(): Draft | null {
    const col = columns.find(c => c.hours) ?? columns[0];
    if (!col) return null;
    let minute = col.hours ? toMin(col.hours.open) : 10 * 60;
    if (isToday) {
      const next = Math.ceil(clinicMinutesOfDay(new Date()) / STEP) * STEP;
      if (next > minute) minute = next;
    }
    return { doctorId: col.doctor.id, date, time: toHHMM(Math.min(minute, 22 * 60 + 45)), duration: 30 };
  }

  const [draft, setDraft] = useState<Draft | null>(() => (openNew ? defaultDraft() : null));

  function go(nextDate: string, nextBranch = branchId) {
    const params = new URLSearchParams();
    if (nextDate !== today) params.set('date', nextDate);
    if (nextBranch) params.set('branch', nextBranch);
    const qs = params.toString();
    startNav(() => router.push(`/dashboard/calendar${qs ? `?${qs}` : ''}`, { scroll: false }));
  }

  function handleColumnClick(e: React.MouseEvent<HTMLDivElement>, view: View) {
    if (!view.doctor) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const row = Math.floor((e.clientY - rect.top) / ROW_H);
    setSelectedId(null);
    // Маягт аль хэдийн нээлттэй бол сонгосон үйлчилгээний хугацаа хэвээр
    setDraft(prev => ({
      doctorId: view.doctor!.id,
      date,
      time: toHHMM(startMin + row * STEP),
      duration: prev?.duration ?? 30,
    }));
  }

  function handleColumnHover(e: React.MouseEvent<HTMLDivElement>, view: View) {
    if (!view.doctor) return;
    const row = Math.floor((e.clientY - e.currentTarget.getBoundingClientRect().top) / ROW_H);
    if (hover?.col !== view.key || hover.row !== row) setHover({ col: view.key, row });
  }

  const selected = appointments.find(a => a.id === selectedId) ?? null;
  const branchName = branches.find(b => b.id === branchId)?.name ?? null;
  // Дүн нь зөвхөн дэлгэцэнд харагдаж буй (сонгосон салбарын) захиалгаар
  const visible = views.flatMap(v => v.items);
  const pendingCount = visible.filter(a => a.status === 'pending').length;
  const dayTotal = totalPrice(visible);
  const doctorName = (id: string | null) => columns.find(c => c.doctor.id === id)?.doctor.name ?? null;

  // Самбар нээлттэй үед том дэлгэцэнд хуанлийг зүүн тийш шахна — баганууд
  // самбарын доор халхлагдахгүй (самбар 400px − main-ийн 40px padding + зай)
  const panelOpen = !!draft || !!selected;

  return (
    <div className={`space-y-4 transition-[margin] duration-200 ${panelOpen ? 'lg:mr-[372px]' : ''}`}>
      {/* ── Хэрэгслийн мөр ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden">
            <button onClick={() => go(shiftISO(date, -1))} aria-label="Өмнөх өдөр" className="px-3 py-2 text-slate-600 hover:bg-slate-50 transition">‹</button>
            <button
              onClick={() => go(today)}
              disabled={isToday}
              className="px-3.5 py-2 text-[13px] font-medium text-slate-700 border-x border-slate-200 hover:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-white transition"
            >
              Өнөөдөр
            </button>
            <button onClick={() => go(shiftISO(date, 1))} aria-label="Дараах өдөр" className="px-3 py-2 text-slate-600 hover:bg-slate-50 transition">›</button>
          </div>

          <button
            onClick={() => dateInputRef.current?.showPicker?.()}
            className="relative inline-flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl hover:bg-white text-[14px] sm:text-[15px] font-semibold text-slate-900 whitespace-nowrap transition"
          >
            <span className="hidden sm:inline">📅</span> {dateLabel(date)}
            {isToday && <span className="hidden sm:inline text-[11px] font-semibold text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">Өнөөдөр</span>}
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={e => e.target.value && go(e.target.value)}
              tabIndex={-1}
              aria-hidden="true"
              className="absolute inset-0 opacity-0 pointer-events-none"
            />
          </button>
        </div>

        {/* Салбар — дарахад тэр салбарын эмч нар гарна */}
        {branches.length > 0 && (
          <div className="inline-flex p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full shrink-0">
            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => go(date, b.id)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition ${
                  b.id === branchId ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                📍 {b.name}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => { setSelectedId(null); setDraft(defaultDraft()); }}
          disabled={columns.length === 0}
          className="ml-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold shadow-sm whitespace-nowrap disabled:opacity-40 transition"
        >
          + Шинэ захиалга
        </button>
      </div>

      {/* ── Өдрийн дүн + өнгөний тайлбар ── */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[12px] text-slate-500">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-medium text-slate-700 tabular-nums">{visible.length} захиалга</span>
          {dayTotal > 0 && (
            <span className="font-semibold text-emerald-700 tabular-nums">· {money(dayTotal)}</span>
          )}
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-[11px] font-semibold">
              {pendingCount} баталгаажуулах
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {(['pending', 'confirmed', 'completed', 'no_show'] as const).map(s => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${STATUS_STYLE[s].dot}`} />
              {STATUS_STYLE[s].label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[repeating-linear-gradient(135deg,#e2e8f0_0_2px,#f8fafc_2px_4px)] border border-slate-200" />
            Ажлын бус цаг
          </span>
        </div>
      </div>

      {/* ── Хуваарь ── */}
      {views.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 px-6 text-slate-500">
          <p className="text-4xl mb-3">👩‍⚕️</p>
          <p className="font-medium text-slate-700">
            {branchId ? 'Энэ салбарт эмч холбогдоогүй байна' : 'Эмч бүртгэгдээгүй байна'}
          </p>
          <p className="text-sm mt-1">
            <a href="/dashboard/settings/doctors" className="text-blue-600 hover:underline">Тохиргоо → Эмч нар</a>
            {branchId ? ' хэсгээс эмчийг салбарт холбоно уу.' : ' хэсгээс эмчээ нэмнэ үү.'}
          </p>
        </div>
      ) : (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden transition-opacity ${navPending ? 'opacity-60' : ''}`}>
          <div ref={scrollRef} className="overflow-auto max-h-[calc(100dvh-230px)] min-h-[420px] overscroll-contain">
            <div
              className="grid"
              style={{ gridTemplateColumns: `${GUTTER}px repeat(${views.length}, minmax(176px, 1fr))` }}
            >
              {/* Толгой — дээш гүйлгэхэд тогтоно */}
              <div className="sticky top-0 left-0 z-30 bg-white border-b border-slate-200" />
              {views.map(v => (
                <div key={v.key} className="sticky top-0 z-20 bg-white border-b border-l border-slate-200 px-3 py-2.5 flex items-center gap-2.5 min-w-0">
                  {v.doctor ? <Avatar doctor={v.doctor} /> : (
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm shrink-0">?</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-slate-900 truncate">
                      {v.doctor?.name ?? 'Эмч оноогоогүй'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {v.doctor
                        ? v.hours ? v.doctor.specialty || `${v.hours.open}–${v.hours.close}` : 'Амарна'
                        : 'Чат болон бусад'}
                    </div>
                  </div>
                  {v.items.length > 0 && (
                    // Утсан дээр багана нарийн — нэрийг нь таслахгүйн тулд нууна
                    <div className="hidden sm:block shrink-0 text-right leading-tight tabular-nums">
                      <div className="text-[11px] font-medium text-slate-500">{v.items.length} захиалга</div>
                      {totalPrice(v.items) > 0 && (
                        <div className="text-[11px] font-semibold text-emerald-700">{money(totalPrice(v.items))}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Цагийн тэнхлэг */}
              <div className="sticky left-0 z-10 bg-white relative" style={{ height: gridHeight }}>
                {Array.from({ length: (endMin - startMin) / 60 }, (_, i) => startMin + i * 60).map(m => (
                  <span
                    key={m}
                    className="absolute right-2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums"
                    style={{ top: y(m) }}
                  >
                    {m === startMin ? '' : toHHMM(m)}
                  </span>
                ))}
                {isToday && nowMin >= startMin && nowMin <= endMin && (
                  <span
                    className="absolute right-1 -translate-y-1/2 text-[10px] font-semibold text-white bg-rose-500 rounded px-1 tabular-nums"
                    style={{ top: y(nowMin) }}
                  >
                    {toHHMM(nowMin)}
                  </span>
                )}
              </div>

              {/* Эмч бүрийн багана */}
              {views.map(v => {
                const lanes = layoutLanes(v.items);
                const clickable = !!v.doctor;
                return (
                  <div
                    key={v.key}
                    onClick={e => handleColumnClick(e, v)}
                    onMouseMove={e => handleColumnHover(e, v)}
                    onMouseLeave={() => setHover(null)}
                    className={`relative border-l border-slate-200 ${clickable ? 'cursor-pointer' : ''}`}
                    style={{
                      height: gridHeight,
                      backgroundImage:
                        'linear-gradient(to bottom, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
                      backgroundSize: `100% ${HOUR_H}px, 100% ${HOUR_H / 2}px`,
                    }}
                  >
                    {/* Ажлын бус цаг — зураастай саарал */}
                    {v.doctor && <OffHours hours={v.hours} y={y} startMin={startMin} endMin={endMin} />}

                    {/* Маягтад бөглөж буй шинэ захиалга — хаана орохыг харуулна */}
                    {draft && draft.date === date && draft.doctorId === v.key && (
                      <div
                        className="absolute inset-x-1 z-[7] rounded-md border-2 border-blue-500 bg-blue-100 text-[11px] font-semibold text-blue-800 px-2 py-0.5 pointer-events-none shadow-sm"
                        style={{ top: y(toMin(draft.time)) + 1, height: Math.max((draft.duration / STEP) * ROW_H - 2, ROW_H - 2) }}
                      >
                        Шинэ · {draft.time}–{toHHMM(toMin(draft.time) + draft.duration)}
                      </div>
                    )}

                    {/* Хулгана очсон нүд — "энд дарвал захиалга үүснэ" */}
                    {clickable && hover?.col === v.key && (
                      <div
                        className="absolute inset-x-1 rounded-md border border-dashed border-blue-400 bg-blue-50/70 text-[11px] font-semibold text-blue-700 px-2 flex items-center pointer-events-none"
                        style={{ top: hover.row * ROW_H + 1, height: ROW_H * 2 - 2 }}
                      >
                        + {toHHMM(startMin + hover.row * STEP)}
                      </div>
                    )}

                    {/* Захиалгууд */}
                    {v.items.map(a => {
                      const s = aptStartMin(a);
                      const height = Math.max((a.duration_minutes / STEP) * ROW_H - 2, ROW_H - 2);
                      const { lane, lanes: count } = lanes.get(a.id) ?? { lane: 0, lanes: 1 };
                      const otherBranch = !!branchId && !!a.branch_id && a.branch_id !== branchId;
                      const style = statusStyle(a.status);
                      const compact = height < 34;
                      const checkable = isCheckable(a.status);
                      const done = a.status === 'completed';
                      return (
                        // Чекбокс нь товч дотор байж болохгүй (HTML) тул хоёулаа
                        // нэг байрлалтай wrapper-ын дотор хөрш байна
                        <div
                          key={a.id}
                          onMouseMove={e => { e.stopPropagation(); if (hover) setHover(null); }}
                          className="absolute z-[5] hover:z-10"
                          style={{
                            top: y(s) + 1,
                            height,
                            left: `calc(${(lane / count) * 100}% + 3px)`,
                            width: `calc(${100 / count}% - 6px)`,
                          }}
                        >
                        <button
                          onClick={e => { e.stopPropagation(); setDraft(null); setSelectedId(a.id); }}
                          title={`${toHHMM(s)}–${toHHMM(s + a.duration_minutes)} · ${a.customer_name}${a.service ? ` · ${a.service}` : ''}${a.price != null ? ` · ${money(a.price)}` : ''}`}
                          // flex-col: товч агуулгаа босоо голлуулдаг — урт захиалгын бичиг дээд талдаа байна
                          className={`w-full h-full flex flex-col justify-start rounded-md border-l-[3px] pl-2 py-0.5 text-left overflow-hidden shadow-sm hover:shadow-md transition ${checkable ? 'pr-7' : 'pr-2'} ${style.block} ${
                            a.id === selectedId ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                          } ${otherBranch || a.status === 'no_show' ? 'opacity-60' : ''}`}
                        >
                          {compact ? (
                            <div className="flex items-center gap-1.5 text-[11px] leading-[18px]">
                              <span className="tabular-nums opacity-70 shrink-0">{toHHMM(s)}</span>
                              <span className={`font-semibold truncate ${done ? 'line-through decoration-slate-400' : ''}`}>{a.customer_name}</span>
                              {a.price != null && <span className="ml-auto shrink-0 font-semibold tabular-nums">{money(a.price)}</span>}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-baseline gap-2 pt-0.5">
                                <span className={`text-[12px] font-semibold leading-tight truncate ${done ? 'line-through decoration-slate-400' : ''}`}>{a.customer_name}</span>
                                {a.price != null && (
                                  <span className="ml-auto shrink-0 text-[11px] font-bold tabular-nums">{money(a.price)}</span>
                                )}
                              </div>
                              <div className="text-[11px] leading-tight truncate opacity-75 tabular-nums">
                                {toHHMM(s)}–{toHHMM(s + a.duration_minutes)}
                                {a.service && ` · ${a.service}`}
                              </div>
                              {otherBranch && height >= 56 && (
                                <div className="text-[10px] mt-0.5 opacity-70">📍 Өөр салбар</div>
                              )}
                            </>
                          )}
                        </button>
                        {checkable && (
                          <span className={`absolute right-1 ${compact ? 'top-1/2 -translate-y-1/2' : 'top-1'}`}>
                            <CompleteToggle appointmentId={a.id} status={a.status} size="sm" />
                          </span>
                        )}
                        </div>
                      );
                    })}

                    {/* Одоогийн цаг — захиалгын доор: бичгийг нь дайрч зурахгүй */}
                    {isToday && nowMin >= startMin && nowMin <= endMin && (
                      <div className="absolute inset-x-0 z-[4] pointer-events-none" style={{ top: y(nowMin) }}>
                        <div className="h-0.5 bg-rose-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {draft && (
        <NewAppointmentPanel
          draft={draft}
          onDraftChange={setDraft}
          viewDate={date}
          branchId={branchId}
          branchName={branchName}
          columns={columns}
          appointments={appointments}
          services={services}
          onClose={() => setDraft(null)}
          onCreated={(code, createdDate) => {
            setDraft(null);
            setToast(`Захиалга бүртгэгдлээ${code ? ` · код ${code}` : ''}`);
            if (createdDate !== date) go(createdDate);
          }}
        />
      )}

      {selected && (
        <AppointmentPanel
          appointment={selected}
          doctorName={doctorName(selected.doctor_id)}
          branchName={branches.find(b => b.id === selected.branch_id)?.name ?? null}
          onClose={() => setSelectedId(null)}
        />
      )}

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

function OffHours({
  hours,
  y,
  startMin,
  endMin,
}: {
  hours: DayHours;
  y: (m: number) => number;
  startMin: number;
  endMin: number;
}) {
  const shade = 'absolute inset-x-0 bg-[repeating-linear-gradient(135deg,rgba(226,232,240,0.55)_0_6px,rgba(248,250,252,0.55)_6px_12px)] pointer-events-none';
  if (!hours) {
    return (
      <div className={shade} style={{ top: 0, bottom: 0 }}>
        <div className="sticky top-14 text-center text-[12px] font-medium text-slate-400 pt-3">Амарна</div>
      </div>
    );
  }
  const open = toMin(hours.open);
  const close = toMin(hours.close);
  return (
    <>
      {open > startMin && <div className={shade} style={{ top: 0, height: y(open) }} />}
      {close < endMin && <div className={shade} style={{ top: y(close), bottom: 0 }} />}
    </>
  );
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
];

function Avatar({ doctor }: { doctor: CalDoctor }) {
  if (doctor.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={doctor.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />;
  }
  // Эмч бүр тогтмол өөр өнгөтэй — багануудыг нүдээр ялгахад амар
  const hash = [...doctor.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  // "Б. Энхжаргал" → "Э": овгийн үсэг биш, нэрийнх
  const initial = (doctor.name.split(/\.\s*/).pop() || doctor.name).charAt(0);
  return (
    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 ${AVATAR_COLORS[hash % AVATAR_COLORS.length]}`}>
      {initial}
    </span>
  );
}
