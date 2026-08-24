import { createAdminClient } from '@/lib/db/supabase';
import {
  addClinicDays,
  clinicDateISO,
  clinicDayBounds,
  clinicDayIndex,
} from '@/lib/booking/timezone';
import { effectivePrice } from '@/lib/booking/pricing';

export type DashboardStats = {
  // Today
  todayCount: number;
  todayRevenue: number;
  
  // This week
  weekCount: number;
  weekRevenue: number;
  
  // All time
  totalCount: number;
  totalRevenue: number;

  // Comparison
  yesterdayCount: number;
  lastWeekCount: number;
};

export async function getDashboardStats(clinicId: string): Promise<DashboardStats> {
  const supabase = createAdminClient();

  const now = new Date();

  // "Өнөөдөр" гэдгийг эмнэлгийн бүсээр тооцно — серверийн бүс (Vercel дээр UTC)
  // өөр байвал өдрийн статистик 8 цагаар гулсана.
  const { start: todayStart, end: todayEnd } = clinicDayBounds(now);

  const yesterdayStart = addClinicDays(todayStart, -1);
  const weekStart = addClinicDays(todayStart, -7);
  const twoWeeksAgo = addClinicDays(weekStart, -7);

  // Бүгдийг параллел татах
  const [
    todayApts,
    yesterdayApts,
    weekApts,
    lastWeekApts,
    allApts,
    clinicData,
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('service')
      .eq('clinic_id', clinicId)
      .gte('scheduled_at', todayStart.toISOString())
      .lt('scheduled_at', todayEnd.toISOString()),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('scheduled_at', yesterdayStart.toISOString())
      .lt('scheduled_at', todayStart.toISOString()),
    supabase
      .from('appointments')
      .select('service')
      .eq('clinic_id', clinicId)
      .gte('scheduled_at', weekStart.toISOString())
      .lt('scheduled_at', todayEnd.toISOString()),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('scheduled_at', twoWeeksAgo.toISOString())
      .lt('scheduled_at', weekStart.toISOString()),
    supabase
      .from('appointments')
      .select('service')
      .eq('clinic_id', clinicId),
    supabase
      .from('clinics')
      .select('services')
      .eq('id', clinicId)
      .single(),
  ]);

  // Үйлчилгээний үнийн map
  const servicePrices = new Map<string, number>();
  const services = (clinicData.data?.services ?? []) as Array<{
    name: string;
    price_mnt: number;
    discount_percent?: number | null;
    discount_until?: string | null;
  }>;
  services.forEach(s => servicePrices.set(s.name, effectivePrice(s)));

  // Revenue тооцоолох
  function calcRevenue(apts: Array<{ service: string | null }> | null): number {
    if (!apts) return 0;
    return apts.reduce((sum, apt) => {
      if (!apt.service) return sum;
      return sum + (servicePrices.get(apt.service) ?? 0);
    }, 0);
  }

  return {
    todayCount: todayApts.data?.length ?? 0,
    todayRevenue: calcRevenue(todayApts.data),
    weekCount: weekApts.data?.length ?? 0,
    weekRevenue: calcRevenue(weekApts.data),
    totalCount: allApts.data?.length ?? 0,
    totalRevenue: calcRevenue(allApts.data),
    yesterdayCount: yesterdayApts.count ?? 0,
    lastWeekCount: lastWeekApts.count ?? 0,
  };
}

/**
 * 7 хоногийн өдөр тутмын данны
 */
export type DailyStat = {
  date: string;     // "2026-05-26"
  label: string;    // "Дав"
  count: number;
  revenue: number;
};

export async function getWeeklyTrend(clinicId: string): Promise<DailyStat[]> {
  const supabase = createAdminClient();

  const todayStart = clinicDayBounds(new Date()).start;
  const weekStart = addClinicDays(todayStart, -6); // 7 хоног (өнөөдөр оруулаад)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('scheduled_at, service')
    .eq('clinic_id', clinicId)
    .gte('scheduled_at', weekStart.toISOString());

  const { data: clinic } = await supabase
    .from('clinics')
    .select('services')
    .eq('id', clinicId)
    .single();

  const servicePrices = new Map<string, number>();
  const services = (clinic?.services ?? []) as Array<{
    name: string;
    price_mnt: number;
    discount_percent?: number | null;
    discount_until?: string | null;
  }>;
  services.forEach(s => servicePrices.set(s.name, effectivePrice(s)));

  const dayLabels = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];
  const result: DailyStat[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addClinicDays(weekStart, i);
    const dateISO = clinicDateISO(date);
    const label = dayLabels[clinicDayIndex(date)];

    // Захиалгыг эмнэлгийн бүсийн өдрөөр бүлэглэнэ
    const dayApts = (appointments ?? []).filter(
      apt => clinicDateISO(new Date(apt.scheduled_at)) === dateISO
    );

    const revenue = dayApts.reduce((sum, apt) => {
      return sum + (apt.service ? (servicePrices.get(apt.service) ?? 0) : 0);
    }, 0);

    result.push({
      date: dateISO,
      label,
      count: dayApts.length,
      revenue,
    });
  }

  return result;
}

/**
 * Top customers (хамгийн их ирдэг)
 */
export type TopCustomer = {
  name: string;
  phone: string | null;
  visitCount: number;
  totalSpent: number;
  lastVisit: string;
};

