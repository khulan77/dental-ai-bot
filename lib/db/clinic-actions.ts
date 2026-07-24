'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from './supabase';
import { requireOwnedClinicId } from './supabase-server';
import { validateSlug } from '@/lib/validation';
import type { Doctor } from '@/types/database';

/**
 * ЧУХАЛ: Энэ файлын функцууд бол нийтэд нээлттэй HTTP endpoint юм
 * ('use server' → Next.js сүлжээгээр дуудагдахаар хувиргана). Admin client
 * нь service_role key ашигладаг тул RLS-ийг тойрдог — өөрөөр хэлбэл
 * өгөгдлийн сангийн хамгаалалт энд ажиллахгүй.
 *
 * Тиймээс clinicId-г хэзээ ч параметрээр бүү ав. requireOwnedClinicId()
 * сесс-ээс тодорхойлно; шинэ action нэмэх бүртээ мөн адил хий.
 */

export type ClinicUpdateData = {
  name?: string;
  about?: string;
  address?: string;
  owner_phone?: string;
  owner_email?: string;
  website?: string;
  facebook_url?: string;
  instagram_url?: string;
  latitude?: number;
  longitude?: number;
  instagram_page_id?: string | null;
  meta_page_access_token?: string | null;
};

export async function updateClinic(
  data: ClinicUpdateData
): Promise<{ success: boolean; error?: string }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('clinics')
      .update(data)
      .eq('id', clinicId);

    if (error) throw error;

    // Cache-ийг цэвэрлэх (мэдээлэл өөрчилөгдсөн учир)
    await supabase
      .from('response_cache')
      .delete()
      .eq('clinic_id', clinicId);

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export type ServiceData = {
  id?: string;
  name: string;
  price_mnt: number;
  duration_minutes: number;
  description?: string;
};

/**
 * Шинэ үйлчилгээ нэмэх
 */
