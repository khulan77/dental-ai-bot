/**
 * Демо эмнэлгийн өгөгдөл — seed скрипт болон демо нэвтрэлт хоёул ашиглана.
 *
 * Захиалгууд өнөөдрөөс тоологддог тул хэдэн хоногийн дараа хуучирч,
 * хуанли хоосон харагддаг байсан. Одоо /api/demo-login нэвтрэх бүрт
 * ensureFreshDemoAppointments()-ийг дуудаж, өдөрт нэг удаа шинэчилнэ.
 *
 * Скрипт (Next.js-ээс гадуур) ч импортлодог тул '@/' alias хэрэглэхгүй.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { DEMO_CLINIC_ID } from './demo';
import { clinicDateISO, clinicInstantFrom, clinicMinutesOfDay } from './booking/timezone';

const S = (n: number) => `dcdcdcdc-0001-4000-8000-00000000000${n}`;
const D = (n: number) => `dcdcdcdc-0002-4000-8000-00000000000${n}`;
const B = (n: number) => `dcdcdcdc-0003-4000-8000-00000000000${n}`;

export const DEMO_SERVICES = [
  { id: S(1), name: 'Үзлэг, оношилгоо', price_mnt: 20000, duration_minutes: 30 },
  { id: S(2), name: 'Шүдний цэвэрлэгээ', price_mnt: 80000, duration_minutes: 45 },
  { id: S(3), name: 'Ломбо', price_mnt: 120000, duration_minutes: 60 },
  { id: S(4), name: 'Шүд цайруулах', price_mnt: 350000, duration_minutes: 60, discount_percent: 20 },
  { id: S(5), name: 'Суваг эмчилгээ', price_mnt: 250000, duration_minutes: 90 },
  { id: S(6), name: 'Гажиг заслын зөвлөгөө', price_mnt: 30000, duration_minutes: 30 },
  { id: S(7), name: 'Хүүхдийн шүдний эмчилгээ', price_mnt: 50000, duration_minutes: 45 },
];

// Төв салбарт 3, Хан-Уулд 4 эмч — хуанлийн салбар солиход багана өөрчлөгдөхийг
// харуулна. Эмч бүр ганц салбартай тул "Өөр салбар" гэж бүдгэрсэн блок гарахгүй.
// Дараалал нь display_order болно. Эмч бүр өөрийн үздэг үйлчилгээтэй.
export const DEMO_DOCTORS = [
  {
    id: D(1),
    name: 'Б. Энхжаргал',
    specialty: 'Ерөнхий эмчилгээ',
    bio: '12 жил шүдний ерөнхий эмчилгээ, цэвэрлэгээ, ломбоны чиглэлээр ажиллаж байна.',
    services: [S(1), S(2), S(3)],
    branches: [B(1)],
  },
  {
    id: D(2),
    name: 'Д. Ганбаатар',
    specialty: 'Суваг эмчилгээ, мэс засал',
    bio: 'Суваг эмчилгээ, шүд авах мэс заслын мэргэшсэн эмч. Өвдөлтгүй эмчилгээнд анхаардаг.',
    services: [S(1), S(3), S(5)],
    branches: [B(1)],
  },
  {
    id: D(4),
    name: 'Г. Мөнхзул',
    specialty: 'Хүүхдийн шүдний эмч',
    bio: 'Бага насны хүүхдийн шүдний эмчилгээ, урьдчилан сэргийлэлтээр 9 жил ажиллаж байна.',
    services: [S(1), S(2), S(7)],
    branches: [B(1)],
  },
  {
    id: D(3),
    name: 'С. Оюунчимэг',
    specialty: 'Гоо сайхан засал',
    bio: 'Шүд цайруулах, гоо заслын эмчилгээний чиглэлээр 8 жил ажилласан туршлагатай.',
    services: [S(1), S(2), S(4)],
    branches: [B(2)],
  },
  {
    id: D(5),
    name: 'Э. Батжаргал',
    specialty: 'Суулгац, протез',
    bio: 'Шүдний суулгац, протезийн чиглэлээр 15 жилийн туршлагатай.',
    services: [S(1), S(3), S(5)],
    branches: [B(2)],
  },
  {
    id: D(6),
    name: 'Ц. Номин',
    specialty: 'Ерөнхий эмчилгээ',
    bio: 'Шүдний цэвэрлэгээ, ломбо, ерөнхий үзлэгийн чиглэлээр ажилладаг.',
    services: [S(1), S(2), S(3)],
    branches: [B(2)],
  },
  {
    id: D(7),
    name: 'А. Тэмүүжин',
    specialty: 'Гажиг засал',
    bio: 'Шүдний гажиг засал, брекетийн эмчилгээний мэргэшсэн эмч.',
    services: [S(1), S(6)],
    branches: [B(2)],
  },
];

export const DEMO_BRANCHES = [
  { id: B(1), name: 'Төв салбар', address: 'СБД, 1-р хороо, Энх тайвны өргөн чөлөө 15', phone: '7000-0000' },
  { id: B(2), name: 'Хан-Уул салбар', address: 'ХУД, 4-р хороо, Чингисийн өргөн чөлөө 42', phone: '7000-0001' },
];

export const DEMO_HOURS: Record<string, { open: string; close: string } | null> = {
  mon: { open: '09:00', close: '19:00' },
  tue: { open: '09:00', close: '19:00' },
  wed: { open: '09:00', close: '19:00' },
  thu: { open: '09:00', close: '19:00' },
  fri: { open: '09:00', close: '19:00' },
  sat: { open: '10:00', close: '16:00' },
  sun: null,
};

// Давтагдах нэрс — "тогтмол ирдэг үйлчлүүлэгч" самбарт утга гарахын тулд
const CUSTOMERS = [
  { name: 'Б. Наранцэцэг', phone: '99112233' },
  { name: 'Г. Батбаяр', phone: '88445566' },
  { name: 'Д. Сарантуяа', phone: '95778899' },
  { name: 'О. Мөнхбат', phone: '94220011' },
  { name: 'Ц. Алтанцэцэг', phone: '89663344' },
  { name: 'Х. Тэмүүлэн', phone: '99887766' },
  { name: 'Э. Ганзориг', phone: '86551122' },
  { name: 'Ж. Уранчимэг', phone: '90114455' },
  { name: 'Н. Болормаа', phone: '99004411' },
  { name: 'Т. Эрдэнэбат', phone: '88112299' },
  { name: 'П. Хонгорзул', phone: '95331177' },
  { name: 'Л. Цогтбаяр', phone: '94668800' },
  { name: 'М. Ариунзаяа', phone: '89445522' },
  { name: 'С. Билгүүн', phone: '99556633' },
];

const NOTES = [
  'Анх удаа ирж байгаа',
  'Мэдээ алдуулах эмэнд харшилтай',
  'Хүүхэдтэйгээ ирнэ',
  'Өмнөх ломбо унасан',
  'Утсаар залгаж сануулах',
];

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/** Өнөөдрөөс хойш, урагш хэдэн хоногийн захиалга үүсгэх вэ */
const PAST_DAYS = 14;
const FUTURE_DAYS = 14;

