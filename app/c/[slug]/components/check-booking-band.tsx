import { ArrowRight, Hash, Phone, Ticket } from 'lucide-react';

/**
 * "Захиалгаа шалгах" зурвас — footer-ийн яг дээр.
 * Цаг авсан хүн буцаж ирээд төлөвөө хардаг тул нүүрэн дээр тод байрлана.
 */
export default function CheckBookingBand({ slug }: { slug: string }) {
  return (
    <section className="site-band px-5 sm:px-8 py-14 sm:py-16">
      <div className="site-band-inner site-container">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-[var(--site-r-pill)] bg-white/12 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/80 mb-4">
              <Ticket className="w-3.5 h-3.5" />
              Аль хэдийн цаг авсан уу?
            </span>

            <h2 className="text-[26px] sm:text-[32px] font-bold leading-[1.15] tracking-[-0.02em] mb-3">
              Захиалгаа хормын дотор шалгаарай
            </h2>

            <p className="text-[15px] leading-relaxed text-white/75 max-w-lg">
              Цаг тань баталгаажсан эсэх, эмч, салбар, товлосон цагаа нэг дороос хараарай.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="inline-flex items-center gap-1.5 rounded-[var(--site-r-pill)] bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/80">
                <Phone className="w-3 h-3" /> Утасны дугаараар
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-[var(--site-r-pill)] bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/80">
                <Hash className="w-3 h-3" /> Захиалгын кодоор
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <a href={`/c/${slug}/booking`} className="site-btn-invert w-full sm:w-auto">
              Захиалгаа шалгах
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
