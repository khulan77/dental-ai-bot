import { createAdminClient } from '@/lib/db/supabase';
import { getCurrentClinic } from '@/lib/db/supabase-server';
import DoctorsManager from './doctors-manager';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getData() {
  const clinic = await getCurrentClinic();
  if (!clinic) return null;

  const supabase = createAdminClient();
  const { data: doctors } = await supabase
    .from('doctors')
    .select('*')
    .eq('clinic_id', clinic.id)
    .order('display_order', { ascending: true });

  return { clinic, doctors: doctors ?? [] };
}

export default async function DoctorsPage() {
  const data = await getData();
  if (!data) return <div>Клиник олдсонгүй</div>;

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Тохиргоо</h1>
        <p className="text-slate-500 mt-1">Эмч нарын мэдээлэл</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        <TabLink href="/dashboard/settings">Үндсэн</TabLink>
        <TabLink href="/dashboard/settings/services">Үйлчилгээ</TabLink>
        <TabLink href="/dashboard/settings/doctors" active>
          Эмч нар
        </TabLink>
        <TabLink href="/dashboard/settings/hours">Ажлын цаг</TabLink>
        <TabLink href="/dashboard/settings/instagram">Instagram</TabLink>
      </div>

      <DoctorsManager
        services={data.clinic.services ?? []}
        clinicHours={data.clinic.business_hours}
        initialDoctors={data.doctors}
      />
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </Link>
  );
}