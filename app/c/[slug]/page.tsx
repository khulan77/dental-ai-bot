import { createAdminClient } from '@/lib/db/supabase';
import { notFound } from 'next/navigation';
import ClinicLanding from './clinic-landing';

export const dynamic = 'force-dynamic';

async function getData(slug: string) {
  const supabase = createAdminClient();
  
  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!clinic) return null;

  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, name, specialty, bio, avatar_url')
    .eq('clinic_id', clinic.id)
    .eq('is_active', true)
    .order('display_order');

  return { clinic, doctors: doctors ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getData(slug);
  return {
    title: data?.clinic ? `${data.clinic.name} - Цаг захиалах` : 'Клиник',
    description: data?.clinic?.about ?? 'Шүдний эрүүл мэндийн төв',
  };
}

export default async function ClinicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getData(slug);

  if (!data) {
    notFound();
  }

  return <ClinicLanding clinic={data.clinic} doctors={data.doctors} />;
}