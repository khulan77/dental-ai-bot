import { z } from 'zod';

/**
 * Нийтэд нээлттэй API route-уудын оролтыг шалгах schema-ууд.
 * Зорилго: хэт урт/хортой оролтоос сэргийлж, OpenAI зардал болон
 * өгөгдлийн сангийн эрсдэлийг хязгаарлах.
 */

// Монгол утасны дугаар: 8 оронтой (заримдаа +976 угтвартай)
const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?976)?\d{8}$/, 'Утасны дугаар буруу байна');

// Чат мессежийн нэг элемент
const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(2000),
  timestamp: z.string().default(() => new Date().toISOString()),
});

// POST /api/chat
export const chatSchema = z.object({
  slug: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1, 'Мессеж хоосон байна').max(1000, 'Мессеж хэт урт байна'),
  // Түүхийг хязгаарлана — хязгааргүй history = хязгааргүй OpenAI token
  history: z.array(messageSchema).max(30).optional().default([]),
});

// POST /api/book
export const bookSchema = z.object({
  clinicId: z.string().uuid('clinicId буруу байна'),
  doctorId: z.string().uuid().optional().nullable(),
  branchId: z.string().uuid().optional().nullable(),
  customerName: z.string().trim().min(1, 'Нэр шаардлагатай').max(100),
  customerPhone: phoneSchema,
  service: z.string().trim().min(1, 'Үйлчилгээ шаардлагатай').max(100),
  scheduledAt: z
    .string()
    .datetime({ offset: true })
    .refine((v) => new Date(v).getTime() > Date.now(), {
      message: 'Өнгөрсөн цагаар захиалах боломжгүй',
    }),
});

// createAppointment server action — эмнэлэг хяналтын самбараас шууд бүртгэнэ.
// Утсаар залгасан эсвэл шууд ирсэн үйлчлүүлэгч тул утас заавал биш,
// өнгөрсөн цагийг ч бүртгэж болно (жнь: дөнгөж үзүүлээд гарсан хүн).
export const adminBookSchema = z.object({
  doctorId: z.string().uuid('Эмчээ сонгоно уу'),
  branchId: z.string().uuid().nullable(),
  customerName: z.string().trim().min(1, 'Үйлчлүүлэгчийн нэрийг бичнэ үү').max(100),
  customerPhone: z.preprocess(
    v => (typeof v === 'string' ? v.replace(/[\s-]/g, '') : v),
    z.union([z.literal(''), phoneSchema])
  ),
  service: z.string().trim().min(1, 'Үйлчилгээгээ сонгоно уу').max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Огноо буруу байна'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Цаг буруу байна'),
  durationMinutes: z.number().int().min(5, 'Хугацаа хэт богино').max(480, 'Хугацаа хэт урт'),
  status: z.enum(['pending', 'confirmed']),
  notes: z.string().trim().max(500, 'Тэмдэглэл хэт урт байна').default(''),
});

// POST /api/my-bookings — үйлчлүүлэгч захиалгаа шалгах
// query нь утасны дугаар ЭСВЭЛ захиалгын код байна.
export const lookupBookingSchema = z.object({
  slug: z.string().trim().min(1).max(100),
  query: z.string().trim().min(4, 'Утас эсвэл кодоо оруулна уу').max(20),
});

/**
 * Нууц үгийн доод шаардлага — БҮРТГҮҮЛЭХ үед л шалгана.
 * (Нэвтрэхэд шалгахгүй: хуучин, сул нууц үгтэй эзэн нэвтэрч чадах ёстой.)
 *
 * АНХААР: энэ бол UX-ийн шалгуур. Жинхэнэ албадлагыг Supabase-ийн
 * Authentication → Policies хэсэгт (minimum length, required characters)
 * бас тохируулж өгөх хэрэгтэй — тэнд л сервер талд мөрдөгдөнө.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Нууц үг хамгийн багадаа 8 тэмдэгт байна')
  .max(72, 'Нууц үг хэт урт байна')
  .regex(/[a-zA-Z]/, 'Нууц үгэнд үсэг байх ёстой')
  .regex(/[0-9]/, 'Нууц үгэнд тоо байх ёстой');

// POST /api/login
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Имэйл буруу байна').max(255),
  // Нэвтрэхэд хүчийг нь шалгахгүй — зөвхөн хэмжээг хязгаарлана
  password: z.string().min(1, 'Нууц үг оруулна уу').max(72),
});

// Бүртгүүлэх формын нууц үг
export const signupPasswordSchema = passwordSchema;

// POST /api/setup-clinic
// userId-г ЗӨВХӨН сесс-ээс авна — оролтод байлгахгүй (өөр хүний нэрээр
// клиник үүсгэхээс сэргийлнэ).
export const setupClinicSchema = z.object({
  clinicName: z.string().trim().min(1, 'Клиникийн нэр шаардлагатай').max(100),
  slug: z.string().trim().min(1, 'URL шаардлагатай'),
});

/**
 * Клиникийн slug-ийн дүрэм — нэг эх сурвалж.
 * check-slug, setup-clinic, updateClinicSlug гурав ижил дүрэм хэрэглэнэ.
 */
const RESERVED_SLUGS = [
  'admin', 'api', 'dashboard', 'login', 'signup', 'test', 'c', 'auth', 'settings',
  // /c/demo — нүүр хуудасны демо эмнэлэг, хэрэглэгч эзэмшихээс хамгаална
  'demo',
];

export type SlugResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

export function validateSlug(raw: string): SlugResult {
  const slug = raw.toLowerCase().trim();

  if (slug.length < 3) return { ok: false, error: 'Хамгийн багадаа 3 тэмдэгт' };
  if (slug.length > 30) return { ok: false, error: 'Хамгийн ихдээ 30 тэмдэгт' };

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { ok: false, error: 'Зөвхөн англи жижиг үсэг, тоо, зураас (-) ашиглана' };
  }

  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { ok: false, error: 'Зураас эхэнд эсвэл төгсгөлд байж болохгүй' };
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return { ok: false, error: 'Энэ нэр ашиглах боломжгүй' };
  }

  return { ok: true, slug };
}

/**
 * Zod алдааг хэрэглэгчид ойлгомжтой нэг мөр болгох.
 */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Оролт буруу байна';
}