export async function addService(
  service: Omit<ServiceData, 'id'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();

    // Одоогийн services-ийг авах
    const { data: clinic, error: fetchError } = await supabase
      .from('clinics')
      .select('services')
      .eq('id', clinicId)
      .single();

    if (fetchError) throw fetchError;

    const currentServices = (clinic?.services ?? []) as ServiceData[];
    const newService: ServiceData = {
      id: randomUUID(),
      ...service,
    };

    const updatedServices = [...currentServices, newService];

    const { error: updateError } = await supabase
      .from('clinics')
      .update({ services: updatedServices })
      .eq('id', clinicId);

    if (updateError) throw updateError;

    // Cache-ийг цэвэрлэх
    await supabase.from('response_cache').delete().eq('clinic_id', clinicId);

    revalidatePath('/dashboard/settings/services');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Үйлчилгээ засах
 */
export async function updateService(
  serviceId: string,
  updates: Partial<Omit<ServiceData, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();

    const { data: clinic, error: fetchError } = await supabase
      .from('clinics')
      .select('services')
      .eq('id', clinicId)
      .single();

    if (fetchError) throw fetchError;

    const currentServices = (clinic?.services ?? []) as ServiceData[];
    const updatedServices = currentServices.map(s =>
      s.id === serviceId ? { ...s, ...updates } : s
    );

    const { error: updateError } = await supabase
      .from('clinics')
      .update({ services: updatedServices })
      .eq('id', clinicId);

    if (updateError) throw updateError;

    await supabase.from('response_cache').delete().eq('clinic_id', clinicId);

    revalidatePath('/dashboard/settings/services');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Үйлчилгээ устгах
 */
export async function deleteService(
  serviceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();

    const { data: clinic, error: fetchError } = await supabase
      .from('clinics')
      .select('services')
      .eq('id', clinicId)
      .single();

    if (fetchError) throw fetchError;

    const currentServices = (clinic?.services ?? []) as ServiceData[];
    const updatedServices = currentServices.filter(s => s.id !== serviceId);

    const { error: updateError } = await supabase
      .from('clinics')
      .update({ services: updatedServices })
      .eq('id', clinicId);

    if (updateError) throw updateError;

    await supabase.from('response_cache').delete().eq('clinic_id', clinicId);

    revalidatePath('/dashboard/settings/services');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export type DayHours = {
  open: string;
  close: string;
} | null;

export type BusinessHoursData = {
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
  sun: DayHours;
};

/**
 * Ажлын цагийг шинэчлэх
 */
export async function updateBusinessHours(
  hours: BusinessHoursData
): Promise<{ success: boolean; error?: string }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('clinics')
      .update({ business_hours: hours })
      .eq('id', clinicId);

    if (error) throw error;

    // Cache цэвэрлэх — ажлын цаг өөрчлөгдсөн учир хуучин хариулт буруу
    await supabase.from('response_cache').delete().eq('clinic_id', clinicId);

    revalidatePath('/dashboard/settings/hours');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export type DoctorInput = {
  name: string;
  specialty?: string;
  /** Цаг захиалгын мэдэгдэл хүлээн авах хаяг. Хоосон бол зөвхөн эзэн авна. */
  email?: string;
  bio?: string;
  service_ids?: string[];
  custom_hours?: BusinessHoursData | null;
  /** Энэ эмч аль салбарт ажилладаг. Салбаргүй эмнэлэгт хоосон. */
  branch_ids?: string[];
};

/**
 * Эмчийн салбарын холбоосыг бүхэлд нь дахин бичих (олон-олон).
 * Эмч тухайн эмнэлгийнх эсэхийг branches-ээр дамжуулан шалгана.
 */
async function setDoctorBranches(
  supabase: ReturnType<typeof createAdminClient>,
  clinicId: string,
  doctorId: string,
  branchIds: string[]
): Promise<void> {
  await supabase.from('doctor_branches').delete().eq('doctor_id', doctorId);
  if (branchIds.length === 0) return;

  // Зөвхөн энэ эмнэлгийн салбарыг оруулна (хууль бус id-аас хамгаална)
  const { data: valid } = await supabase
    .from('branches')
    .select('id')
    .eq('clinic_id', clinicId)
    .in('id', branchIds);

  const rows = (valid ?? []).map(b => ({ doctor_id: doctorId, branch_id: b.id }));
  if (rows.length > 0) {
    await supabase.from('doctor_branches').insert(rows);
  }
}

/**
 * Эмч нэмэх
 */
export async function addDoctor(
  data: DoctorInput
): Promise<{ success: boolean; error?: string; doctor?: Doctor }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();

    // Display order авах (одоогийн доктор тоо + 1)
    const { count } = await supabase
      .from('doctors')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    const { data: doctor, error } = await supabase
      .from('doctors')
      .insert({
        clinic_id: clinicId,
        name: data.name,
        specialty: data.specialty ?? null,
        email: data.email || null,
        bio: data.bio ?? null,
        service_ids: data.service_ids ?? [],
        custom_hours: data.custom_hours ?? null,
        display_order: (count ?? 0) + 1,
      })
      .select()
      .single();

    if (error) throw error;

    if (data.branch_ids) {
      await setDoctorBranches(supabase, clinicId, doctor.id, data.branch_ids);
    }

    await supabase.from('response_cache').delete().eq('clinic_id', clinicId);

    revalidatePath('/dashboard/settings/doctors');
    revalidatePath('/dashboard');

    return { success: true, doctor: doctor as Doctor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Эмч засах
 */
export async function updateDoctor(
  doctorId: string,
  data: Partial<DoctorInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();

    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.specialty !== undefined) updates.specialty = data.specialty;
    if (data.email !== undefined) updates.email = data.email || null;
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.service_ids !== undefined) updates.service_ids = data.service_ids;
    if (data.custom_hours !== undefined) updates.custom_hours = data.custom_hours;

    // updates хоосон байсан ч (зөвхөн салбар өөрчилсөн) алдаа гаргахгүй
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('doctors')
        .update(updates)
        .eq('id', doctorId)
        .eq('clinic_id', clinicId);
      if (error) throw error;
    }

    if (data.branch_ids !== undefined) {
      await setDoctorBranches(supabase, clinicId, doctorId, data.branch_ids);
    }

    await supabase.from('response_cache').delete().eq('clinic_id', clinicId);

    revalidatePath('/dashboard/settings/doctors');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Эмч устгах
 */
export async function deleteDoctor(
  doctorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', doctorId)
      .eq('clinic_id', clinicId);

    if (error) throw error;

    await supabase.from('response_cache').delete().eq('clinic_id', clinicId);

    revalidatePath('/dashboard/settings/doctors');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clinic-ийн slug өөрчлөх
 */
export async function updateClinicSlug(
  newSlug: string
): Promise<{ success: boolean; error?: string; slug?: string }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();

    const slugResult = validateSlug(newSlug);
    if (!slugResult.ok) {
      return { success: false, error: slugResult.error };
    }
    const cleanSlug = slugResult.slug;

    // Давхцал шалгах
    const { data: existing } = await supabase
      .from('clinics')
      .select('id')
      .eq('slug', cleanSlug)
      .neq('id', clinicId)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Энэ URL аль хэдийн ашиглагдсан байна' };
    }

    // Update
    const { error } = await supabase
      .from('clinics')
      .update({ slug: cleanSlug })
      .eq('id', clinicId);

    if (error) throw error;

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');

    return { success: true, slug: cleanSlug };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================================
// Салбар (branches)
// =====================================================================

export type BranchInput = {
  name: string;
  address?: string;
  phone?: string;
  /** null бол клиникийн default ажлын цаг */
  business_hours?: BusinessHoursData | null;
};

export type BranchRow = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  business_hours: BusinessHoursData | null;
  display_order: number;
  is_active: boolean;
};

/**
 * Салбар нэмэх
 */
export async function addBranch(
  data: BranchInput
): Promise<{ success: boolean; error?: string; branch?: BranchRow }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();

    const { count } = await supabase
      .from('branches')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    const { data: branch, error } = await supabase
      .from('branches')
      .insert({
        clinic_id: clinicId,
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        business_hours: data.business_hours ?? null,
        display_order: (count ?? 0) + 1,
      })
      .select('id, name, address, phone, business_hours, display_order, is_active')
      .single();

    if (error) throw error;

    await supabase.from('response_cache').delete().eq('clinic_id', clinicId);
    revalidatePath('/dashboard/settings/branches');

    return { success: true, branch: branch as BranchRow };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Салбар засах
 */
export async function updateBranch(
  branchId: string,
  data: Partial<BranchInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();

    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.address !== undefined) updates.address = data.address || null;
    if (data.phone !== undefined) updates.phone = data.phone || null;
    if (data.business_hours !== undefined) updates.business_hours = data.business_hours;

    // clinic_id-аар шүүж бусад эмнэлгийн салбар засахаас сэргийлнэ
    const { error } = await supabase
      .from('branches')
      .update(updates)
      .eq('id', branchId)
      .eq('clinic_id', clinicId);

    if (error) throw error;

    await supabase.from('response_cache').delete().eq('clinic_id', clinicId);
    revalidatePath('/dashboard/settings/branches');

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Салбар устгах — тухайн салбарын эмч холбоос cascade-ээр устна.
 */
export async function deleteBranch(
  branchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const clinicId = await requireOwnedClinicId();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', branchId)
      .eq('clinic_id', clinicId);

    if (error) throw error;

    await supabase.from('response_cache').delete().eq('clinic_id', clinicId);
    revalidatePath('/dashboard/settings/branches');

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
