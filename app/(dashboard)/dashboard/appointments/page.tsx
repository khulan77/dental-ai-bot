import { createAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

async function getAppointments() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('scheduled_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Баталгаажсан', color: 'bg-green-100 text-green-800' },
  reminded: { label: 'Сануулга илгээсэн', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Дууссан', color: 'bg-gray-100 text-gray-800' },
  no_show: { label: 'Ирээгүй', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Цуцалсан', color: 'bg-orange-100 text-orange-800' },
};

export default async function AppointmentsPage() {
  const appointments = await getAppointments();

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Цаг захиалга</h1>
        <p className="text-gray-500 mt-1">
          Нийт {appointments.length} захиалга
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {appointments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-2">📅</p>
            <p>Захиалга алга</p>
            <p className="text-sm mt-1">Bot шинэ цаг авмагц энд харагдана</p>
          </div>
        ) : (
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.map(apt => {
                const date = new Date(apt.scheduled_at);
                const status = statusLabels[apt.status] ?? statusLabels.confirmed;

                return (
                  <tr key={apt.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
                          {apt.customer_name?.charAt(0) ?? '?'}
                        </div>
                        <span className="font-medium">{apt.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {apt.service ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{date.toLocaleDateString('mn-MN')}</div>
                      <div className="text-gray-500">
                        {date.toLocaleTimeString('mn-MN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {apt.customer_phone ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}