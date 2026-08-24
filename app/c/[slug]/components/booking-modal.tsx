'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  X, Calendar, Clock, User, Phone, Check, MapPin,
  Stethoscope, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { Doctor, Service, Branch, BusinessHours } from './types';
import { effectivePrice, isDiscountActive } from '@/lib/booking/pricing';
import { clinicDateISO, clinicInstantFrom } from '@/lib/booking/timezone';

type Props = {
  clinicId: string;
  /** Захиалга шалгах хуудас руу холбоход хэрэгтэй */
  clinicSlug: string;
  doctors: Doctor[];
  services: Service[];
  branches?: Branch[];
  /** Хаалттай өдрийг календарт бүдгэрүүлэхэд */
  businessHours?: BusinessHours | null;
  /** Эмчийн картаас орж ирвэл тэр эмч урьдчилан сонгогдоно */
  initialDoctor?: Doctor | null;
  initialBranchId?: string | null;
  initialService?: Service | null;
  onClose: () => void;
};

const WEEKDAY_LABELS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
const HOURS_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const MONTH_NAMES = [
  '1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
  '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар',
];

/** Хэдэн хоногийн дараах хүртэл захиалж болох вэ */
const BOOKING_HORIZON_DAYS = 60;

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
/** ISO огнооны гараг (0 = Ням). Календарын нүд тул бүсээс хамаарахгүй. */
const weekdayOf = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export default function BookingModal({
  clinicId,
  clinicSlug,
  doctors,
  services,
  branches = [],
  businessHours,
  initialDoctor,
  initialBranchId,
  initialService,
  onClose,
}: Props) {
  const hasBranches = branches.length > 0;

  // ── Алхам бүрийн сонголт ────────────────────────────────────────────
  const [branchId, setBranchId] = useState<string>(initialBranchId ?? '');
  const [date, setDate] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Дараагийн алхмуудын сонголтыг effect-ээр "цэвэрлэхгүй" — сонгосон зүйл
  // одоогийн жагсаалтад байгаа эсэхээр нь тооцоолж гаргана. Ингэснээр
  // салбар/эмч солиход хуучин сонголт өөрөө хүчингүй болно.
  const [doctorIdRaw, setDoctorId] = useState<string>(initialDoctor?.id ?? '');
  const [serviceRaw, setService] = useState<Service | null>(initialService ?? null);
  const [timeRaw, setTime] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Салбаргүй эмнэлэг — 1-р алхам байхгүй, шууд эмчээс эхэлнэ
  const branchChosen = !hasBranches || !!branchId;

  const visibleDoctors = useMemo(
    () => (hasBranches && branchId
      ? doctors.filter(d => d.branch_ids?.includes(branchId))
      : doctors),
    [doctors, hasBranches, branchId]
  );

  // Сонгосон эмч одоогийн салбарт ажилладаг эсэх
  const doctorId = visibleDoctors.some(d => d.id === doctorIdRaw) ? doctorIdRaw : '';
  const doctor = doctors.find(d => d.id === doctorId) ?? null;

  const doctorServices = useMemo(() => {
    if (!doctor) return [];
    return doctor.service_ids && doctor.service_ids.length > 0
      ? services.filter(s => doctor.service_ids!.includes(s.id))
      : services;
  }, [doctor, services]);

  // Сонгосон үйлчилгээг энэ эмч үздэг эсэх
  const service = serviceRaw && doctorServices.some(s => s.id === serviceRaw.id)
    ? serviceRaw
    : null;

  // ── Календар ────────────────────────────────────────────────────────
  const todayISO = clinicDateISO(new Date());
  const maxISO = useMemo(() => {
    const [y, m, d] = todayISO.split('-').map(Number);
    const limit = new Date(Date.UTC(y, m - 1, d + BOOKING_HORIZON_DAYS));
    return isoOf(limit.getUTCFullYear(), limit.getUTCMonth(), limit.getUTCDate());
  }, [todayISO]);

  const [month, setMonth] = useState(() => {
    const [y, m] = todayISO.split('-').map(Number);
    return { year: y, month: m - 1 }; // month: 0-11
  });

  /** Тухайн гараг эмнэлэг ажилладаг эсэх. Тохиргоо байхгүй бол бүх өдөр нээлттэй. */
  function isOpenOn(iso: string): boolean {
    if (!businessHours) return true;
    return businessHours[HOURS_KEYS[weekdayOf(iso)]] != null;
  }

  const monthCells = useMemo(() => {
    const { year, month: m } = month;
    const daysInMonth = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
    // Даваа гарагаар эхлүүлнэ: Ня(0) → 6, Да(1) → 0
    const firstWeekday = (new Date(Date.UTC(year, m, 1)).getUTCDay() + 6) % 7;

    const cells: ({ day: number; iso: string; disabled: boolean } | null)[] =
      Array(firstWeekday).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = isoOf(year, m, day);
      cells.push({
        day,
        iso,
        disabled: iso < todayISO || iso > maxISO || !isOpenOn(iso),
      });
    }
    return cells;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, todayISO, maxISO, businessHours]);

  const canGoPrev = `${month.year}-${pad(month.month + 1)}` > todayISO.slice(0, 7);
  const canGoNext = `${month.year}-${pad(month.month + 1)}` < maxISO.slice(0, 7);

  function shiftMonth(delta: number) {
    setMonth(prev => {
      const next = new Date(Date.UTC(prev.year, prev.month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  }

  // ── Сул цаг ─────────────────────────────────────────────────────────
  // Хариуг түлхүүртэй нь хамт хадгална: хэрэглэгч өдрөө хурдан сольвол
  // хоцорч ирсэн хуучин хариу харагдахгүй.
  const slotKey = `${doctorId}|${branchId}|${date}`;
  const [slotData, setSlotData] = useState<{
    key: string;
    slots: string[];
    closed: boolean;
  } | null>(null);

  const slotsReady = slotData?.key === slotKey;
  const slots = slotsReady ? slotData.slots : [];
  const dayClosed = slotsReady ? slotData.closed : false;
  const loadingSlots = !!doctorId && !!date && !slotsReady;

  useEffect(() => {
    if (!doctorId || !date) return;
    let cancelled = false;
    const branchParam = branchId ? `&branchId=${branchId}` : '';

    fetch(`/api/slots?clinicId=${clinicId}&doctorId=${doctorId}&date=${date}${branchParam}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setSlotData({ key: slotKey, slots: data.slots ?? [], closed: data.isOpen === false });
      })
      .catch(() => {
        if (cancelled) return;
        setSlotData({ key: slotKey, slots: [], closed: false });
      });

    return () => { cancelled = true; };
  }, [slotKey, date, branchId, doctorId, clinicId]);

  // Сонгосон цаг одоо ч сул байгаа эсэх
  const time = slots.includes(timeRaw) ? timeRaw : '';

  // Одоо аль алхам дээр байгаа вэ — товч болон гүйлгэлт хоёулаа үүнийг харна
  const currentStep = !branchChosen
    ? 'branch'
    : !doctorId
      ? 'doctor'
      : !service
        ? 'service'
        : !date
          ? 'date'
          : !time
            ? 'time'
            : 'contact';

  const missingLabel = !branchChosen
    ? 'Салбараа сонгоно уу'
    : !doctorId
      ? 'Эмчээ сонгоно уу'
      : !service
        ? 'Үйлчилгээгээ сонгоно уу'
        : !date
          ? 'Өдрөө сонгоно уу'
          : !time
            ? 'Цагаа сонгоно уу'
            : !customerName.trim()
              ? 'Нэрээ бичнэ үү'
              : !customerPhone.trim()
                ? 'Утасны дугаараа бичнэ үү'
                : null;

  const ready = missingLabel === null;

  // Шинэ алхам нээгдэхэд түүн рүү гүйлгэнэ — үгүй бол доор нээгдсэн алхам
  // харагдахгүй тул "товч ажиллахгүй байна" гэж ойлгогдоно.
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastStep = useRef(currentStep);

  function scrollToStep(step: string) {
    scrollRef.current
      ?.querySelector(`[data-step="${step}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useEffect(() => {
    if (lastStep.current === currentStep) return;
    lastStep.current = currentStep;
    scrollToStep(currentStep);
  }, [currentStep]);

  async function handleSubmit() {
    // Дутуу бол товчийг үхмэл болгохгүй — юу дутууг хэлээд тэр рүү нь аваачна
    if (!ready || !service) {
      setError(missingLabel ?? 'Бүх алхмыг гүйцээнэ үү');
      scrollToStep(currentStep);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicId,
        doctorId,
        branchId: branchId || null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        service: service.name,
        // Сонгосон цаг нь эмнэлгийн ханан дээрх цаг — offset-ийг гараар бичихгүй
        scheduledAt: clinicInstantFrom(date, time).toISOString(),
      }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setLoading(false); return; }
    setBookingCode(data.bookingCode ?? null);
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
        <div className="site-card w-full max-w-sm p-8 text-center" onClick={e => e.stopPropagation()}>
          <div className="w-14 h-14 rounded-full bg-[var(--site-ok-soft)] border border-[var(--site-ok-line)] flex items-center justify-center mx-auto mb-5">
            <Check className="w-7 h-7 text-[var(--site-ok)]" />
          </div>
          <h3 className="site-h3 mb-2">Захиалга илгээгдлээ</h3>
          <p className="site-body mb-6">
            Эмнэлэг баталгаажуулмагц танд мэдэгдэнэ.
          </p>

          {bookingCode && (
            <div className="rounded-[var(--site-r-btn)] bg-[var(--site-accent-soft)] border border-[var(--site-line)] px-4 py-3 mb-5">
              <div className="text-[12px] text-[var(--site-muted)] mb-0.5">Захиалгын код</div>
              <div className="text-[20px] font-semibold tracking-wider text-[var(--site-accent)]">
                {bookingCode}
              </div>
            </div>
          )}

          <div className="rounded-[var(--site-r-btn)] border border-[var(--site-line)] divide-y divide-[var(--site-line)] mb-6 text-left">
            {[
              ['Эмч', doctor?.name ?? '—'],
              ['Үйлчилгээ', service?.name ?? '—'],
              ['Цаг', `${date} ${time}`],
              ['Нэр', customerName],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                <span className="text-[13px] text-[var(--site-muted)]">{label}</span>
                <span className="text-[13px] font-medium text-[var(--site-ink)] text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <a
              href={`/c/${clinicSlug}/booking${bookingCode ? `?code=${bookingCode}` : ''}`}
              className="site-btn w-full"
            >
              Захиалгаа шалгах
            </a>
            <button onClick={onClose} className="site-btn-outline w-full">
              Хаах
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Алхмуудыг дугаарлана — салбаргүй эмнэлэгт "Салбар" алхам байхгүй тул гүйнэ
  let stepNo = 0;
  const nextStep = () => ++stepNo;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 sm:p-4" onClick={onClose}>
      <div className="site-modal" onClick={e => e.stopPropagation()}>

        <div className="site-modal-head">
          <div className="flex-1 min-w-0">
            <p className="site-eyebrow mb-0">Цаг захиалах</p>
            <h3 className="site-h3 truncate">
              {doctor ? doctor.name : 'Алхам алхмаар бөглөнө үү'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--site-bg-soft)] transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-[var(--site-muted)]" />
          </button>
        </div>

        <div ref={scrollRef} className="overflow-y-auto flex-1 p-5 space-y-6">

          {/* 1 — Салбар */}
          {hasBranches && (
            <Step no={nextStep()} step="branch" icon={MapPin} title="Салбар">
              <div className="space-y-2">
                {branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBranchId(b.id)}
                    aria-pressed={branchId === b.id}
                    className="site-option w-full flex flex-col items-start p-3.5"
                  >
                    <span className="text-[14px] font-medium text-[var(--site-ink)]">{b.name}</span>
                    {b.address && (
                      <span className="text-[13px] text-[var(--site-muted)] mt-0.5">{b.address}</span>
                    )}
                  </button>
                ))}
              </div>
            </Step>
          )}

          {/* 2 — Эмч */}
          {branchChosen && (
            <Step no={nextStep()} step="doctor" icon={Stethoscope} title="Эмч">
              {visibleDoctors.length === 0 ? (
                <Empty>Энэ салбарт одоогоор эмч бүртгэгдээгүй байна.</Empty>
              ) : (
                <div className="space-y-2">
                  {visibleDoctors.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDoctorId(d.id)}
                      aria-pressed={doctorId === d.id}
                      className="site-option w-full flex items-center gap-3 p-3.5 text-left"
                    >
                      <span className="w-9 h-9 rounded-full bg-[var(--site-accent-soft)] text-[var(--site-accent)] flex items-center justify-center text-[14px] font-semibold shrink-0">
                        {d.name.charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-medium text-[var(--site-ink)] truncate">
                          {d.name}
                        </span>
                        {d.specialty && (
                          <span className="block text-[13px] text-[var(--site-muted)] truncate">
                            {d.specialty}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Step>
          )}

          {/* 3 — Үйлчилгээ */}
          {doctor && (
            <Step no={nextStep()} step="service" title="Үйлчилгээ">
              <div className="space-y-2">
                {doctorServices.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setService(s)}
                    aria-pressed={service?.id === s.id}
                    className="site-option w-full flex items-center justify-between p-3.5"
                  >
                    <span className="text-[14px] font-medium text-[var(--site-ink)]">{s.name}</span>
                    {isDiscountActive(s) ? (
                      <span className="ml-2 shrink-0 text-right">
                        <span className="block text-[12px] text-[var(--site-muted)] line-through leading-none">
                          {s.price_mnt.toLocaleString()}₮
                        </span>
                        <span className="text-[14px] font-semibold text-[var(--site-sale)]">
                          {effectivePrice(s).toLocaleString()}₮
                        </span>
                      </span>
                    ) : (
                      <span className="text-[14px] font-semibold text-[var(--site-accent)] ml-2 shrink-0">
                        {s.price_mnt.toLocaleString()}₮
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </Step>
          )}

          {/* 4 — Өдөр (календар) */}
          {service && (
            <Step no={nextStep()} step="date" icon={Calendar} title="Өдөр">
              <div className="rounded-[var(--site-r-btn)] border border-[var(--site-line)] p-3">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => shiftMonth(-1)}
                    disabled={!canGoPrev}
                    aria-label="Өмнөх сар"
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--site-bg-soft)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-[var(--site-ink-soft)]" />
                  </button>
                  <span className="text-[14px] font-medium text-[var(--site-ink)]">
                    {MONTH_NAMES[month.month]} {month.year}
                  </span>
                  <button
                    onClick={() => shiftMonth(1)}
                    disabled={!canGoNext}
                    aria-label="Дараах сар"
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--site-bg-soft)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[var(--site-ink-soft)]" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAY_LABELS.map(w => (
                    <div key={w} className="text-center text-[11px] text-[var(--site-muted)] py-1">
                      {w}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {monthCells.map((cell, i) =>
                    cell === null ? (
                      <div key={`pad-${i}`} />
                    ) : (
                      <button
                        key={cell.iso}
                        onClick={() => setDate(cell.iso)}
                        disabled={cell.disabled}
                        aria-pressed={date === cell.iso}
                        className={`h-9 rounded-[var(--site-r-btn)] text-[13px] font-medium transition-colors ${
                          date === cell.iso
                            ? 'bg-[var(--site-accent)] text-white'
                            : cell.disabled
                              ? 'text-[var(--site-muted)] opacity-35 cursor-not-allowed'
                              : 'text-[var(--site-ink)] hover:bg-[var(--site-accent-soft)]'
                        } ${cell.iso === todayISO && date !== cell.iso ? 'ring-1 ring-[var(--site-accent)]' : ''}`}
                      >
                        {cell.day}
                      </button>
                    )
                  )}
                </div>
              </div>
            </Step>
          )}

          {/* 5 — Цаг */}
          {date && (
            <Step no={nextStep()} step="time" icon={Clock} title="Сул цаг">
              {loadingSlots ? (
                <div className="flex gap-1.5 py-5 justify-center">
                  <div className="w-1.5 h-1.5 bg-[var(--site-accent)] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[var(--site-accent)] rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-1.5 h-1.5 bg-[var(--site-accent)] rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              ) : slots.length === 0 ? (
                <Empty>
                  {dayClosed
                    ? 'Энэ өдөр эмнэлэг амарна. Өөр өдөр сонгоно уу.'
                    : 'Энэ өдөр сул цаг байхгүй байна.'}
                </Empty>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map(t => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      aria-pressed={time === t}
                      className="site-option py-2.5 text-center text-[14px] font-medium text-[var(--site-ink)]"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </Step>
          )}

          {/* 6 — Холбоо барих */}
          {time && (
            <Step no={nextStep()} step="contact" icon={User} title="Таны мэдээлэл">
              <div className="space-y-4">
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Овог Нэр"
                  className="site-input"
                />
                <div>
                  <p className="site-label">
                    <Phone className="w-3.5 h-3.5" /> Утасны дугаар
                  </p>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="9900 0000"
                    className="site-input"
                  />
                </div>
              </div>
            </Step>
          )}

          {error && (
            <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-[var(--site-r-btn)] px-4 py-3">
              {error}
            </p>
          )}
        </div>

        <div className="site-modal-foot">
          <button
            onClick={handleSubmit}
            disabled={loading}
            aria-disabled={!ready}
            className={`site-btn w-full disabled:opacity-40 disabled:cursor-not-allowed ${
              ready ? '' : 'opacity-60'
            }`}
          >
            {loading ? 'Захиалж байна...' : (missingLabel ?? 'Цаг захиалах')}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Дугаарласан алхам — гарчиг нь юу сонгохыг хэлнэ */
function Step({
  no,
  step,
  icon: Icon,
  title,
  children,
}: {
  no: number;
  /** Гүйлгэлтийн зорилт — footer товч дутуу алхам руу аваачна */
  step: string;
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div data-step={step} className="scroll-mt-2">
      <p className="site-label">
        <span className="w-5 h-5 rounded-full bg-[var(--site-accent-soft)] text-[var(--site-accent)] flex items-center justify-center text-[11px] font-semibold shrink-0">
          {no}
        </span>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {title}
      </p>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="site-body text-center py-4 rounded-[var(--site-r-btn)] bg-[var(--site-bg-soft)] border border-[var(--site-line)]">
      {children}
    </p>
  );
}
