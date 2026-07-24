import { getCurrentClinic } from '@/lib/db/supabase-server';
import HoursManager from './hours-manager';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getClinic() {
  return await getCurrentClinic();
}

export default async function HoursPage() {
  const clinic = await getClinic();

  if (!clinic) {
    return <div>Клиник олдсонгүй</div>;
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Тохиргоо</h1>
        <p className="text-slate-500 mt-1">Ажлын цагийн хуваарь</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        <TabLink href="/dashboard/settings" active={false}>
          Үндсэн
        </TabLink>
        <TabLink href="/dashboard/settings/branches" active={false}>
          Салбар
        </TabLink>
        <TabLink href="/dashboard/settings/services" active={false}>
          Үйлчилгээ
        </TabLink>
        <TabLink href="/dashboard/settings/doctors" active={false}>
          Эмч нар
        </TabLink>
        <TabLink href="/dashboard/settings/hours" active={true}>
          Ажлын цаг
        </TabLink>
        <TabLink href="/dashboard/settings/instagram" active={false}>
          Instagram
        </TabLink>
      </div>

      <HoursManager initialHours={clinic.business_hours} />
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