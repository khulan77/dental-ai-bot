import { CalendarDays, Ticket } from 'lucide-react';

/**
 * Footer-ийн яг дээрх гүн өнгөт зурвас.
 * Шинэ хүн цаг авна, цаг авсан хүн буцаж ирээд төлөвөө шалгана — хоёулаа нэг дор.
 */
export default function CtaBand({
  slug,
  onBookClick,
}: {
  slug: string;
  onBookClick: () => void;
}) {
  return (
    <section className="site-band px-5 sm:px-8 py-16 sm:py-20">
      <div className="site-band-inner site-container">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
          <div className="flex-1">
            <h2 className="text-[26px] sm:text-[34px] font-bold leading-[1.15] tracking-[-0.02em] mb-3">
              Цагаа хэдхэн алхмаар захиалаарай
            </h2>
            <p className="text-[15px] leading-relaxed text-white/75 max-w-lg">
              Эмч, үйлчилгээ, цагаа сонгоод л болоо. Захиалсны дараа кодоо эсвэл утасны
              дугаараа оруулж баталгаажсан эсэхийг шалгана.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button onClick={onBookClick} className="site-btn-invert px-6 py-3 text-[15px]">
              <CalendarDays className="w-4 h-4" />
              Цаг захиалах
            </button>
            <a href={`/c/${slug}/booking`} className="site-btn-ghost-invert px-6 py-3 text-[15px]">
              <Ticket className="w-4 h-4" />
              Захиалгаа шалгах
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
