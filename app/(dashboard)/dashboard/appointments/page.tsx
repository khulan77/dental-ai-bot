import { createAdminClient } from "@/lib/db/supabase";
import { getCurrentClinic } from "@/lib/db/supabase-server";
import { clinicShortDate, clinicTimeLabel } from "@/lib/booking/timezone";
import AppointmentActions from "./appointment-actions";

export const dynamic = "force-dynamic";

/**
 * Зөвхөн нэвтэрсэн эзэмшигчийн клиникийн захиалга. clinic_id-г сесс-ээс
 * тодорхойлдог тул өөр эмнэлгийн захиалга энд харагдахгүй.
 */
async function getAppointments(clinicId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("scheduled_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Хүлээгдэж буй", color: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Баталгаажсан", color: "bg-green-100 text-green-800" },
  reminded: { label: "Сануулга илгээсэн", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Дууссан", color: "bg-gray-100 text-gray-800" },
  no_show: { label: "Ирээгүй", color: "bg-red-100 text-red-800" },
  cancelled: { label: "Цуцалсан", color: "bg-orange-100 text-orange-800" },
};

export default async function AppointmentsPage() {
  const clinic = await getCurrentClinic();

  if (!clinic) {
    return <div>Клиник олдсонгүй</div>;
  }

  const appointments = await getAppointments(clinic.id);
  const pendingCount = appointments.filter(a => a.status === "pending").length;

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Цаг захиалга</h1>
        <p className="text-gray-500 mt-1">
          Нийт {appointments.length} захиалга
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              ⏳ {pendingCount} баталгаажуулах хүлээгдэж байна
            </span>
          )}
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-16 text-gray-400">
          <p className="text-5xl mb-2">📅</p>
          <p>Захиалга алга</p>
          <p className="text-sm mt-1">Bot шинэ цаг авмагц энд харагдана</p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="flex flex-col gap-3 sm:hidden">
            {appointments.map((apt) => {
              const date = new Date(apt.scheduled_at);
              const status = statusLabels[apt.status] ?? statusLabels.confirmed;
              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                        {apt.customer_name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {apt.customer_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {apt.customer_phone ?? "—"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <span>{apt.service ?? "—"}</span>
                    <span>
                      {clinicShortDate(date)} {clinicTimeLabel(date)}
                    </span>
                  </div>
                  {apt.booking_code && (
                    <div className="text-xs text-gray-400">
                      Код:{" "}
                      <span className="font-mono font-semibold text-gray-600">
                        {apt.booking_code}
                      </span>
                    </div>
                  )}
                  <div className="pt-1">
                    <AppointmentActions appointmentId={apt.id} status={apt.status} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Үйлчлүүлэгч
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Үйлчилгээ
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Огноо
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Утас
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Төлөв
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((apt) => {
                  const date = new Date(apt.scheduled_at);
                  const status =
                    statusLabels[apt.status] ?? statusLabels.confirmed;
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
                            {apt.customer_name?.charAt(0) ?? "?"}
                          </div>
                          <div>
                            <span className="font-medium block">
                              {apt.customer_name}
                            </span>
                            {apt.booking_code && (
                              <span className="text-xs font-mono text-gray-400">
                                {apt.booking_code}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {apt.service ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>{clinicShortDate(date)}</div>
                        <div className="text-gray-500">{clinicTimeLabel(date)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {apt.customer_phone ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <AppointmentActions appointmentId={apt.id} status={apt.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
