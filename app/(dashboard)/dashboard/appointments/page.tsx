import Link from "next/link";
import { createAdminClient } from "@/lib/db/supabase";
import { getCurrentClinic } from "@/lib/db/supabase-server";
import {
  addClinicDays,
  clinicCardDate,
  clinicDateISO,
  clinicTimeLabel,
} from "@/lib/booking/timezone";
import { effectivePrice } from "@/lib/booking/pricing";
import AppointmentActions from "./appointment-actions";
import CompleteToggle from "./complete-toggle";
import { isCheckable } from "./checkable";

export const dynamic = "force-dynamic";

type ServiceRow = {
  name: string;
  price_mnt: number;
  discount_percent?: number | null;
  discount_until?: string | null;
};

/**
 * Зөвхөн нэвтэрсэн эзэмшигчийн клиникийн захиалга. clinic_id-г сесс-ээс
 * тодорхойлдог тул өөр эмнэлгийн захиалга энд харагдахгүй.
 *
 * Эмч, салбарын нэрийг захиалга дээр хадгалдаггүй (зөвхөн id) тул тусад нь
 * татаад мөр дээр нэрээр нь харуулна.
 */
async function getPageData(clinicId: string, services: ServiceRow[]) {
  const supabase = createAdminClient();

  const [aptRes, docRes, branchRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("scheduled_at", { ascending: false })
      .limit(100),
    supabase.from("doctors").select("id, name").eq("clinic_id", clinicId),
    supabase.from("branches").select("id, name").eq("clinic_id", clinicId),
  ]);

  if (aptRes.error) console.error(aptRes.error);

  const doctorNames = new Map((docRes.data ?? []).map(d => [d.id, d.name]));
  const branchNames = new Map((branchRes.data ?? []).map(b => [b.id, b.name]));
  // Захиалгад үйлчилгээ нэрээрээ хадгалагддаг тул нэрээр нь үнэ хайна
  const prices = new Map(services.map(s => [s.name, effectivePrice(s)]));

  return { appointments: aptRes.data ?? [], doctorNames, branchNames, prices };
}

const statusStyles: Record<string, { label: string; dot: string; text: string }> = {
  pending: { label: "Хүлээгдэж буй", dot: "bg-amber-400", text: "text-amber-700" },
  confirmed: { label: "Баталгаажсан", dot: "bg-emerald-500", text: "text-emerald-700" },
  reminded: { label: "Сануулсан", dot: "bg-sky-500", text: "text-sky-700" },
  completed: { label: "Дууссан", dot: "bg-slate-300", text: "text-slate-400" },
  no_show: { label: "Ирээгүй", dot: "bg-rose-400", text: "text-rose-600" },
  cancelled: { label: "Цуцалсан", dot: "bg-slate-300", text: "text-slate-400" },
};

/** Төлөвийн шүүлтүүр — URL-ийн ?status=... */
const FILTERS: { key: string; label: string; statuses: string[] | null }[] = [
  { key: "all", label: "Бүгд", statuses: null },
  { key: "pending", label: "Хүлээгдэж буй", statuses: ["pending"] },
  { key: "confirmed", label: "Баталгаажсан", statuses: ["confirmed", "reminded"] },
  { key: "completed", label: "Дууссан", statuses: ["completed"] },
  { key: "cancelled", label: "Цуцлагдсан", statuses: ["cancelled", "no_show"] },
];

type Apt = Awaited<ReturnType<typeof getPageData>>["appointments"][number];
type DayGroup = { iso: string; items: Apt[] };

/**
 * Эмнэлгийн бүсийн өдрөөр бүлэглэнэ: өнөөдөр ба ирэх өдрүүд эхэндээ (ойрынх нь
 * дээрээ), өнгөрсөн өдрүүд араас нь (сүүлийнх нь дээрээ). Өдөр дотроо цагийн
 * дарааллаар.
 */
