/**
 * Демо эмнэлэг — нүүр хуудасны "Демо" хэсэг үүн рүү заана.
 *
 * Өгөгдлийг supabase/demo-clinic.sql (эсвэл `bun run demo:seed`) үүсгэнэ.
 * Демо бүртгэлийн нэвтрэх мэдээлэл нь НУУЦ БИШ — зочин бүр энэ дансаар
 * хяналтын самбарыг үзэх зорилготой. Тиймээс кодод шууд бичсэн.
 *
 * Хамгаалалт нь нууц үг биш, requireOwnedClinicId() доторх шалгалт:
 * демо эмнэлгийн тохиргоог хэн ч өөрчилж чадахгүй (lib/db/supabase-server.ts).
 */
export const DEMO_CLINIC_ID = 'dcdcdcdc-0000-4000-8000-000000000001';
export const DEMO_SLUG = 'demo';
export const DEMO_EMAIL = 'demo@demo.mn';
export const DEMO_PASSWORD = 'demo1234';

/** Энэ эмнэлэг демо мөн үү — тохиргоо өөрчлөхийг хаахад ашиглана */
export function isDemoClinic(clinicId: string | null | undefined): boolean {
  return clinicId === DEMO_CLINIC_ID;
}
