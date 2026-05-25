import { createAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

async function getClinic() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', 'sain-shud')
    .single();
  return data;
}

export default async function SettingsPage() {
  const clinic = await getClinic();

  if (!clinic) {
    return <div>Клиник олдсонгүй</div>;
  }

  const services = (clinic.services ?? []) as Array<{
    name: string;
    price_mnt: number;
    duration_minutes: number;
  }>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Тохиргоо</h1>
        <p className="text-gray-500 mt-1">Танай клиникийн мэдээлэл</p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold">Үндсэн мэдээлэл</h2>
        <InfoRow label="Клиникийн нэр" value={clinic.name} />
        <InfoRow label="Утас" value={clinic.owner_phone ?? '—'} />
        <InfoRow label="Имэйл" value={clinic.owner_email ?? '—'} />
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Үйлчилгээ ба үнэ</h2>
        <div className="space-y-2">
          {services.map((service, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
            >
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-xs text-gray-500">
                  {service.duration_minutes} минут
                </p>
              </div>
              <p className="font-semibold text-blue-600">
                {service.price_mnt.toLocaleString()}₮
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          💡 Удахгүй: Шууд энэ хуудсан дээрээс үнэ засах боломжтой болно
        </p>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Ажлын цаг</h2>
        <div className="space-y-2">
          {Object.entries(clinic.business_hours as Record<string, any>).map(
            ([day, hours]) => {
              const dayMn: Record<string, string> = {
                mon: 'Даваа',
                tue: 'Мягмар',
                wed: 'Лхагва',
                thu: 'Пүрэв',
                fri: 'Баасан',
                sat: 'Бямба',
                sun: 'Ням',
              };

              return (
                <div
                  key={day}
                  className="flex items-center justify-between py-2"
                >
                  <span className="font-medium w-24">{dayMn[day]}</span>
                  <span className="text-gray-700">
                    {hours ? `${hours.open} - ${hours.close}` : 'Амарна'}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}