import { clinicDateISO } from './timezone';

/**
 * Хямдралтай үнэ бодох нэгдсэн логик.
 *
 * Хямдралыг хувиар (discount_percent) тохируулна. discount_until нь
 * "YYYY-MM-DD" — тухайн өдрийг ОРУУЛААД дуустал хүчинтэй. Хоосон бол
 * гараар унтраах хүртэл үргэлжилнэ.
 *
 * Огноог эмнэлгийн цагийн бүсээр харьцуулна — серверийн бүсээр биш.
 */
export type DiscountableService = {
  price_mnt: number;
  discount_percent?: number | null;
  discount_until?: string | null;
};

export function isDiscountActive(service: DiscountableService): boolean {
  const percent = service.discount_percent ?? 0;
  if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) return false;

  const until = service.discount_until;
  if (!until) return true;

  return clinicDateISO(new Date()) <= until;
}

/** Хямдрал идэвхтэй бол хямдарсан үнэ, эсрэг тохиолдолд үндсэн үнэ. */
export function effectivePrice(service: DiscountableService): number {
  if (!isDiscountActive(service)) return service.price_mnt;
  const discounted = service.price_mnt * (1 - (service.discount_percent ?? 0) / 100);
  // 100₮ хүртэл дугуйруулна — "199,999₮" гэх мэт сондгой тоо гаргахгүй
  return Math.round(discounted / 100) * 100;
}

/** Хэмнэгдэх дүн (идэвхгүй бол 0). */
export function savedAmount(service: DiscountableService): number {
  return service.price_mnt - effectivePrice(service);
}
