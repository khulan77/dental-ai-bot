import { randomInt } from 'crypto';
import { createAdminClient } from '@/lib/db/supabase';

// Андуурч уншихаас сэргийлж 0/O, 1/I/L-ийг хассан
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

function randomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

/**
 * Давхцахгүй захиалгын код үүсгэнэ.
 *
 * booking_code баганад unique index байгаа тул онолын хувьд давхцвал
 * insert алдаа өгнө — тиймээс эхлээд шалгаад хэдэн удаа дахин оролдоно.
 * Бүгд бүтэлгүйтвэл null буцаана: код байхгүй ч захиалга үүсэх ёстой
 * (үйлчлүүлэгч утсаараа шалгаж чадна).
 */
export async function generateBookingCode(): Promise<string | null> {
  const supabase = createAdminClient();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { data } = await supabase
      .from('appointments')
      .select('id')
      .eq('booking_code', code)
      .maybeSingle();

    if (!data) return code;
  }

  console.warn('Захиалгын код үүсгэж чадсангүй — кодгүй үргэлжлүүлнэ');
  return null;
}