export async function getTopCustomers(
  clinicId: string,
  limit: number = 5
): Promise<TopCustomer[]> {
  const supabase = createAdminClient();

  const { data: appointments } = await supabase
    .from('appointments')
    .select('customer_name, customer_phone, service, scheduled_at')
    .eq('clinic_id', clinicId);

  const { data: clinic } = await supabase
    .from('clinics')
    .select('services')
    .eq('id', clinicId)
    .single();

  const servicePrices = new Map<string, number>();
  const services = (clinic?.services ?? []) as Array<{
    name: string;
    price_mnt: number;
    discount_percent?: number | null;
    discount_until?: string | null;
  }>;
  services.forEach(s => servicePrices.set(s.name, effectivePrice(s)));

  // Customer groupping
  const customerMap = new Map<string, TopCustomer>();

  (appointments ?? []).forEach(apt => {
    const key = apt.customer_name + (apt.customer_phone ?? '');
    const price = apt.service ? (servicePrices.get(apt.service) ?? 0) : 0;

    if (customerMap.has(key)) {
      const existing = customerMap.get(key)!;
      existing.visitCount += 1;
      existing.totalSpent += price;
      if (apt.scheduled_at > existing.lastVisit) {
        existing.lastVisit = apt.scheduled_at;
      }
    } else {
      customerMap.set(key, {
        name: apt.customer_name,
        phone: apt.customer_phone,
        visitCount: 1,
        totalSpent: price,
        lastVisit: apt.scheduled_at,
      });
    }
  });

  return Array.from(customerMap.values())
    .sort((a, b) => b.visitCount - a.visitCount || b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

/**
 * AI Cache statistics
 */
export type CacheStats = {
  totalCached: number;
  totalHits: number;
  hitRate: number;        // 0-100%
  savedUsd: number;
  savedMnt: number;
  avgResponseMs: number;
};

export async function getCacheStats(clinicId: string): Promise<CacheStats> {
  const supabase = createAdminClient();

  const { data: cache } = await supabase
    .from('response_cache')
    .select('hit_count')
    .eq('clinic_id', clinicId);

  const totalCached = cache?.length ?? 0;
  const totalHits = (cache ?? []).reduce((sum, c) => sum + (c.hit_count ?? 0), 0);

  // GPT-4o-mini ~ $0.0002 per request
  const savedUsd = totalHits * 0.0002;
  const savedMnt = savedUsd * 3500; // USD to MNT (approximate)

  // Hit rate - cache hit-ийн харьцаа
  const totalRequests = totalCached + totalHits;
  const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

  return {
    totalCached,
    totalHits,
    hitRate,
    savedUsd,
    savedMnt,
    avgResponseMs: 80, // Cached response avg
  };
}

/**
 * Recent activity (сүүлийн үйлдлүүд)
 */
export type ActivityItem = {
  type: 'appointment';
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
};

export async function getRecentActivity(
  clinicId: string,
  limit: number = 8
): Promise<ActivityItem[]> {
  const supabase = createAdminClient();

  const { data: appointments } = await supabase
    .from('appointments')
    .select('customer_name, service, scheduled_at, created_at, status')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (appointments ?? []).map(apt => ({
    type: 'appointment' as const,
    title: `${apt.customer_name} цаг авлаа`,
    subtitle: apt.service ?? 'Үйлчилгээ',
    timestamp: apt.created_at,
    icon: '📅',
  }));
}

/**
 * Эмч тус бүрийн statistics
 */
export type DoctorStat = {
  id: string;
  name: string;
  specialty: string | null;
  appointmentCount: number;
  totalRevenue: number;
  thisWeekCount: number;
  thisWeekRevenue: number;
  avgRevenuePerBooking: number;
};

export async function getDoctorStats(clinicId: string): Promise<DoctorStat[]> {
  const supabase = createAdminClient();

  // Эмч нар
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, name, specialty')
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .order('display_order');

  if (!doctors || doctors.length === 0) return [];

  // Бүх booking-уудыг авах
  const { data: appointments } = await supabase
    .from('appointments')
    .select('doctor_id, service, scheduled_at')
    .eq('clinic_id', clinicId);

  // Үйлчилгээний үнэ
  const { data: clinic } = await supabase
    .from('clinics')
    .select('services')
    .eq('id', clinicId)
    .single();

  const servicePrices = new Map<string, number>();
  const services = (clinic?.services ?? []) as Array<{
    name: string;
    price_mnt: number;
    discount_percent?: number | null;
    discount_until?: string | null;
  }>;
  services.forEach(s => servicePrices.set(s.name, effectivePrice(s)));

  // 7 хоногийн өмнөх өдрийн эхлэл (эмнэлгийн бүсээр)
  const weekAgo = addClinicDays(clinicDayBounds(new Date()).start, -7);

  // Эмч тус бүрээр аналитик
  const stats: DoctorStat[] = doctors.map(doctor => {
    const doctorApts = (appointments ?? []).filter(
      apt => apt.doctor_id === doctor.id
    );

    const totalRevenue = doctorApts.reduce((sum, apt) => {
      return sum + (apt.service ? (servicePrices.get(apt.service) ?? 0) : 0);
    }, 0);

    const thisWeekApts = doctorApts.filter(
      apt => new Date(apt.scheduled_at) >= weekAgo
    );

    const thisWeekRevenue = thisWeekApts.reduce((sum, apt) => {
      return sum + (apt.service ? (servicePrices.get(apt.service) ?? 0) : 0);
    }, 0);

    return {
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      appointmentCount: doctorApts.length,
      totalRevenue,
      thisWeekCount: thisWeekApts.length,
      thisWeekRevenue,
      avgRevenuePerBooking:
        doctorApts.length > 0
          ? Math.round(totalRevenue / doctorApts.length)
          : 0,
    };
  });

  // Хамгийн их орлоготой эмчийг эхэнд
  return stats.sort((a, b) => b.totalRevenue - a.totalRevenue);
}
/**
 * Баталгаажуулахыг хүлээж буй захиалгын тоо.
 * Хажуугийн цэсний тэмдэглэгээнд ашиглана.
 */
export async function getPendingCount(clinicId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('status', 'pending');

  return count ?? 0;
}
