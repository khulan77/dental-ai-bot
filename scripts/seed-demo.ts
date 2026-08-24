/**
 * Демо эмнэлгийг үүсгэх / шинэчлэх скрипт.
 *
 *   bun run demo:seed
 *
 * Юу үүсгэдэг вэ:
 *   1. Демо нэвтрэх бүртгэл (lib/demo.ts дахь имэйл, нууц үгээр)
 *   2. Демо эмнэлэг — тухайн бүртгэл эзэмшинэ, тул /dashboard-д харагдана
 *   3. 2 салбар, 3 эмч, эмч↔салбар холбоос, 6 үйлчилгээ
 *   4. Өнөөдрийг тойрсон захиалгууд — хяналтын самбарын статистик хоосон
 *      харагдахгүйн тулд. Эдгээр нь өнөөдрөөс тоологддог тул хааяа
 *      дахин ажиллуулж шинэчилнэ.
 *
 * Дахин ажиллуулж болно: id-нууд тогтмол тул давхардахгүй, зөвхөн шинэчилнэ.
 * Демо захиалгууд бүр удаа устгагдаад шинээр үүснэ (зочдын үлдээсэн
 * захиалга ч цэвэрлэгдэнэ).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import {
  DEMO_CLINIC_ID,
  DEMO_SLUG,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from '../lib/demo';
import { CLINIC_TIMEZONE } from '../lib/booking/timezone';

// .env.local-ыг гараар уншина — скрипт Next.js-ээс гадуур ажиллана
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY тохируулаагүй байна');
}

const db = createClient(url, key, { auth: { persistSession: false } });

const S = (n: number) => `dcdcdcdc-0001-4000-8000-00000000000${n}`;
const D = (n: number) => `dcdcdcdc-0002-4000-8000-00000000000${n}`;
const B = (n: number) => `dcdcdcdc-0003-4000-8000-00000000000${n}`;

const SERVICES = [
  { id: S(1), name: 'Үзлэг, оношилгоо', price_mnt: 20000, duration_minutes: 30 },
  { id: S(2), name: 'Шүдний цэвэрлэгээ', price_mnt: 80000, duration_minutes: 45 },
  { id: S(3), name: 'Ломбо', price_mnt: 120000, duration_minutes: 60 },
  { id: S(4), name: 'Шүд цайруулах', price_mnt: 350000, duration_minutes: 60, discount_percent: 20 },
  { id: S(5), name: 'Суваг эмчилгээ', price_mnt: 250000, duration_minutes: 90 },
  { id: S(6), name: 'Гажиг заслын зөвлөгөө', price_mnt: 30000, duration_minutes: 30 },
];

// Эмч бүр өөрийн үздэг үйлчилгээтэй — захиалга үүсгэхэд ч үүнийг баримтална
const DOCTORS = [
  {
    id: D(1),
    name: 'Б. Энхжаргал',
    specialty: 'Ерөнхий эмчилгээ',
    bio: '12 жил шүдний ерөнхий эмчилгээ, цэвэрлэгээ, ломбоны чиглэлээр ажиллаж байна.',
    services: [S(1), S(2), S(3)],
    branches: [B(1), B(2)],
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
    id: D(3),
    name: 'С. Оюунчимэг',
    specialty: 'Гоо сайхан, гажиг засал',
    bio: 'Шүд цайруулах, гажиг заслын зөвлөгөөний чиглэлээр 8 жил ажилласан туршлагатай.',
    services: [S(1), S(4), S(6)],
    branches: [B(2)],
  },
];

const BRANCHES = [
  { id: B(1), name: 'Төв салбар', address: 'СБД, 1-р хороо, Энх тайвны өргөн чөлөө 15', phone: '7000-0000' },
  { id: B(2), name: 'Хан-Уул салбар', address: 'ХУД, 4-р хороо, Чингисийн өргөн чөлөө 42', phone: '7000-0001' },
];

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
];

/** UB-ийн өнөөдрийн огноо, "YYYY-MM-DD" */
function clinicToday(): [number, number, number] {
  const iso = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m, d];
}

/** UB-ийн тухайн өдрийн тухайн цагийг UTC instant болгоно (UB = UTC+8, DST-гүй) */
function clinicInstant(daysFromToday: number, hour: number, minute = 0): Date {
  const [y, m, d] = clinicToday();
  return new Date(Date.UTC(y, m - 1, d + daysFromToday, hour - 8, minute));
}

/** Тухайн өдөр UB-д гарагийн хэд дэх өдөр вэ (0 = Ням) */
function clinicWeekday(daysFromToday: number): number {
  const [y, m, d] = clinicToday();
  return new Date(Date.UTC(y, m - 1, d + daysFromToday)).getUTCDay();
}

