import { createAdminClient } from '@/lib/db/supabase';
import { notFound } from 'next/navigation';
import ClinicLanding from './clinic-landing';
import { getClinicBranches, getDoctorBranchMap } from '@/lib/booking/branches';

export const dynamic = 'force-dynamic';

async function getData(slug: string) {
  const supabase = createAdminClient();

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!clinic) return null;

  const { data: doctorRows } = await supabase
    .from('doctors')
    .select('id, name, specialty, bio, avatar_url, service_ids')
    .eq('clinic_id', clinic.id)
    .eq('is_active', true)
    .order('display_order');

  const doctors = doctorRows ?? [];

  // Салбар болон эмч↔салбар холбоос. Салбаргүй эмнэлэгт хоосон.
  const [branches, branchMap] = await Promise.all([
    getClinicBranches(clinic.id),
    getDoctorBranchMap(doctors.map(d => d.id)),
  ]);

  const doctorsWithBranches = doctors.map(d => ({
    ...d,
    branch_ids: branchMap[d.id] ?? [],
  }));

  return { clinic, doctors: doctorsWithBranches, branches };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getData(slug);

  const title = data?.clinic ? `${data.clinic.name} — Цаг захиалах` : 'Шүдний эмнэлэг';
  const description =
    data?.clinic?.about ?? 'Онлайнаар цагаа захиалаарай. Эмч, үйлчилгээ, сул цагаа хараад шууд бүртгүүлнэ.';

  return {
    title,
    description,
    // Messenger, Facebook-д линк хуваалцахад гарчиг, тайлбар, зураг харагдана.
    // og:image-ийг opengraph-image.tsx автоматаар нэмнэ.
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'mn_MN',
      url: `/c/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
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

  return (
    <ClinicLanding clinic={data.clinic} doctors={data.doctors} branches={data.branches} />
  );
}