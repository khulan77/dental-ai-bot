/**
 * Демо эмнэлгийг үүсгэх / шинэчлэх скрипт.
 *
 *   bun run demo:seed
 *
 * Юу үүсгэдэг вэ:
 *   1. Демо нэвтрэх бүртгэл (lib/demo.ts дахь имэйл, нууц үгээр)
 *   2. Демо эмнэлэг — тухайн бүртгэл эзэмшинэ, тул /dashboard-д харагдана
 *   3. 2 салбар, 7 эмч (Төв 3, Хан-Уул 4), эмч↔салбар холбоос, 7 үйлчилгээ
 *   4. Өнөөдрийг тойрсон захиалгууд — хуанли, статистик хоосон
 *      харагдахгүйн тулд. Демо нэвтрэлт өдөрт нэг удаа автоматаар
 *      шинэчилдэг (lib/demo-data.ts).
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
import {
  DEMO_SERVICES as SERVICES,
  DEMO_DOCTORS as DOCTORS,
  DEMO_BRANCHES as BRANCHES,
  DEMO_HOURS,
  reseedDemoAppointments,
} from '../lib/demo-data';

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
      business_hours: DEMO_HOURS,
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

  // Эмч↔салбар холбоосыг upsert хуучныг нь устгадаггүй — эмчийг салбараас
  // хассан бол хуучин холбоос үлдэхгүйн тулд эхлээд цэвэрлэнэ
  const { error: linkError } = await db
    .from('doctor_branches')
    .delete()
    .in('doctor_id', DOCTORS.map(d => d.id));
  if (linkError) throw new Error(`doctor_branches delete: ${linkError.message}`);

  for (const [table, rows] of steps) {
    const { error } = await db.from(table).upsert(rows as never);
    if (error) throw new Error(`${table}: ${error.message}`);
    console.log(`${table.padEnd(14)}OK`);
  }

  // Захиалгууд — өнөөдрөөс тоологддог тул бүр удаа шинээр
  const count = await reseedDemoAppointments(db);
  console.log(`appointments  OK  (${count})`);

  console.log(`\nҮйлчлүүлэгчийн хуудас : /c/${DEMO_SLUG}`);
  console.log(`Хяналтын самбар      : ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main().catch(err => {
  console.error('Демо seed амжилтгүй:', err.message ?? err);
  process.exit(1);
});
