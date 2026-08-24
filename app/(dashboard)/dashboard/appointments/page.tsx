import { createAdminClient } from "@/lib/db/supabase";
import { getCurrentClinic } from "@/lib/db/supabase-server";
import { clinicCardDate, clinicShortDate, clinicTimeLabel } from "@/lib/booking/timezone";
import { effectivePrice } from "@/lib/booking/pricing";
import AppointmentActions from "./appointment-actions";

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
 * татаад карт дээр нэрээр нь харуулна.
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

const statusLabels: Record<string, { label: string; pill: string; strip: string }> = {
  pending: {
    label: "Хүлээгдэж буй",
    pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    strip: "bg-gradient-to-r from-amber-400 to-orange-400",
  },
  confirmed: {
    label: "Баталгаажсан",
    pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    strip: "bg-gradient-to-r from-emerald-400 to-teal-400",
  },
  reminded: {
    label: "Сануулга илгээсэн",
    pill: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    strip: "bg-gradient-to-r from-sky-400 to-blue-400",
  },
  completed: {
    label: "Дууссан",
    pill: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
    strip: "bg-slate-200",
  },
  no_show: {
    label: "Ирээгүй",
    pill: "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
    strip: "bg-gradient-to-r from-rose-400 to-pink-400",
  },
  cancelled: {
    label: "Цуцалсан",
    pill: "bg-slate-100 text-slate-400 ring-1 ring-slate-200",
    strip: "bg-slate-200",
  },
};

/** Нэр бүрт тогтмол өнгө — жагсаалт нэг өнгийн цулгуй болохгүйн тулд */
const AVATAR_COLORS = [
  "bg-rose-100 text-rose-600",
  "bg-sky-100 text-sky-600",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-teal-100 text-teal-600",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default async function AppointmentsPage() {
  const clinic = await getCurrentClinic();

  if (!clinic) {
    return <div>Клиник олдсонгүй</div>;
  }

  const services = (clinic.services ?? []) as ServiceRow[];
  const { appointments, doctorNames, branchNames, prices } = await getPageData(
    clinic.id,
    services
  );
  const pendingCount = appointments.filter(a => a.status === "pending").length;

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Цаг захиалга
        </h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Нийт {appointments.length} захиалга
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-100 text-[11px] font-semibold">
              {pendingCount} баталгаажуулах
            </span>
          )}
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16 text-slate-400">
          <p className="text-5xl mb-2">📅</p>
          <p>Захиалга алга</p>
          <p className="text-sm mt-1">Шинэ цаг авмагц энд харагдана</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {appointments.map(apt => {
            const date = new Date(apt.scheduled_at);
            const status = statusLabels[apt.status] ?? statusLabels.confirmed;
            const price = apt.service ? prices.get(apt.service) : undefined;
            const doctorName = apt.doctor_id ? doctorNames.get(apt.doctor_id) : null;
            const branchName = apt.branch_id ? branchNames.get(apt.branch_id) : null;
            const faded = apt.status === "cancelled" || apt.status === "no_show";
            const actionable = apt.status !== "completed";

            const compact = apt.status === "completed";

            // Толгойн мөр — эвхэгдсэн үед ч энэ л харагдана
            const header = (
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-semibold shrink-0 ${avatarColor(
                      apt.customer_name ?? "?"
                    )}`}
                  >
                    {apt.customer_name?.charAt(0) ?? "?"}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[16px] font-semibold text-slate-900 tracking-tight">
                        {apt.customer_name}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${status.pill}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    {apt.customer_phone && (
                      <a
                        href={`tel:${apt.customer_phone}`}
                        className="inline-flex items-center gap-1.5 text-[14px] text-rose-500 hover:text-rose-600 mt-0.5 transition"
                      >
                        <span className="text-[12px]">📞</span>
                        {apt.customer_phone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[13px] text-slate-600 whitespace-nowrap">
                    {clinicCardDate(date)}
                  </div>
                  <div className="text-[13px] text-slate-500 mt-0.5 whitespace-nowrap">
                    ⏰ {clinicTimeLabel(date)}
                  </div>
                  {apt.booking_code && !compact && (
                    <div className="text-[11px] font-mono text-slate-300 tracking-[0.18em] mt-1">
                      {apt.booking_code}
                    </div>
                  )}
                </div>
              </div>
            );

            // Дэлгэрэнгүй ба үйлдэл
            const body = (
              <>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Detail label="Үйлчилгээ" icon="🦷" tint="bg-sky-50" value={apt.service} />
                  <Detail label="Эмч" icon="👩‍⚕️" tint="bg-violet-50" value={doctorName} />
                  {price !== undefined && (
                    <Detail
                      label="Төлбөр"
                      icon="💰"
                      tint="bg-emerald-50"
                      value={`${price.toLocaleString()}₮`}
                      valueClass="font-semibold text-emerald-700"
                    />
                  )}
                  <Detail label="Салбар" icon="📍" tint="bg-amber-50" value={branchName} />
                </div>

                {actionable && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <AppointmentActions appointmentId={apt.id} status={apt.status} />
                  </div>
                )}
              </>
            );

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden ${
                  faded ? "opacity-70" : ""
                }`}
              >
                <div className={`h-1 ${status.strip}`} />

                {compact ? (
                  // Дууссан захиалга — зөвхөн толгойн мөр. Дэлгэрэнгүй хэрэгтэй
                  // бол дарж дэлгэнэ (<details> — нэмэлт JS шаардахгүй).
                  <details className="group">
                    <summary className="p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-slate-50/60 transition">
                      {header}
                    </summary>
                    <div className="px-5 pb-5">{body}</div>
                  </details>
                ) : (
                  <div className="p-5">
                    {header}
                    {body}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[12px] text-slate-300">
        Сүүлийн 100 захиалга · шинэ нь эхэндээ
        {appointments.length > 0 &&
          ` · хамгийн сүүлийнх ${clinicShortDate(new Date(appointments[0].scheduled_at))}`}
      </p>
    </div>
  );
}

/** Шошготой мөр өнгөт дүрстэй. Утга байхгүй бол огт харагдахгүй. */
function Detail({
  label,
  icon,
  tint,
  value,
  valueClass,
}: {
  label: string;
  icon: string;
  tint: string;
  value?: string | null;
  valueClass?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[14px] shrink-0 ${tint}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-400 leading-tight">{label}</div>
        <div className={`text-[14px] text-slate-800 truncate ${valueClass ?? ""}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
