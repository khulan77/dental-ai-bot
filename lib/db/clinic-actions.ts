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