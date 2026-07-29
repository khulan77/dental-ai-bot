'use client';

import { useState } from 'react';
import {
  Search,
  CalendarDays,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Hash,
  Phone,
} from 'lucide-react';
import { clinicDateTimeLabel } from '@/lib/booking/timezone';

type Booking = {
  id: string;
  bookingCode: string | null;
  customerName: string;
  service: string | null;
  scheduledAt: string;
  status: string;
  doctorName: string | null;
  branchName: string | null;
  branchAddress: string | null;
};

type StatusMeta = {
  label: string;
  hint: string;
  /** site-status-* дэд класс */
  tone: 'wait' | 'ok' | 'off' | 'bad';
  icon: typeof Clock;
  /** Явцын аль алхам дээр байгаа: 0 хүлээгдэж буй, 1 баталгаажсан, 2 дууссан */
  step: number;
  /** Цуцлагдсан/ирээгүй — явц тасарсан */
  broken?: boolean;
};

const STATUS: Record<string, StatusMeta> = {
  pending: {
    label: 'Хүлээгдэж буй',
    hint: 'Эмнэлэг таны захиалгыг хараахан баталгаажуулаагүй байна. Удахгүй танд холбогдоно.',
    tone: 'wait',
    icon: Clock,
    step: 0,
  },
  confirmed: {
    label: 'Баталгаажсан',
    hint: 'Таны цаг баталгаажлаа. Товлосон цагаасаа 5-10 минутын өмнө ирнэ үү.',
    tone: 'ok',
    icon: CheckCircle2,
    step: 1,
  },
  reminded: {
    label: 'Баталгаажсан',
    hint: 'Таны цаг баталгаажсан. Товлосон цагтаа ирнэ үү.',
    tone: 'ok',
    icon: CheckCircle2,
    step: 1,
  },
  completed: {
    label: 'Дууссан',
    hint: 'Энэ үйлчилгээ дууссан байна. Ирсэнд баярлалаа!',
    tone: 'off',
    icon: CheckCircle2,
    step: 2,
  },
  no_show: {
    label: 'Ирээгүй',
    hint: 'Товлосон цагт ирээгүй гэж тэмдэглэгдсэн байна.',
    tone: 'bad',
    icon: XCircle,
    step: 1,
    broken: true,
  },
  cancelled: {
    label: 'Цуцлагдсан',
    hint: 'Энэ захиалга цуцлагдсан. Шинээр цаг авах боломжтой.',
    tone: 'bad',
    icon: XCircle,
    step: 0,
    broken: true,
  },
};

const STEPS = ['Захиалга авсан', 'Баталгаажсан', 'Дууссан'];

