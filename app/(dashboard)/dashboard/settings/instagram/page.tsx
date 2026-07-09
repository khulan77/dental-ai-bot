import { getCurrentClinic } from '@/lib/db/supabase-server';
import InstagramForm from './instagram-form';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InstagramSettingsPage() {
  const clinic = await getCurrentClinic();

  if (!clinic) {
    return <div>Клиник олдсонгүй</div>;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/webhook`;

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Тохиргоо</h1>
        <p className="text-slate-500 mt-1">Instagram / Messenger бот холболт</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        <TabLink href="/dashboard/settings">Үндсэн</TabLink>
        <TabLink href="/dashboard/settings/services">Үйлчилгээ</TabLink>
        <TabLink href="/dashboard/settings/doctors">Эмч нар</TabLink>
        <TabLink href="/dashboard/settings/hours">Ажлын цаг</TabLink>
        <TabLink href="/dashboard/settings/instagram" active>
          Instagram
        </TabLink>
      </div>

      <InstagramForm
        clinicId={clinic.id}
        pageId={clinic.instagram_page_id ?? null}
        hasToken={Boolean(clinic.meta_page_access_token)}
        webhookUrl={webhookUrl}
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
