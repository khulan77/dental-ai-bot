'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar, Clock, User, Phone, Check, MapPin,
  Stethoscope, ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import type { Doctor, Service, Branch, BusinessHours } from './types';
import { effectivePrice, isDiscountActive } from '@/lib/booking/pricing';
import { clinicDateISO, clinicInstantFrom } from '@/lib/booking/timezone';
import Modal, { ModalClose } from './modal';
import DoctorAvatar from './doctor-avatar';

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

type StepKey = 'branch' | 'doctor' | 'service' | 'date' | 'time' | 'contact';

const STEP_META: Record<StepKey, { title: string; icon: React.ComponentType<{ className?: string }> }> = {
  branch: { title: 'Салбар', icon: MapPin },
  doctor: { title: 'Эмч', icon: Stethoscope },
  service: { title: 'Үйлчилгээ', icon: Sparkles },
  date: { title: 'Өдөр', icon: Calendar },
  time: { title: 'Цаг', icon: Clock },
  contact: { title: 'Таны мэдээлэл', icon: User },
};

const WEEKDAY_LABELS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
const WEEKDAY_FULL = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
const HOURS_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const MONTH_NAMES = [
  '1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
  '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар',
];

/** Сул цагийг өдрийн хэсгээр бүлэглэнэ — урт жагсаалтаас хайхад амар */
const SLOT_GROUPS = [
  { label: 'Өглөө', from: 0, to: 12 },
  { label: 'Өдөр', from: 12, to: 17 },
  { label: 'Орой', from: 17, to: 24 },
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
/** "9-р сарын 14, Даваа" */
const dateLabel = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${m}-р сарын ${d}, ${WEEKDAY_FULL[weekdayOf(iso)]}`;
};
const priceLabel = (s: Service) => `₮${effectivePrice(s).toLocaleString()}`;

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
  // Сонгох зүйлгүй алхмыг алгасна: нэг л салбартай, эсвэл сонгосон эмч
  // ганц салбарт ажилладаг бол салбар нь аль хэдийн тодорхой.
  const [branchId, setBranchId] = useState<string>(() => {
    if (initialBranchId) return initialBranchId;
    if (branches.length === 1) return branches[0].id;
    const only = initialDoctor?.branch_ids?.length === 1 ? initialDoctor.branch_ids[0] : '';
    return branches.some(b => b.id === only) ? only : '';
  });
  const [date, setDate] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Дараагийн алхмуудын сонголтыг effect-ээр "цэвэрлэхгүй" — сонгосон зүйл
  // одоогийн жагсаалтад байгаа эсэхээр нь тооцоолж гаргана. Ингэснээр
  // салбар/эмч солиход хуучин сонголт өөрөө хүчингүй болно.
  const [doctorIdRaw, setDoctorId] = useState<string>(initialDoctor?.id ?? '');
  const [serviceRaw, setService] = useState<Service | null>(initialService ?? null);
  const [timeRaw, setTime] = useState<string>('');

  /** "Солих" дарсан алхам. null бол дараагийн дутуу алхам нээлттэй. */
  const [editing, setEditing] = useState<StepKey | null>(null);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Салбаргүй эмнэлэг — 1-р алхам байхгүй, шууд эмчээс эхэлнэ
  const branchChosen = !hasBranches || !!branchId;
  const branch = branches.find(b => b.id === branchId) ?? null;

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

  const slotGroups = SLOT_GROUPS
    .map(g => ({
      label: g.label,
      slots: slots.filter(t => {
        const h = Number(t.slice(0, 2));
        return h >= g.from && h < g.to;
      }),
    }))
    .filter(g => g.slots.length > 0);

  // ── Алхмууд ─────────────────────────────────────────────────────────
  const order: StepKey[] = hasBranches
    ? ['branch', 'doctor', 'service', 'date', 'time', 'contact']
    : ['doctor', 'service', 'date', 'time', 'contact'];

  // Эхний дутуу алхам — товч болон гүйлгэлт хоёулаа үүнийг харна
  const currentStep: StepKey = !branchChosen
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
  const currentIdx = order.indexOf(currentStep);

  // Нээлттэй алхам: "Солих" дарсан бол тэр, үгүй бол эхний дутуу алхам
  const openStep: StepKey =
    editing && order.indexOf(editing) <= currentIdx ? editing : currentStep;

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
  const progress = (currentIdx + (ready ? 1 : 0)) / order.length;

  /** Сонголт хийсний дараа "Солих" горимоос гарч дараагийн алхам руу шилжинэ */
  function pick(apply: () => void) {
    apply();
    setEditing(null);
    setError(null);
  }

  /** Хураангуй мөрөнд харагдах сонгосон утга */
  const summary: Record<StepKey, string | null> = {
    branch: branch?.name ?? null,
    doctor: doctor?.name ?? null,
    service: service ? `${service.name} · ${priceLabel(service)}` : null,
    date: date ? dateLabel(date) : null,
    time: time || null,
    contact: null,
  };

  // Шинэ алхам нээгдэхэд түүн рүү гүйлгэнэ — үгүй бол доор нээгдсэн алхам
  // харагдахгүй тул "товч ажиллахгүй байна" гэж ойлгогдоно.
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastStep = useRef(openStep);

  function scrollToStep(step: string) {
    scrollRef.current
      ?.querySelector(`[data-step="${step}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useEffect(() => {
    if (lastStep.current === openStep) return;
    lastStep.current = openStep;
    scrollToStep(openStep);
  }, [openStep]);

  async function handleSubmit() {
    // Дутуу бол товчийг үхмэл болгохгүй — юу дутууг хэлээд тэр рүү нь аваачна
    if (!ready || !service) {
      setError(missingLabel ?? 'Бүх алхмыг гүйцээнэ үү');
      setEditing(null);
      scrollToStep(currentStep);
      return;
    }
    setLoading(true);
    setError(null);
    try {
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
      if (data.error) { setError(data.error); return; }
      setBookingCode(data.bookingCode ?? null);
      setDone(true);
    } catch {
      setError('Холболтын алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  }

  // ── Амжилттай ───────────────────────────────────────────────────────
  if (done) {
    const rows = [
      ['Эмч', doctor?.name],
      ['Үйлчилгээ', service?.name],
      ['Салбар', branch?.name],
      ['Өдөр', dateLabel(date)],
      ['Цаг', time],
      ['Нэр', customerName],
    ].filter(([, v]) => v) as [string, string][];

    return (
      <Modal label="Захиалга илгээгдлээ" onClose={onClose}>
        <div className="flex justify-end px-3 pt-3">
          <ModalClose onClose={onClose} />
        </div>
        <div className="overflow-y-auto flex-1 px-6 pb-2 text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--site-ok-soft)] border border-[var(--site-ok-line)] flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-[var(--site-ok)]" />
          </div>
          <h3 className="site-h3 text-[19px] mb-1.5">Захиалга илгээгдлээ</h3>
          <p className="site-body mb-6">
            Эмнэлэг баталгаажуулмагц танд мэдэгдэнэ.
          </p>

          {bookingCode && (
            <div className="rounded-[var(--site-r-btn)] bg-[var(--site-accent-soft)] border border-[var(--site-line)] px-4 py-3 mb-4">
              <div className="text-[12px] text-[var(--site-muted)] mb-0.5">Захиалгын код — хадгалаад аваарай</div>
              <div className="text-[22px] font-semibold font-mono tracking-[0.15em] text-[var(--site-accent)]">
                {bookingCode}
              </div>
            </div>
          )}

          <div className="rounded-[var(--site-r-btn)] border border-[var(--site-line)] divide-y divide-[var(--site-line)] text-left">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                <span className="text-[13px] text-[var(--site-muted)]">{label}</span>
                <span className="text-[13px] font-medium text-[var(--site-ink)] text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="site-modal-foot border-t-0 pb-[max(20px,env(safe-area-inset-bottom))] grid grid-cols-2 gap-2">
          <button onClick={onClose} className="site-btn-outline">
            Хаах
          </button>
          <a
            href={`/c/${clinicSlug}/booking${bookingCode ? `?code=${bookingCode}` : ''}`}
            className="site-btn"
          >
            Захиалгаа шалгах
          </a>
        </div>
      </Modal>
    );
  }

  // ── Алхам бүрийн агуулга ────────────────────────────────────────────
  function renderStep(key: StepKey) {
    switch (key) {
      case 'branch':
        return (
          <div className="space-y-2">
            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => pick(() => setBranchId(b.id))}
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
        );

      case 'doctor':
        return visibleDoctors.length === 0 ? (
          <Empty>Энэ салбарт одоогоор эмч бүртгэгдээгүй байна.</Empty>
        ) : (
          <div className="space-y-2">
            {visibleDoctors.map(d => (
              <button
                key={d.id}
                onClick={() => pick(() => setDoctorId(d.id))}
                aria-pressed={doctorId === d.id}
                className="site-option w-full flex items-center gap-3 p-3 text-left"
              >
                <DoctorAvatar doctor={d} size={40} />
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
        );

      case 'service':
        return doctorServices.length === 0 ? (
          <Empty>Энэ эмчид одоогоор үйлчилгээ бүртгэгдээгүй байна.</Empty>
        ) : (
          <div className="space-y-2">
            {doctorServices.map(s => (
              <button
                key={s.id}
                onClick={() => pick(() => setService(s))}
                aria-pressed={service?.id === s.id}
                className="site-option w-full flex items-center justify-between gap-3 p-3.5"
              >
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-[var(--site-ink)]">{s.name}</span>
                  <span className="block text-[12px] text-[var(--site-muted)] mt-0.5">{s.duration_minutes} мин</span>
                </span>
                {isDiscountActive(s) ? (
                  <span className="shrink-0 text-right">
                    <span className="block text-[12px] text-[var(--site-muted)] line-through leading-none">
                      ₮{s.price_mnt.toLocaleString()}
                    </span>
                    <span className="text-[14px] font-semibold text-[var(--site-sale)]">
                      {priceLabel(s)}
                    </span>
                  </span>
                ) : (
                  <span className="text-[14px] font-semibold text-[var(--site-ink)] shrink-0">
                    {priceLabel(s)}
                  </span>
                )}
              </button>
            ))}
          </div>
        );

      case 'date':
        return (
          <div className="rounded-[var(--site-r-btn)] border border-[var(--site-line)] p-3">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => shiftMonth(-1)}
                disabled={!canGoPrev}
                aria-label="Өмнөх сар"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--site-bg-soft)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--site-ink-soft)]" />
              </button>
              <span className="text-[14px] font-medium text-[var(--site-ink)]">
                {month.year} оны {MONTH_NAMES[month.month]}
              </span>
              <button
                onClick={() => shiftMonth(1)}
                disabled={!canGoNext}
                aria-label="Дараах сар"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--site-bg-soft)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                    onClick={() => pick(() => setDate(cell.iso))}
                    disabled={cell.disabled}
                    aria-pressed={date === cell.iso}
                    aria-label={dateLabel(cell.iso)}
                    className={`h-10 rounded-[var(--site-r-btn)] text-[14px] font-medium transition-colors ${
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
        );

      case 'time':
        return loadingSlots ? (
          <div className="flex gap-1.5 py-5 justify-center">
            <div className="w-1.5 h-1.5 bg-[var(--site-accent)] rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-[var(--site-accent)] rounded-full animate-bounce [animation-delay:0.15s]" />
            <div className="w-1.5 h-1.5 bg-[var(--site-accent)] rounded-full animate-bounce [animation-delay:0.3s]" />
          </div>
        ) : slots.length === 0 ? (
          <Empty>
            {dayClosed
              ? 'Энэ өдөр эмнэлэг амарна. Өөр өдөр сонгоно уу.'
              : 'Энэ өдөр сул цаг байхгүй байна. Өөр өдөр сонгоно уу.'}
            <button
              onClick={() => setEditing('date')}
              className="block mx-auto mt-2 text-[13px] font-semibold text-[var(--site-accent)] hover:underline"
            >
              Өдөр солих
            </button>
          </Empty>
        ) : (
          <div className="space-y-4">
            {slotGroups.map(g => (
              <div key={g.label}>
                <p className="text-[12px] text-[var(--site-muted)] mb-2">{g.label}</p>
                <div className="grid grid-cols-4 gap-2">
                  {g.slots.map(t => (
                    <button
                      key={t}
                      onClick={() => pick(() => setTime(t))}
                      aria-pressed={time === t}
                      className="site-option py-2.5 text-center text-[14px] font-medium text-[var(--site-ink)] tabular-nums"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="booking-name" className="site-label">Овог нэр</label>
              <input
                id="booking-name"
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Жишээ нь: Бат-Эрдэнэ"
                autoComplete="name"
                className="site-input"
              />
            </div>
            <div>
              <label htmlFor="booking-phone" className="site-label">
                <Phone className="w-3.5 h-3.5" /> Утасны дугаар
              </label>
              <input
                id="booking-phone"
                type="tel"
                inputMode="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="9900 0000"
                autoComplete="tel"
                enterKeyHint="done"
                className="site-input"
              />
              <p className="text-[12px] text-[var(--site-muted)] mt-1.5">
                Баталгаажуулалтын мэдээллийг энэ дугаараар өгнө.
              </p>
            </div>
          </div>
        );
    }
  }

  return (
    <Modal label="Цаг захиалах" onClose={onClose}>

      <div className="site-modal-head">
        <div className="flex-1 min-w-0">
          <h3 className="site-h3">Цаг захиалах</h3>
          <p className="text-[13px] text-[var(--site-muted)] mt-0.5">
            Алхам {order.indexOf(openStep) + 1}/{order.length} · {STEP_META[openStep].title}
          </p>
        </div>
        <ModalClose onClose={onClose} />
      </div>

      {/* Явц */}
      <div className="h-1 bg-[var(--site-bg-soft)] shrink-0" aria-hidden="true">
        <div
          className="h-full bg-[var(--site-accent)] transition-[width] duration-300"
          style={{ width: `${Math.max(progress, 0.04) * 100}%` }}
        />
      </div>

      <div ref={scrollRef} className="overflow-y-auto flex-1 p-5 space-y-3">
        {order.map((key, idx) => {
          if (idx > currentIdx) return null;

          const meta = STEP_META[key];
          const expanded = key === openStep || key === 'contact';

          if (!expanded) {
            // Өмнөх алхмыг засаж байх үед бөглөгдөөгүй алхам хоосон мөр болохгүй
            if (!summary[key]) return null;
            return (
              <SummaryRow
                key={key}
                step={key}
                title={meta.title}
                value={summary[key] ?? ''}
                onEdit={() => setEditing(key)}
              />
            );
          }

          return (
            <div key={key} data-step={key} className="scroll-mt-2 pt-2 pb-1">
              <p className="site-label">
                <span className="w-5 h-5 rounded-full bg-[var(--site-accent)] text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
                  {idx + 1}
                </span>
                {meta.title}
                {editing === key && summary[key] && (
                  <button
                    onClick={() => setEditing(null)}
                    className="ml-auto text-[12px] font-semibold text-[var(--site-muted)] hover:text-[var(--site-ink)]"
                  >
                    Болих
                  </button>
                )}
              </p>
              {renderStep(key)}
            </div>
          );
        })}

        {error && (
          <p role="alert" className="text-[13px] text-[var(--site-danger)] bg-[var(--site-danger-soft)] border border-[var(--site-danger-line)] rounded-[var(--site-r-btn)] px-4 py-3">
            {error}
          </p>
        )}
      </div>

      <div className="site-modal-foot pb-[max(20px,env(safe-area-inset-bottom))]">
        {service && (
          <div className="flex items-center justify-between gap-3 mb-3 text-[13px]">
            <span className="text-[var(--site-muted)] truncate">
              {service.name}
              {date && time && ` · ${dateLabel(date).split(',')[0]} ${time}`}
            </span>
            <span className="font-semibold text-[var(--site-ink)] shrink-0">{priceLabel(service)}</span>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          aria-disabled={!ready}
          className={`site-btn w-full py-3 text-[15px] ${ready ? '' : 'opacity-60'}`}
        >
          {loading ? 'Захиалж байна...' : (missingLabel ?? 'Цаг захиалах')}
        </button>
      </div>
    </Modal>
  );
}

/** Бөглөсөн алхам — нэг мөр болж хумигдана, дарвал дахин нээгдэнэ */
function SummaryRow({
  step,
  title,
  value,
  onEdit,
}: {
  step: StepKey;
  title: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <button
      data-step={step}
      onClick={onEdit}
      className="site-option w-full flex items-center gap-3 px-3.5 py-3 bg-[var(--site-bg-soft)] scroll-mt-2"
    >
      <span className="w-5 h-5 rounded-full bg-[var(--site-accent-soft)] text-[var(--site-accent)] flex items-center justify-center shrink-0">
        <Check className="w-3 h-3" strokeWidth={3} />
      </span>
      <span className="text-[12px] sm:text-[13px] text-[var(--site-muted)] w-[68px] sm:w-20 shrink-0">{title}</span>
      <span className="flex-1 min-w-0 text-[14px] font-medium text-[var(--site-ink)] truncate">{value}</span>
      <span className="text-[13px] font-semibold text-[var(--site-accent)] shrink-0">Солих</span>
    </button>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-body text-center py-4 px-3 rounded-[var(--site-r-btn)] bg-[var(--site-bg-soft)] border border-[var(--site-line)]">
      {children}
    </div>
  );
}