export default function BookingLookup({
  slug,
  initialQuery,
}: {
  slug: string;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setBookings(null);

    try {
      const res = await fetch('/api/my-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, query: query.trim() }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setBookings(data.bookings ?? []);
      }
    } catch {
      setError('Холболтын алдаа гарлаа. Дахин оролдоно уу.');
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* ── Хайлтын карт — гүн зурвас дээр хөвнө ── */}
      <div className="site-card-float p-6 sm:p-8">
        <form onSubmit={handleSearch}>
          <label className="site-label">
            <Search className="w-3.5 h-3.5" /> Утасны дугаар эсвэл захиалгын код
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="9900 0000  ·  K7QM4X"
              autoComplete="off"
              className="site-input flex-1 sm:text-[16px] sm:py-3.5"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="site-btn sm:px-8 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Шалгах
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="site-pill">
            <Phone className="w-3 h-3" /> 8 оронтой дугаар
          </span>
          <span className="site-pill">
            <Hash className="w-3 h-3" /> 6 тэмдэгт код
          </span>
        </div>

        {error && (
          <p className="mt-4 text-[13px] text-[var(--site-danger)] bg-[var(--site-danger-soft)] border border-[var(--site-danger-line)] rounded-[var(--site-r-btn)] px-4 py-3">
            {error}
          </p>
        )}
      </div>

      {/* ── Олдсонгүй ── */}
      {bookings && bookings.length === 0 && (
        <div className="site-card p-10 text-center">
          <div className="w-12 h-12 rounded-[var(--site-r-pill)] bg-[var(--site-bg-soft)] border border-[var(--site-line)] flex items-center justify-center mx-auto mb-4">
            <Search className="w-5 h-5 text-[var(--site-muted)]" />
          </div>
          <h3 className="site-h3 mb-1.5">Захиалга олдсонгүй</h3>
          <p className="site-body max-w-sm mx-auto">
            Утасны дугаар эсвэл захиалгын кодоо шалгаад дахин оролдоно уу. Код нь том
            үсэг, тоо холилдсон 6 тэмдэгт байдаг.
          </p>
        </div>
      )}

      {/* ── Үр дүн ── */}
      {bookings && bookings.length > 0 && (
        <div className="space-y-4">
          <p className="text-[13px] text-[var(--site-muted)] px-1">
            {bookings.length} захиалга олдлоо
          </p>

          {bookings.map(booking => {
            const status = STATUS[booking.status] ?? STATUS.pending;
            const StatusIcon = status.icon;

            return (
              <article key={booking.id} className="site-card overflow-hidden">
                {/* Толгой */}
                <div className="flex items-start justify-between gap-4 p-6 pb-5">
                  <div className="min-w-0">
                    <h3 className="site-h3 truncate">
                      {booking.service ?? 'Үйлчилгээ'}
                    </h3>
                    {booking.bookingCode && (
                      <p className="text-[12px] text-[var(--site-muted)] mt-1.5 flex items-center gap-1.5">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono font-semibold tracking-[0.1em] text-[var(--site-ink)]">
                          {booking.bookingCode}
                        </span>
                      </p>
                    )}
                  </div>
                  <span className={`site-status site-status-${status.tone} shrink-0`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                </div>

                {/* Явцын алхмууд */}
                <div className="px-6 pb-6">
                  <StatusSteps step={status.step} broken={status.broken} />
                </div>

                {/* Дэлгэрэнгүй */}
                <div className="border-t border-[var(--site-line)] bg-[var(--site-bg-soft)] p-6 grid sm:grid-cols-2 gap-5">
                  <Row icon={CalendarDays} label="Товлосон цаг">
                    {clinicDateTimeLabel(new Date(booking.scheduledAt))}
                  </Row>
                  <Row icon={User} label="Үйлчлүүлэгч">
                    {booking.customerName}
                  </Row>
                  {booking.doctorName && (
                    <Row icon={Stethoscope} label="Эмч">
                      {booking.doctorName}
                    </Row>
                  )}
                  {booking.branchName && (
                    <Row icon={MapPin} label="Салбар">
                      {booking.branchName}
                      {booking.branchAddress && (
                        <span className="block text-[13px] font-normal text-[var(--site-muted)] mt-0.5">
                          {booking.branchAddress}
                        </span>
                      )}
                    </Row>
                  )}
                </div>

                {/* Тайлбар */}
                <p
                  className={`px-6 py-4 text-[13px] leading-relaxed border-t border-[var(--site-line)] ${
                    status.tone === 'ok'
                      ? 'bg-[var(--site-ok-soft)] text-[var(--site-ok)]'
                      : status.tone === 'wait'
                        ? 'bg-[var(--site-warn-soft)] text-[var(--site-warn)]'
                        : status.tone === 'bad'
                          ? 'bg-[var(--site-danger-soft)] text-[var(--site-danger)]'
                          : 'bg-[var(--site-bg-soft)] text-[var(--site-muted)]'
                  }`}
                >
                  {status.hint}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Захиалга авсан → Баталгаажсан → Дууссан */
function StatusSteps({ step, broken }: { step: number; broken?: boolean }) {
  function dotState(index: number): 'done' | 'current' | 'dead' | 'todo' {
    if (broken && index === step) return 'dead';
    if (index < step) return 'done';
    if (index === step) return broken ? 'dead' : step === 2 ? 'done' : 'current';
    return 'todo';
  }

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, index) => (
        <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div className="site-step-dot" data-state={dotState(index)}>
              {dotState(index) === 'dead' ? (
                <XCircle className="w-4 h-4" />
              ) : dotState(index) === 'done' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : dotState(index) === 'current' ? (
                <Clock className="w-4 h-4" />
              ) : (
                <span className="text-[11px] font-semibold">{index + 1}</span>
              )}
            </div>
            <span
              className={`text-[11px] whitespace-nowrap ${
                index <= step
                  ? 'text-[var(--site-ink-soft)] font-medium'
                  : 'text-[var(--site-muted)]'
              }`}
            >
              {label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className="site-step-line mb-5"
              data-state={index < step && !broken ? 'done' : undefined}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="site-icon-tile shrink-0">
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-[var(--site-muted)] mb-0.5">{label}</div>
        <div className="text-[14px] font-medium text-[var(--site-ink)]">{children}</div>
      </div>
    </div>
  );
}
