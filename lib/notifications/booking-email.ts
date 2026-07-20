import { Resend } from 'resend';
import { createAdminClient } from '@/lib/db/supabase';

/**
 * Шинэ цаг захиалга бүртгэгдэхэд эмнэлгийн эзэн болон харьяалах эмч рүү
 * мэдэгдэл илгээнэ.
 *
 * Энэ функц хэзээ ч алдаа шиддэггүй — имэйл илгээж чадаагүй нь цаг
 * захиалгыг унагаах шалтгаан биш. Дуудагч тал үүнийг Next.js-ийн after()
 * дотроос дуудна (хариу буцаасны дараа ажиллана).
 */

// Эмнэлгүүд Монголд байгаа тул цагийг үргэлж УБ-ын цагаар харуулна.
// Серверийн локал цагийн бүсээс хамаарахгүй (Vercel дээр UTC байдаг).
const CLINIC_TIMEZONE = 'Asia/Ulaanbaatar';

export type BookingNotification = {
  clinicName: string;
  clinicSlug: string;
  ownerEmail: string | null;
  doctorEmail: string | null;
  doctorName: string | null;
  customerName: string;
  customerPhone: string | null;
  service: string | null;
  scheduledAt: string;
  /** Захиалга хаанаас ирсэн — имэйлд эх сурвалжийг харуулна */
  source: 'web' | 'chat' | 'instagram' | 'messenger';
};

const SOURCE_LABELS: Record<BookingNotification['source'], string> = {
  web: 'Вэб сайт',
  chat: 'AI чат',
  instagram: 'Instagram',
  messenger: 'Messenger',
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('mn-MN', {
    timeZone: CLINIC_TIMEZONE,
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function buildHtml(b: BookingNotification, appUrl: string): string {
  const rows: [string, string][] = [
    ['Үйлчлүүлэгч', b.customerName],
    ['Утас', b.customerPhone ?? '—'],
    ['Үйлчилгээ', b.service ?? '—'],
    ['Эмч', b.doctorName ?? 'Тодорхойгүй'],
    ['Цаг', formatDateTime(b.scheduledAt)],
    ['Эх сурвалж', SOURCE_LABELS[b.source]],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 0;color:#64748b;font-size:14px;">${label}</td>
        <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
      </tr>`
    )
    .join('');

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;">
  <h2 style="margin:0 0 4px;color:#0f172a;font-size:20px;">Шинэ цаг захиалга</h2>
  <p style="margin:0 0 20px;color:#64748b;font-size:14px;">${escapeHtml(b.clinicName)}</p>

  <table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;">
    ${rowsHtml}
  </table>

  <a href="${appUrl}/dashboard/appointments"
     style="display:inline-block;margin-top:24px;padding:10px 20px;background:#2563eb;color:#fff;
            text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
    Захиалгуудыг харах
  </a>

  <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;">
    Энэ мэдэгдлийг ${escapeHtml(b.clinicName)}-ийн цаг захиалгын систем илгээв.
  </p>
</div>`.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Захиалгын id-нуудаас мэдэгдэлд хэрэгтэй мэдээллийг татаж имэйл илгээнэ.
 *
 * Route handler-ууд үүнийг after() дотроос дууддаг тул DB хайлт нь ч
 * хариу буцаасны дараа ажиллана — захиалгын хурдад нөлөөлөхгүй.
 */
export async function notifyNewBooking(input: {
  clinicId: string;
  doctorId: string | null;
  customerName: string;
  customerPhone: string | null;
  service: string | null;
  scheduledAt: string;
  source: BookingNotification['source'];
}): Promise<void> {
  try {
    const supabase = createAdminClient();

    const [{ data: clinic }, doctorResult] = await Promise.all([
      supabase
        .from('clinics')
        .select('name, slug, owner_email')
        .eq('id', input.clinicId)
        .single(),
      input.doctorId
        ? supabase.from('doctors').select('name, email').eq('id', input.doctorId).single()
        : Promise.resolve({ data: null }),
    ]);

    if (!clinic) {
      console.warn(`Мэдэгдэл алгасав: клиник олдсонгүй (${input.clinicId})`);
      return;
    }

    const doctor = doctorResult.data as { name: string; email: string | null } | null;

    await sendBookingNotification({
      clinicName: clinic.name,
      clinicSlug: clinic.slug,
      ownerEmail: clinic.owner_email,
      doctorEmail: doctor?.email ?? null,
      doctorName: doctor?.name ?? null,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      service: input.service,
      scheduledAt: input.scheduledAt,
      source: input.source,
    });
  } catch (e) {
    console.error('Мэдэгдэл бэлтгэхэд алдаа:', e);
  }
}

export async function sendBookingNotification(b: BookingNotification): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn('Мэдэгдэл алгасав: RESEND_API_KEY эсвэл RESEND_FROM_EMAIL тохируулаагүй');
    return;
  }

  // Эзэн + эмч. Хоёулаа нэг хаягтай бол давхардуулж илгээхгүй.
  const recipients = [...new Set([b.ownerEmail, b.doctorEmail].filter(Boolean))] as string[];

  if (recipients.length === 0) {
    console.warn(`Мэдэгдэл алгасав: хүлээн авагчийн имэйл алга (clinic=${b.clinicSlug})`);
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: recipients,
      subject: `Шинэ цаг захиалга — ${b.customerName} (${formatDateTime(b.scheduledAt)})`,
      html: buildHtml(b, appUrl),
    });

    if (error) {
      console.error('Мэдэгдэл илгээхэд алдаа:', error);
    }
  } catch (e) {
    // Имэйл унасан ч цаг захиалга хүчинтэй хэвээр
    console.error('Мэдэгдэл илгээхэд алдаа:', e);
  }
}
