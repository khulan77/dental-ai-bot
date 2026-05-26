import { createAdminClient } from '@/lib/db/supabase';
import { notFound } from 'next/navigation';
import ClinicChat from './clinic-chat';

export const dynamic = 'force-dynamic';

async function getClinic(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('clinics')
    .select('id, name, slug, bot_personality, services, address, latitude, longitude')
    .eq('slug', slug)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const clinic = await getClinic(slug);
  return {
    title: clinic ? `${clinic.name} - AI Ассистент` : 'Клиник',
    description: 'Цаг захиалах, мэдээлэл авах',
  };
}

export default async function ClinicChatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const clinic = await getClinic(slug);

  if (!clinic) {
    notFound();
  }

  return <ClinicChat clinic={clinic} />;
}