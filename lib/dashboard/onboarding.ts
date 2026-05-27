import { createAdminClient } from '@/lib/db/supabase';

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
  icon: string;
};

export async function getOnboardingProgress(clinicId: string) {
  const supabase = createAdminClient();

  const { data: clinic } = await supabase
    .from('clinics')
  .select('name, address, owner_phone, services, business_hours')
    .eq('id', clinicId)
    .single();

  const { data: doctors } = await supabase
    .from('doctors')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('is_active', true);

  const services = (clinic?.services ?? []) as Array<{ name: string }>;
  const businessHours = clinic?.business_hours as Record<string, unknown> | null;
  
  // Business hours шалгах — наад зах нь 1 өдөр нээлттэй
  const hasBusinessHours = !!businessHours && 
    Object.values(businessHours).some(v => v !== null && v !== undefined);

  // Clinic info — address ЭСВЭЛ phone бөглөгдсөн бол
  const hasClinicInfo = !!(clinic?.address || clinic?.owner_phone);

  const steps: OnboardingStep[] = [
    {
      id: 'clinic-info',
      title: 'Клиникийн мэдээлэл',
      description: 'Хаяг, утас, тухай',
      completed: hasClinicInfo,
      href: '/dashboard/settings',
      icon: '🏥',
    },
    {
      id: 'services',
      title: 'Үйлчилгээ нэмэх',
      description: 'Үнэ, үргэлжлэх хугацаа',
      completed: services.length > 0,
      href: '/dashboard/settings/services',
      icon: '📋',
    },
    {
      id: 'doctors',
      title: 'Эмч нар нэмэх',
      description: 'Нэр, мэргэжил, хуваарь',
      completed: (doctors?.length ?? 0) > 0,
      href: '/dashboard/settings/doctors',
      icon: '👨‍⚕️',
    },
    {
      id: 'hours',
      title: 'Ажлын цаг',
      description: 'Долоо хоногийн хуваарь',
      completed: hasBusinessHours,
      href: '/dashboard/settings/hours',
      icon: '⏰',
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const totalCount = steps.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const isComplete = completedCount === totalCount;

  return { steps, completedCount, totalCount, progress, isComplete };
}