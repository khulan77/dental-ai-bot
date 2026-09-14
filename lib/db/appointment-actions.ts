'use server';

import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { createAdminClient } from '@/lib/db/supabase';
import { requireOwnedClinicId } from '@/lib/db/supabase-server';
import { adminBookSchema, firstZodError } from '@/lib/validation';
import { isSlotAvailable } from '@/lib/booking/slots';
import { generateBookingCode } from '@/lib/booking/code';
import { clinicInstantFrom } from '@/lib/booking/timezone';

function revalidateBookingPages() {
  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard/calendar');
  revalidatePath('/dashboard');
}

/**
 * Хяналтын самбараас захиалга бүртгэх (утсаар залгасан, шууд ирсэн хүн).
 *
 * Эмч, салбар хоёр нэвтэрсэн эзэмшигчийн эмнэлгийнх эсэхийг шалгана —
 * клиентээс ирсэн id-д итгэхгүй. Эмч тухайн цагт өөр захиалгатай бол
 * бүртгэхгүй.
 */
export async function createAppointment(
  input: z.input<typeof adminBookSchema>
): Promise<{ success: true; bookingCode: string | null } | { success: false; error: string }> {
  try {
    const parsed = adminBookSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: firstZodError(parsed.error) };
    const d = parsed.data;

    // Демо дээр ч ажиллана — захиалга бүртгэх нь өдөр тутмын гол үйлдэл
    const clinicId = await requireOwnedClinicId({ allowDemo: true });
    const supabase = createAdminClient();

    const [doctorRes, branchRes] = await Promise.all([
      supabase.from('doctors').select('id').eq('id', d.doctorId).eq('clinic_id', clinicId).maybeSingle(),
      d.branchId
        ? supabase.from('branches').select('id').eq('id', d.branchId).eq('clinic_id', clinicId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    if (!doctorRes.data) return { success: false, error: 'Эмч олдсонгүй' };
    if (d.branchId && !branchRes.data) return { success: false, error: 'Салбар олдсонгүй' };

    // Сонгосон цаг нь эмнэлгийн ханан дээрх цаг
    const scheduledAt = clinicInstantFrom(d.date, d.time).toISOString();
    const free = await isSlotAvailable(clinicId, d.doctorId, scheduledAt, d.durationMinutes);
    if (!free) {
      return { success: false, error: 'Энэ эмч энэ цагт өөр захиалгатай байна. Өөр цаг сонгоно уу.' };
    }

    const bookingCode = await generateBookingCode();
    const { error } = await supabase.from('appointments').insert({
      clinic_id: clinicId,
      doctor_id: d.doctorId,
      branch_id: d.branchId,
      customer_name: d.customerName,
      customer_phone: d.customerPhone || null,
      service: d.service,
      scheduled_at: scheduledAt,
      duration_minutes: d.durationMinutes,
      status: d.status,
      booking_code: bookingCode,
      notes: d.notes || null,
    });
    if (error) throw error;

    revalidateBookingPages();
    return { success: true, bookingCode };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Алдаа гарлаа',
    };
  }
}

/**
 * Захиалгын төлөв шинэчлэх (баталгаажуулах / дуусгах / цуцлах).
 *
 * clinicId-г сесс-ээс тодорхойлж, тухайн захиалга үнэхээр энэ клиникийнх
 * эсэхийг шалгана — өөр эмнэлгийн захиалгын id дамжуулж өөрчлөх боломжгүй.
 */
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'reminded'
  | 'completed'
  | 'no_show'
  | 'cancelled';

const ALLOWED: AppointmentStatus[] = [
  'pending',
  'confirmed',
  'reminded',
  'completed',
  'no_show',
  'cancelled',
];

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!ALLOWED.includes(status)) {
      return { success: false, error: 'Төлөв буруу байна' };
    }

    // Демо дээр ч ажиллана — захиалга баталгаажуулах нь эмнэлгийн өдөр
    // тутмын гол үйлдэл, зочин үүнийг туршиж үзэх ёстой.
    const clinicId = await requireOwnedClinicId({ allowDemo: true });
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .eq('clinic_id', clinicId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return { success: false, error: 'Захиалга олдсонгүй' };
    }

    revalidateBookingPages();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Алдаа гарлаа',
    };
  }
}