/** Тогтмол үр — дахин ажиллуулахад ижил захиалга гарна */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildAppointments() {
  const rng = makeRng(20260824);
  const rows: Record<string, unknown>[] = [];
  let n = 0;

  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  // -14 хоногоос +7 хоног. Ням гарагт эмнэлэг амардаг тул алгасна.
  for (let day = -14; day <= 7; day++) {
    if (clinicWeekday(day) === 0) continue;

    const perDay = day === 0 ? 4 : 1 + Math.floor(rng() * 3);

    for (let i = 0; i < perDay; i++) {
      const doctor = pick(DOCTORS);
      const serviceId = pick(doctor.services);
      const service = SERVICES.find(s => s.id === serviceId)!;
      const customer = pick(CUSTOMERS);
      const hour = 9 + Math.floor(rng() * 9); // 09:00 - 17:00
      const minute = rng() < 0.5 ? 0 : 30;

      // Өнгөрсөн — дуусгасан/ирээгүй/цуцалсан. Ирээдүй — хүлээгдэж буй/баталгаажсан.
      let status: string;
      if (day < 0) {
        const r = rng();
        status = r < 0.82 ? 'completed' : r < 0.92 ? 'no_show' : 'cancelled';
      } else if (day === 0) {
        status = i === 0 ? 'completed' : i === 1 ? 'confirmed' : 'pending';
      } else {
        status = rng() < 0.55 ? 'confirmed' : 'pending';
      }

      rows.push({
        id: `dcdcdcdc-0004-4000-8000-${String(++n).padStart(12, '0')}`,
        clinic_id: DEMO_CLINIC_ID,
        doctor_id: doctor.id,
        branch_id: pick(doctor.branches),
        customer_name: customer.name,
        customer_phone: customer.phone,
        service: service.name,
        scheduled_at: clinicInstant(day, hour, minute).toISOString(),
        duration_minutes: service.duration_minutes,
        status,
        booking_code: `DEMO${String(n).padStart(2, '0')}`,
      });
    }
  }

  return rows;
}

async function ensureDemoUser(): Promise<string> {
  const { data: list, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;

  const existing = list.users.find(u => u.email === DEMO_EMAIL);
  if (existing) {
    // Нууц үг lib/demo.ts-тэй үргэлж таарч байх ёстой
    const { error } = await db.auth.admin.updateUserById(existing.id, {
      password: DEMO_PASSWORD,
    });
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await db.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { demo: true },
  });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  const ownerId = await ensureDemoUser();
  console.log(`demo user     OK  (${DEMO_EMAIL})`);

  const steps: [string, unknown][] = [
    ['clinics', {
      id: DEMO_CLINIC_ID,
      owner_id: ownerId,
      name: 'Дэмо шүдний эмнэлэг',
      slug: DEMO_SLUG,
      about:
        'Энэ бол системийг туршиж үзэх жишээ эмнэлэг. Эмч, үйлчилгээ, цаг бүгд бодитоор ажиллана — та чат бичиж, цаг захиалж үзэж болно.',
      address: 'Улаанбаатар, Сүхбаатар дүүрэг, 1-р хороо, Энх тайвны өргөн чөлөө 15',
      owner_phone: '7000-0000',
      // Имэйл хоосон — демо захиалга хэн рүү ч мэдэгдэл явуулахгүй
      owner_email: null,
      bot_personality:
        'Найрсаг, тодорхой, товч. Үйлчлүүлэгчийг цаг захиалах хүртэл эелдэгээр дагуулна.',
      is_active: true,
      business_hours: {
        mon: { open: '09:00', close: '19:00' },
        tue: { open: '09:00', close: '19:00' },
        wed: { open: '09:00', close: '19:00' },
        thu: { open: '09:00', close: '19:00' },
        fri: { open: '09:00', close: '19:00' },
        sat: { open: '10:00', close: '16:00' },
        sun: null,
      },
      services: SERVICES,
    }],
    ['branches', BRANCHES.map((b, i) => ({
      id: b.id,
      clinic_id: DEMO_CLINIC_ID,
      name: b.name,
      address: b.address,
      phone: b.phone,
      display_order: i,
      is_active: true,
    }))],
    ['doctors', DOCTORS.map((d, i) => ({
      id: d.id,
      clinic_id: DEMO_CLINIC_ID,
      name: d.name,
      specialty: d.specialty,
      bio: d.bio,
      email: null,
      service_ids: d.services,
      display_order: i,
      is_active: true,
    }))],
    ['doctor_branches', DOCTORS.flatMap(d =>
      d.branches.map(branchId => ({ doctor_id: d.id, branch_id: branchId }))
    )],
  ];

  for (const [table, rows] of steps) {
    const { error } = await db.from(table).upsert(rows as never);
    if (error) throw new Error(`${table}: ${error.message}`);
    console.log(`${table.padEnd(14)}OK`);
  }

  // Захиалгууд — өнөөдрөөс тоологддог тул бүр удаа шинээр
  const { error: delError } = await db
    .from('appointments')
    .delete()
    .eq('clinic_id', DEMO_CLINIC_ID);
  if (delError) throw new Error(`appointments delete: ${delError.message}`);

  const appointments = buildAppointments();
  const { error: insError } = await db.from('appointments').insert(appointments);
  if (insError) throw new Error(`appointments: ${insError.message}`);
  console.log(`appointments  OK  (${appointments.length})`);

  console.log(`\nҮйлчлүүлэгчийн хуудас : /c/${DEMO_SLUG}`);
  console.log(`Хяналтын самбар      : ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main().catch(err => {
  console.error('Демо seed амжилтгүй:', err.message ?? err);
  process.exit(1);
});