const LUNCH_START = 13 * 60;
const LUNCH_END = 14 * 60;

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const toHHMM = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

function shiftISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Тогтмол үр — нэг өдөр дахин ажиллуулахад ижил захиалга гарна */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Хуанли дүүрэн харагдахаар эмч бүрийн өдрийг захиалгаар дүүргэнэ.
 * Нэг эмчийн захиалгууд хоорондоо давхцахгүй, ажлын цаг, үдийн цайнаас
 * гадуур гарахгүй. Холын өдрүүд сийрэг — зочин /c/demo дээр сул цаг олно.
 */
export function buildDemoAppointments(now = new Date()) {
  const today = clinicDateISO(now);
  const nowMin = clinicMinutesOfDay(now);
  const rng = makeRng(Number(today.replaceAll('-', '')));
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  const rows: Record<string, unknown>[] = [];
  let n = 0;

  for (let day = -PAST_DAYS; day <= FUTURE_DAYS; day++) {
    const date = shiftISO(today, day);
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const hours = DEMO_HOURS[DAY_KEYS[weekday]];
    if (!hours) continue;

    const fill = day <= 0 ? 0.8 : day <= 3 ? 0.65 : 0.4;
    const close = toMin(hours.close);

    for (const doctor of DEMO_DOCTORS) {
      const branchId = doctor.branches[0];
      let t = toMin(hours.open) + (rng() < 0.3 ? 30 : 0);

      while (true) {
        if (t >= LUNCH_START && t < LUNCH_END) t = LUNCH_END;
        const serviceId = pick(doctor.services);
        const service = DEMO_SERVICES.find(s => s.id === serviceId)!;
        const end = t + service.duration_minutes;
        if (end > close) break;
        // Үдийн цайн дээр давхцвал цайны дараа руу шилжүүлнэ
        if (t < LUNCH_START && end > LUNCH_START) {
          t = LUNCH_END;
          continue;
        }

        if (rng() < fill) {
          // Өнгөрсөн — дуусгасан/ирээгүй/цуцалсан. Одоо явагдаж буй,
          // ирээдүйнх — баталгаажсан, ойрын өдрүүдэд хүлээгдэж буй ч бий.
          let status: string;
          const r = rng();
          if (day < 0 || (day === 0 && end <= nowMin)) {
            status = r < 0.85 ? 'completed' : r < 0.93 ? 'no_show' : 'cancelled';
          } else if (day === 0 && t <= nowMin) {
            status = 'confirmed';
          } else if (day <= 3) {
            status = r < 0.3 ? 'pending' : r < 0.96 ? 'confirmed' : 'cancelled';
          } else {
            status = r < 0.95 ? 'confirmed' : 'cancelled';
          }

          const customer = pick(CUSTOMERS);
          n++;
          rows.push({
            id: `dcdcdcdc-0004-4000-8000-${String(n).padStart(12, '0')}`,
            clinic_id: DEMO_CLINIC_ID,
            doctor_id: doctor.id,
            branch_id: branchId,
            customer_name: customer.name,
            customer_phone: customer.phone,
            service: service.name,
            scheduled_at: clinicInstantFrom(date, toHHMM(t)).toISOString(),
            duration_minutes: service.duration_minutes,
            status,
            // Жинхэнэ код O үсэггүй (lib/booking/code.ts) тул давхцахгүй
            booking_code: `DEMO${String(n).padStart(3, '0')}`,
            notes: rng() < 0.1 ? pick(NOTES) : null,
          });
        }

        t = end + pick([0, 0, 15, 30]);
      }
    }
  }

  return rows;
}

