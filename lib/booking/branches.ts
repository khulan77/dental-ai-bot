import { createAdminClient } from '@/lib/db/supabase';

export type PublicBranch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
};

/**
 * Клиникийн идэвхтэй салбаруудыг эрэмбээр нь буцаана.
 * Салбаргүй эмнэлэгт хоосон массив — дуудагч тал хуучин ажиллагаа руу шилжинэ.
 */
export async function getClinicBranches(clinicId: string): Promise<PublicBranch[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('branches')
    .select('id, name, address, phone')
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  return data ?? [];
}

/**
 * doctor_id → тухайн эмч ажилладаг branch_id-ийн жагсаалт.
 * Салбаргүй эмнэлэгт эмч бүр хоосон массивтай байна.
 */
export async function getDoctorBranchMap(
  doctorIds: string[]
): Promise<Record<string, string[]>> {
  const map: Record<string, string[]> = {};
  if (doctorIds.length === 0) return map;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('doctor_branches')
    .select('doctor_id, branch_id')
    .in('doctor_id', doctorIds);

  for (const row of data ?? []) {
    (map[row.doctor_id] ??= []).push(row.branch_id);
  }
  return map;
}
