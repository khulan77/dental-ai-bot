import { ImageResponse } from 'next/og';
import { createAdminClient } from '@/lib/db/supabase';

// Messenger, Facebook, Instagram-д линк хуваалцахад харагдах зураг.
// Фонт тусад нь ачаалахгүй — next/og-ийн үндсэн фонт кирилл (Ө, Ү) дэмждэг.

export const alt = 'Цаг захиалах';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ACCENT = '#1D4ED8';
const INK = '#0F172A';
const MUTED = '#64748B';
const LINE = '#E5E9F0';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createAdminClient();
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id, name, about, address, services')
    .eq('slug', slug)
    .single();

  const name = clinic?.name ?? 'Шүдний эмнэлэг';
  // Гарчигтай давхцуулахгүй байхын тулд өөр өгүүлбэр
  const about = clinic?.about ?? 'Эмч, үйлчилгээ, сул цагаа хараад шууд бүртгүүлнэ.';

  const services = (clinic?.services ?? []) as unknown[];
  let doctorCount = 0;
  if (clinic?.id) {
    const { count } = await supabase
      .from('doctors')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinic.id)
      .eq('is_active', true);
    doctorCount = count ?? 0;
  }

  // Зөвхөн бодит тоо. Тэг бол тэр мөрийг огт харуулахгүй.
  const facts = [
    doctorCount > 0 ? `${doctorCount} эмч` : null,
    services.length > 0 ? `${services.length} үйлчилгээ` : null,
    'Онлайн цаг захиалга',
  ].filter(Boolean) as string[];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          padding: '64px 72px',
        }}
      >
        {/* Дээд тал — эмнэлгийн нэр */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: ACCENT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C9.2 2 7 4.2 7 7c0 1.8.8 3.4 2 4.5l1 7.5c.1.6.6 1 1.2 1 .5 0 1-.4 1.1-1L13 13v6c.1.6.6 1 1.1 1 .6 0 1.1-.4 1.2-1l1-7.5C17.2 10.4 18 8.8 18 7c0-2.8-2.2-5-5-5z"
                fill="white"
              />
            </svg>
          </div>
          <div style={{ fontSize: 26, color: MUTED }}>{name}</div>
        </div>

        {/* Гол мессеж */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Satori-д нэгээс олон хүүхэдтэй div заавал display заасан байх ёстой.
              <br/> хэрэглэвэл алдаа өгнө — тиймээс мөр бүрийг тусад нь div болгов. */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 76,
              color: ACCENT,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex' }}>Онлайнаар цагаа</div>
            <div style={{ display: 'flex' }}>захиалаарай</div>
          </div>
          <div
            style={{
              fontSize: 28,
              color: MUTED,
              lineHeight: 1.5,
              maxWidth: 780,
              // Хэт урт танилцуулгыг таслана — эс бөгөөс зураг дүүрнэ
              display: 'flex',
            }}
          >
            {about.length > 120 ? `${about.slice(0, 120)}…` : about}
          </div>
        </div>

        {/* Доод тал — бодит тоонууд */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            borderTop: `1px solid ${LINE}`,
            paddingTop: 28,
          }}
        >
          {facts.map((fact, i) => (
            <div key={fact} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {i > 0 && <div style={{ width: 5, height: 5, borderRadius: 5, background: LINE }} />}
              <div style={{ fontSize: 24, color: INK }}>{fact}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