/**
 * Демо захиалгуудыг өнөөдрөөр шинээр үүсгэнэ. Зочдын үлдээсэн захиалга ч
 * цэвэрлэгдэнэ. Хоёр нэвтрэлт зэрэг ажиллавал upsert тул id давхцаж унахгүй.
 */
export async function reseedDemoAppointments(db: SupabaseClient): Promise<number> {
  const rows = buildDemoAppointments();

  const { error: delError } = await db.from('appointments').delete().eq('clinic_id', DEMO_CLINIC_ID);
  if (delError) throw new Error(`appointments delete: ${delError.message}`);

  const { error } = await db.from('appointments').upsert(rows);
  if (error) throw new Error(`appointments: ${error.message}`);

  return rows.length;
}

/**
 * Демо захиалга хуучирсан бол шинэчилнэ. Хамгийн эртний seed захиалга
 * өнөөдрийн цонхноос (PAST_DAYS) өмнө байвал өөр өдөр үүссэн гэсэн үг.
 * Шинэчилсэн бол true.
 */
export async function ensureFreshDemoAppointments(db: SupabaseClient): Promise<boolean> {
  const { data, error } = await db
    .from('appointments')
    .select('scheduled_at')
    .eq('clinic_id', DEMO_CLINIC_ID)
    .like('booking_code', 'DEMO%')
    .order('scheduled_at')
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`appointments: ${error.message}`);

  const windowStart = clinicInstantFrom(shiftISO(clinicDateISO(new Date()), -PAST_DAYS), '00:00');
  if (data && new Date(data.scheduled_at as string) >= windowStart) return false;

  await reseedDemoAppointments(db);
  return true;
}
