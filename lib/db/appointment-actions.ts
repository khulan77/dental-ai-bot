'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/db/supabase';
import { requireOwnedClinicId } from '@/lib/db/supabase-server';

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

    revalidatePath('/dashboard/appointments');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Алдаа гарлаа',
    };
  }
}
