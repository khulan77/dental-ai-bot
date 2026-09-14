'use client';

import { useState } from 'react';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

type Category = {
  title: string;
  questions: string[];
};

const CATEGORIES: Category[] = [
  {
    title: 'Өдөр тутмын арчилгаа',
    questions: [
      'Өдөрт хэдэн удаа шүдээ угаах хэрэгтэй вэ?',
      'Ямар шүдний оо сонгох нь зөв вэ?',
      'Шүдний утас хэрэглэх шаардлагатай юу?',
      'Буйлаа эрүүл байлгахын тулд юу хийх вэ?',
    ],
  },
  {
    title: 'Цайруулалт',
    questions: [
      'Шүд цайруулах ямар аргууд байдаг вэ?',
      'Цайруулалт хэр удаан үргэлжлэх вэ?',
      'Гэртээ шүдээ цайруулж болох уу?',
      'Цайруулалтын дараа юу идэж болохгүй вэ?',
    ],
  },
  {
    title: 'Өвдөлт, шинж тэмдэг',
    questions: [
      'Шүд өвдвөл яах хэрэгтэй вэ?',
      'Буйлнаас цус гарах нь юуны шинж вэ?',
      'Шүд мэдрэг болсныг яаж арилгах вэ?',
      'Шүд цоорвол яаж эмчлэх вэ?',
    ],
  },
  {
    title: 'Хүүхдийн шүд',
    questions: [
      'Хүүхдийн шүдэнд фтор хэрэгтэй юу?',
      'Хүүхдийг хэдэн наснаас эмчид үзүүлэх вэ?',
      'Хүүхдийн сүүн шүдийг яаж арчлах вэ?',
      'Шүд солигдох үед юуг анхаарах вэ?',
    ],
  },
  {
    title: 'Засал, эмчилгээ',
    questions: [
      'Имплант ба гүүр шүдний ялгаа юу вэ?',
      'Шүд авахуулсны дараа яаж арчлах вэ?',
      'Ломбо хийлгэсний дараа ямар мэдрэмж төрөх вэ?',
      'Гажиг заслын аппарат хэр удаан зүүх вэ?',
    ],
  },
  {
    title: 'Хооллолт, дадал',
    questions: [
      'Хоол идсэний дараа шүдээ угаах хэрэгтэй юу?',
      'Чихэр шүдэнд яаж нөлөөлдөг вэ?',
      'Жирэмсэн үедээ шүдний эмчид үзүүлж болох уу?',
      'Хэдэн сард нэг удаа үзлэгт орох вэ?',
    ],
  },
];

export default function DentalTips({
  onAskQuestion,
  onOpenChat,
}: {
  onAskQuestion: (question: string) => void;
  onOpenChat: () => void;
}) {
  const [active, setActive] = useState(0);
  const category = CATEGORIES[active];

  return (
    <section id="faq" className="site-section site-section-soft">
      <div className="site-container max-w-3xl">

        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="site-eyebrow">AI зөвлөгөө</span>
          <h2 className="site-h2 mb-4">Түгээмэл асуултууд</h2>
          <p className="site-lead">
            Асуулт дээр дарахад AI ассистент шууд хариулна.
          </p>
        </div>

        {/* Ангилал — утсан дээр хажуу тийш гүйлгэнэ */}
        <div
          role="tablist"
          aria-label="Асуултын ангилал"
          className="flex sm:flex-wrap sm:justify-center gap-2 mb-5 -mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto [scrollbar-width:none]"
        >
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.title}
              role="tab"
              aria-selected={active === idx}
              onClick={() => setActive(idx)}
              className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-[var(--site-r-pill)] text-[13px] font-medium border transition-colors ${
                active === idx
                  ? 'bg-[var(--site-ink)] text-white border-[var(--site-ink)]'
                  : 'bg-[var(--site-bg)] text-[var(--site-ink-soft)] border-[var(--site-line)] hover:border-[#CBD5E1]'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="site-card overflow-hidden">
          {category.questions.map(q => (
            <button
              key={q}
              onClick={() => onAskQuestion(q)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left group border-b border-[var(--site-line)] last:border-b-0 hover:bg-[var(--site-bg-soft)] transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0 text-[var(--site-muted)] group-hover:text-[var(--site-accent)] transition-colors" />
              <span className="flex-1 text-[14px] font-medium text-[var(--site-ink)] group-hover:text-[var(--site-accent)] transition-colors leading-snug">
                {q}
              </span>
              <ArrowRight className="w-4 h-4 shrink-0 text-[var(--site-muted)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onOpenChat}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--site-accent)] hover:underline underline-offset-4"
          >
            <Sparkles className="w-4 h-4" />
            Өөр асуулт байна уу? AI ассистентаас асуух
          </button>
        </div>

      </div>
    </section>
  );
}
