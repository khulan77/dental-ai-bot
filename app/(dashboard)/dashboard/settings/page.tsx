import { createAdminClient } from '@/lib/db/supabase';
import ClinicInfoForm from './clinic-info-form';
import Link from 'next/link';
import { PublicUrlCard } from './public-url-card';

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

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Тохиргоо</h1>
        <p className="text-slate-500 mt-1">
          Танай клиникийн мэдээллийг шинэчилнэ үү
        </p>
      </div>

      {/* Public URL Card */}
      <PublicUrlCard slug={clinic.slug} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        <TabLink href="/dashboard/settings" active>
          Үндсэн
        </TabLink>
        <TabLink href="/dashboard/settings/services">
          Үйлчилгээ
        </TabLink>
        <TabLink href="/dashboard/settings/doctors">
          Эмч нар
        </TabLink>
        <TabLink href="/dashboard/settings/hours">
          Ажлын цаг
        </TabLink>
      </div>

      <ClinicInfoForm clinic={clinic} />
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