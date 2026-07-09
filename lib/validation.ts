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

/**
 * Zod алдааг хэрэглэгчид ойлгомжтой нэг мөр болгох.
 */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Оролт буруу байна';
}
