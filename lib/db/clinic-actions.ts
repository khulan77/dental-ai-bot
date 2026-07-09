'use server';

import { createAdminClient } from './supabase';
import { revalidatePath } from 'next/cache';

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
  clinicId: string,
  data: ClinicUpdateData
): Promise<{ success: boolean; error?: string }> {
  try {
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

import { randomUUID } from 'crypto';

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
  clinicId: string,
  service: Omit<ServiceData, 'id'>
): Promise<{ success: boolean; error?: string }> {
  try {
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
  clinicId: string,
  serviceId: string,
  updates: Partial<Omit<ServiceData, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
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
  clinicId: string,
  serviceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
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
  clinicId: string,
  hours: BusinessHoursData
): Promise<{ success: boolean; error?: string }> {
  try {
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


import type { Doctor } from '@/types/database';

export type DoctorInput = {
  name: string;
  specialty?: string;
  bio?: string;
  service_ids?: string[];
  custom_hours?: BusinessHoursData | null;
};

/**
 * Эмч нэмэх
 */
export async function addDoctor(
  clinicId: string,
  data: DoctorInput
): Promise<{ success: boolean; error?: string; doctor?: Doctor }> {
  try {
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
        bio: data.bio ?? null,
        service_ids: data.service_ids ?? [],
        custom_hours: data.custom_hours ?? null,
        display_order: (count ?? 0) + 1,
      })
      .select()
      .single();

    if (error) throw error;

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
  clinicId: string,
  doctorId: string,
  data: Partial<DoctorInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.specialty !== undefined) updates.specialty = data.specialty;
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.service_ids !== undefined) updates.service_ids = data.service_ids;
    if (data.custom_hours !== undefined) updates.custom_hours = data.custom_hours;

    const { error } = await supabase
      .from('doctors')
      .update(updates)
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
 * Эмч устгах
 */
export async function deleteDoctor(
  clinicId: string,
  doctorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
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
  clinicId: string,
  newSlug: string
): Promise<{ success: boolean; error?: string; slug?: string }> {
  try {
    const supabase = createAdminClient();

    const cleanSlug = newSlug.toLowerCase().trim();

    // Validation
    if (cleanSlug.length < 3 || cleanSlug.length > 30) {
      return { success: false, error: '3-30 тэмдэгт байх ёстой' };
    }

    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      return { success: false, error: 'Зөвхөн англи жижиг үсэг, тоо, зураас (-)' };
    }

    if (cleanSlug.startsWith('-') || cleanSlug.endsWith('-')) {
      return { success: false, error: 'Зураас эхэнд эсвэл төгсгөлд байж болохгүй' };
    }

    const RESERVED = ['admin', 'api', 'dashboard', 'login', 'signup', 'test', 'c', 'auth', 'settings'];
    if (RESERVED.includes(cleanSlug)) {
      return { success: false, error: 'Энэ нэр ашиглах боломжгүй' };
    }

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