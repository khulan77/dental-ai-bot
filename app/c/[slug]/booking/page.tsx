import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Phone, ShieldCheck, Ticket } from 'lucide-react';
import { createAdminClient } from '@/lib/db/supabase';
import BookingLookup from './booking-lookup';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: 'Захиалга шалгах',
    description: 'Утасны дугаар эсвэл захиалгын кодоороо цагийн захиалгаа шалгана уу.',
    alternates: { canonical: `/c/${slug}/booking` },
  };
}

export default async function BookingLookupPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { slug } = await params;
  const { code } = await searchParams;

  const supabase = createAdminClient();
  const { data: clinic } = await supabase
    .from('clinics')
    .select('name, slug, owner_phone')
    .eq('slug', slug)
    .single();

  if (!clinic) notFound();

  return (
    <div className="min-h-screen bg-[var(--site-bg-soft)]">
      {/* ── Гүн өнгөт толгой зурвас ── */}
      <section className="site-band px-5 sm:px-8 pt-10 pb-32 sm:pb-40">
        <div className="site-band-inner site-container max-w-3xl">
          <Link
            href={`/c/${slug}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/70 hover:text-white transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            {clinic.name}
          </Link>

          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-[var(--site-r-pill)] bg-white/12 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/80 mb-5">
              <Ticket className="w-3.5 h-3.5" />
              Захиалга шалгах
            </span>

            <h1 className="text-[32px] sm:text-[42px] font-bold leading-[1.12] tracking-[-0.02em] mb-4">
              Таны цаг
              <br />
              баталгаажсан уу?
            </h1>

            <p className="text-[15px] leading-relaxed text-white/75">
              Захиалгын <strong className="text-white font-semibold">кодоо</strong> эсвэл
              бүртгүүлсэн <strong className="text-white font-semibold">утасны дугаараа</strong>{' '}
              оруулаад төлөвөө шууд хараарай.
            </p>
          </div>
        </div>
      </section>

      {/* ── Зурвас дээр хөвж буй хайлтын карт ── */}
      <section className="px-5 sm:px-8 pb-24 -mt-24 sm:-mt-28">
        <div className="site-container max-w-3xl">
          <BookingLookup slug={slug} initialQuery={code} />

          {/* Тусламж */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="rounded-[var(--site-r-card)] border border-[var(--site-line)] bg-white p-5">
              <div className="site-icon-tile mb-3">
                <ShieldCheck className="w-[18px] h-[18px]" />
              </div>
              <h3 className="text-[14px] font-semibold text-[var(--site-ink)] mb-1">
                Кодоо алдсан уу?
              </h3>
              <p className="text-[13px] text-[var(--site-muted)] leading-relaxed">
                Захиалга хийхдээ өгсөн утасны дугаараа оруулбал бүх захиалга тань
                харагдана.
              </p>
            </div>

            <div className="rounded-[var(--site-r-card)] border border-[var(--site-line)] bg-white p-5">
              <div className="site-icon-tile mb-3">
                <Phone className="w-[18px] h-[18px]" />
              </div>
              <h3 className="text-[14px] font-semibold text-[var(--site-ink)] mb-1">
                Асуух зүйл байна уу?
              </h3>
              {clinic.owner_phone ? (
                <a
                  href={`tel:${clinic.owner_phone}`}
                  className="text-[13px] font-medium text-[var(--site-accent)] hover:underline"
                >
                  {clinic.owner_phone} руу залгана уу
                </a>
              ) : (
                <p className="text-[13px] text-[var(--site-muted)] leading-relaxed">
                  Эмнэлэгтэйгээ шууд холбогдоно уу.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