function groupByDay(appointments: Apt[], todayISO: string) {
  const byDay = new Map<string, Apt[]>();
  for (const apt of appointments) {
    const iso = clinicDateISO(new Date(apt.scheduled_at));
    const list = byDay.get(iso);
    if (list) list.push(apt);
    else byDay.set(iso, [apt]);
  }

  const groups: DayGroup[] = [...byDay].map(([iso, items]) => ({
    iso,
    items: items.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)),
  }));

  return {
    upcoming: groups.filter(g => g.iso >= todayISO).sort((a, b) => a.iso.localeCompare(b.iso)),
    past: groups.filter(g => g.iso < todayISO).sort((a, b) => b.iso.localeCompare(a.iso)),
  };
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const clinic = await getCurrentClinic();

  if (!clinic) {
    return <div>Клиник олдсонгүй</div>;
  }

  const { status: statusParam } = await searchParams;
  const activeFilter = FILTERS.find(f => f.key === statusParam) ?? FILTERS[0];

  const services = (clinic.services ?? []) as ServiceRow[];
  const { appointments, doctorNames, branchNames, prices } = await getPageData(
    clinic.id,
    services
  );

  const countFor = (statuses: string[] | null) =>
    statuses ? appointments.filter(a => statuses.includes(a.status)).length : appointments.length;

  const visible = activeFilter.statuses
    ? appointments.filter(a => activeFilter.statuses!.includes(a.status))
    : appointments;

  const now = new Date();
  const todayISO = clinicDateISO(now);
  const relativeDay: Record<string, string> = {
    [todayISO]: "Өнөөдөр",
    [clinicDateISO(addClinicDays(now, 1))]: "Маргааш",
    [clinicDateISO(addClinicDays(now, -1))]: "Өчигдөр",
  };
  const { upcoming, past } = groupByDay(visible, todayISO);

  const renderGroup = (group: DayGroup) => {
    const cardDate = clinicCardDate(new Date(group.items[0].scheduled_at));
    const relative = relativeDay[group.iso];
    return (
      <section key={group.iso}>
        <div className="flex items-baseline justify-between px-1 mb-2">
          <h2 className="text-[14px] font-semibold text-slate-800">
            {relative ?? cardDate}
            {relative && <span className="ml-2 font-normal text-slate-400">{cardDate}</span>}
          </h2>
          <span className="text-[12px] text-slate-400">{group.items.length} захиалга</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)] divide-y divide-slate-100 overflow-hidden">
          {group.items.map(apt => (
            <AppointmentRow
              key={apt.id}
              apt={apt}
              doctorName={apt.doctor_id ? doctorNames.get(apt.doctor_id) : null}
              branchName={apt.branch_id ? branchNames.get(apt.branch_id) : null}
              price={apt.service ? prices.get(apt.service) : undefined}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Цаг захиалга
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            Сүүлийн {appointments.length} захиалга
          </p>
        </div>
        {/* Утсаар/биечлэн ирсэн үйлчлүүлэгчийг хуанли дээрээс бүртгэнэ */}
        <Link
          href="/dashboard/calendar?new=1"
          className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold shadow-sm transition"
        >
          + Шинэ захиалга
        </Link>
      </div>

      {appointments.length > 0 && (
        <nav className="-mx-1 px-1 overflow-x-auto">
          <div className="inline-flex gap-1 p-1 rounded-xl bg-slate-100/80">
            {FILTERS.map(f => {
              const active = f.key === activeFilter.key;
              const count = countFor(f.statuses);
              return (
                <Link
                  key={f.key}
                  href={f.key === "all" ? "/dashboard/appointments" : `/dashboard/appointments?status=${f.key}`}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-[13px] transition ${
                    active
                      ? "bg-white text-slate-900 font-medium shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {f.key === "pending" && count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                  {f.label}
                  <span className={`tabular-nums ${active ? "text-slate-400" : "text-slate-400/80"}`}>
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {appointments.length === 0 ? (
        <EmptyState title="Захиалга алга" hint="Шинэ цаг авмагц энд харагдана" />
      ) : visible.length === 0 ? (
        <EmptyState title="Энэ ангилалд захиалга алга" />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && <div className="space-y-6">{upcoming.map(renderGroup)}</div>}

          {past.length > 0 && (
            <div className="space-y-6">
              {upcoming.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-medium text-slate-400">Өнгөрсөн</span>
                  <span className="flex-1 h-px bg-slate-200" />
                </div>
              )}
              {past.map(renderGroup)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Нэг захиалга — нэг мөр. Цаг, нэр, үйлчилгээ, төлөв л харагдана; дарахад
 * утас, эмч, салбар, төлбөр, үйлдлүүд дэлгэгдэнэ (<details> — нэмэлт JS-гүй).
 */
function AppointmentRow({
  apt,
  doctorName,
  branchName,
  price,
}: {
  apt: Apt;
  doctorName?: string | null;
  branchName?: string | null;
  price?: number;
}) {
  const status = statusStyles[apt.status] ?? statusStyles.confirmed;
  const inactive = apt.status === "cancelled" || apt.status === "no_show";
  const muted = inactive || apt.status === "completed";
  const summaryLine = [apt.service, doctorName].filter(Boolean).join(" · ");

  return (
    <details className="group">
      <summary className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-slate-50/70 transition">
        {/* Баталгаажсан → нэг дарж "Дууссан". Бусад төлөвт хоосон — багана тэгшхэн байна */}
        <span className="w-6 flex justify-center shrink-0">
          {isCheckable(apt.status) && <CompleteToggle appointmentId={apt.id} status={apt.status} />}
        </span>

        <span
          className={`w-12 shrink-0 text-[15px] font-semibold tabular-nums ${
            muted ? "text-slate-400" : "text-slate-900"
          }`}
        >
          {clinicTimeLabel(new Date(apt.scheduled_at))}
        </span>

        <div className="flex-1 min-w-0">
          <div
            className={`text-[15px] font-medium truncate ${
              muted ? "text-slate-500" : "text-slate-900"
            } ${apt.status === "cancelled" ? "line-through decoration-slate-300" : ""}`}
          >
            {apt.customer_name}
          </div>
          {summaryLine && (
            <div className="text-[13px] text-slate-400 truncate mt-0.5">{summaryLine}</div>
          )}
        </div>

        {/* Хүлээгдэж буйг дэлгэхгүйгээр шууд баталгаажуулна */}
        {apt.status === "pending" && (
          <div className="hidden md:block shrink-0">
            <AppointmentActions appointmentId={apt.id} status={apt.status} size="sm" />
          </div>
        )}

        <span
          className={`inline-flex items-center gap-1.5 shrink-0 text-[12px] font-medium ${status.text}`}
          title={status.label}
        >
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className="hidden sm:inline">{status.label}</span>
        </span>

        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="w-4 h-4 shrink-0 text-slate-300 transition-transform group-open:rotate-180"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      {/* Цагийн баганатай тэгш эхэлнэ: px-5 + 24 (чекбокс) + 16 + 48 (цаг) + 16 */}
      <div className="px-4 pb-5 sm:pr-5 sm:pl-[124px]">
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 rounded-xl bg-slate-50 px-4 py-3.5">
          <Field label="Утас">
            {apt.customer_phone && (
              <a href={`tel:${apt.customer_phone}`} className="text-blue-600 hover:underline">
                {apt.customer_phone}
              </a>
            )}
          </Field>
          <Field label="Үйлчилгээ">{apt.service}</Field>
          <Field label="Эмч">{doctorName}</Field>
          <Field label="Салбар">{branchName}</Field>
          <Field label="Төлбөр">{price !== undefined && `${price.toLocaleString()}₮`}</Field>
          <Field label="Код">
            {apt.booking_code && (
              <span className="font-mono tracking-[0.15em] text-slate-600">{apt.booking_code}</span>
            )}
          </Field>
          {apt.notes && (
            <div className="col-span-full">
              <dt className="text-[11px] text-slate-400">Тэмдэглэл</dt>
              <dd className="text-[14px] text-slate-700 mt-0.5 whitespace-pre-line">{apt.notes}</dd>
            </div>
          )}
        </dl>

        {apt.status !== "completed" && (
          <div className="mt-3">
            <AppointmentActions appointmentId={apt.id} status={apt.status} />
          </div>
        )}
      </div>
    </details>
  );
}

/** Шошготой утга. Утга байхгүй бол огт харагдахгүй. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-slate-400">{label}</dt>
      <dd className="text-[14px] text-slate-800 truncate mt-0.5">{children}</dd>
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 text-center py-16 px-6">
      <span className="mx-auto mb-3 w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="w-5 h-5">
          <rect x="3" y="4.5" width="14" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 8.5h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <p className="text-[15px] font-medium text-slate-600">{title}</p>
      {hint && <p className="text-[13px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
