'use client';

import type { Service } from './types';
import { effectivePrice, isDiscountActive } from '@/lib/booking/pricing';
import { Clock, ArrowRight, Sparkles, Smile, Stethoscope, Syringe, Gem, Activity } from 'lucide-react';

// Emoji биш — бусад дүрстэй нэг стильд байхын тулд lucide
const SERVICE_ICONS = [Stethoscope, Sparkles, Gem, Smile, Syringe, Activity];

export default function Services({
  services,
  onServiceClick,
}: {
  services: Service[];
  onServiceClick: (service: Service) => void;
}) {
  if (services.length === 0) return null;

  return (
    <section className="site-section site-section-soft">
      <div className="site-container">

        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="site-eyebrow">Үйлчилгээ</span>
          <h2 className="site-h2 mb-4">Манай үйлчилгээнүүд</h2>
          <p className="site-lead">
            Орчин үеийн тоног төхөөрөмж, мэргэшсэн эмч нарын гараар хийгдэх бүх төрлийн эмчилгээ.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, idx) => {
            const Icon = SERVICE_ICONS[idx % SERVICE_ICONS.length];
            const onSale = isDiscountActive(service);
            return (
              <button
                key={service.id}
                onClick={() => onServiceClick(service)}
                className="site-card site-card-hover text-left p-6 flex flex-col relative"
              >
                {onSale && (
                  <span className="site-sale-badge absolute top-4 right-4">
                    -{service.discount_percent}%
                  </span>
                )}

                <div className="flex items-start justify-between mb-5">
                  <div className="site-icon-tile">
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  {!onSale && (
                    <span className="site-pill">
                      <Clock className="w-3 h-3" />
                      {service.duration_minutes} мин
                    </span>
                  )}
                </div>

                <h3 className="site-h3 mb-6">{service.name}</h3>

                <div className="flex items-end justify-between mt-auto pt-5 border-t border-[var(--site-line)]">
                  <div>
                    <div className="text-[12px] text-[var(--site-muted)] mb-1">
                      {onSale ? 'Хямдралтай үнэ' : 'Үнэ'}
                    </div>
                    {onSale ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-[18px] font-semibold text-[var(--site-sale)]">
                          ₮{effectivePrice(service).toLocaleString()}
                        </span>
                        <span className="text-[13px] text-[var(--site-muted)] line-through">
                          ₮{service.price_mnt.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[18px] font-semibold text-[var(--site-ink)]">
                        ₮{service.price_mnt.toLocaleString()}
                      </div>
                    )}
                    {onSale && service.discount_until && (
                      <div className="text-[11px] text-[var(--site-sale)] mt-1 font-medium">
                        {service.discount_until} хүртэл
                      </div>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--site-accent)]">
                    Цаг захиалах
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
