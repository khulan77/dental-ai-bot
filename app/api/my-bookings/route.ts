import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase';
import { lookupBookingSchema, firstZodError } from '@/lib/validation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * POST /api/my-bookings — үйлчлүүлэгч өөрийн захиалгаа шалгах.
 *
 * Хайлт: утасны дугаар ЭСВЭЛ захиалгын код. Хариунд зөвхөн тухайн
 * захиалгын мэдээллийг буцаана — өөр үйлчлүүлэгчийн жагсаалт гарахгүй.
 * Дугаар таамаглаж хайхаас сэргийлж rate limit тавьсан.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`lookup:${ip}`, 15, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = lookupBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
    }

    const { slug, query } = parsed.data;
    const supabase = createAdminClient();

    const { data: clinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!clinic) {
      return NextResponse.json({ error: 'Эмнэлэг олдсонгүй' }, { status: 404 });
    }

    // Зөвхөн цифр бол утас, эсрэг тохиолдолд захиалгын код гэж үзнэ
    const digits = query.replace(/\D/g, '');
    const isPhone = /^\d+$/.test(query.replace(/[\s+\-]/g, '')) && digits.length >= 8;

    let request_ = supabase
      .from('appointments')
      .select(
        'id, booking_code, customer_name, service, scheduled_at, status, doctor_id, branch_id'
      )
      .eq('clinic_id', clinic.id)
      .order('scheduled_at', { ascending: false })
      .limit(20);

    if (isPhone) {
      // Хадгалсан дугаар +976 угтвартай ч байж болно — сүүлийн 8 оронгоор тааруулна
      request_ = request_.like('customer_phone', `%${digits.slice(-8)}`);
    } else {
      request_ = request_.eq('booking_code', query.toUpperCase());
    }

    const { data: appointments, error } = await request_;

    if (error) {
      console.error('Lookup error:', error);
      return NextResponse.json({ error: 'Хайлт амжилтгүй боллоо' }, { status: 500 });
    }

    // Эмч, салбарын нэрийг нэмж өгөх
    const doctorIds = [...new Set((appointments ?? []).map(a => a.doctor_id).filter(Boolean))];
    const branchIds = [...new Set((appointments ?? []).map(a => a.branch_id).filter(Boolean))];

    const [doctorsResult, branchesResult] = await Promise.all([
      doctorIds.length
        ? supabase.from('doctors').select('id, name').in('id', doctorIds as string[])
        : Promise.resolve({ data: [] }),
      branchIds.length
        ? supabase.from('branches').select('id, name, address').in('id', branchIds as string[])
        : Promise.resolve({ data: [] }),
    ]);

    const doctorMap = new Map(
      ((doctorsResult.data ?? []) as { id: string; name: string }[]).map(d => [d.id, d.name])
    );
    const branchMap = new Map(
      ((branchesResult.data ?? []) as { id: string; name: string; address: string | null }[]).map(
        b => [b.id, b]
      )
    );

    return NextResponse.json({
      bookings: (appointments ?? []).map(a => ({
        id: a.id,
        bookingCode: a.booking_code,
        customerName: a.customer_name,
        service: a.service,
        scheduledAt: a.scheduled_at,
        status: a.status,
        doctorName: a.doctor_id ? doctorMap.get(a.doctor_id) ?? null : null,
        branchName: a.branch_id ? branchMap.get(a.branch_id)?.name ?? null : null,
        branchAddress: a.branch_id ? branchMap.get(a.branch_id)?.address ?? null : null,
      })),
    });
  } catch (error) {
    console.error('My bookings error:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
