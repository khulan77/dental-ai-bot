import { createAdminClient } from '@/lib/db/supabase';
import { getCurrentClinic } from '@/lib/db/supabase-server';
import BranchesManager from './branches-manager';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getData() {
  const clinic = await getCurrentClinic();
  if (!clinic) return null;

  const supabase = createAdminClient();
  const { data: branches } = await supabase
    .from('branches')
    .select('id, name, address, phone, business_hours, display_order, is_active')
    .eq('clinic_id', clinic.id)
    .order('display_order', { ascending: true });

  return { clinic, branches: branches ?? [] };
}

export default async function BranchesPage() {
  const data = await getData();
  if (!data) return <div>Клиник олдсонгүй</div>;

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Тохиргоо</h1>
        <p className="text-slate-500 mt-1">Салбарууд (олон хаяг)</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        <TabLink href="/dashboard/settings">Үндсэн</TabLink>
        <TabLink href="/dashboard/settings/branches" active>Салбар</TabLink>
        <TabLink href="/dashboard/settings/services">Үйлчилгээ</TabLink>
        <TabLink href="/dashboard/settings/doctors">Эмч нар</TabLink>
        <TabLink href="/dashboard/settings/hours">Ажлын цаг</TabLink>
        <TabLink href="/dashboard/settings/instagram">Instagram</TabLink>
      </div>

      <BranchesManager
        clinicHours={data.clinic.business_hours}
        initialBranches={data.branches}
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
