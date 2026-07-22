'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';

type Question = {
  q: string;
  preview: string;
};

type Category = {
  title: string;
  questions: Question[];
};

const CATEGORIES: Category[] = [
  {
    title: 'Өдөр тутмын арчилгаа',
    questions: [
      { q: 'Өдөрт хэдэн удаа шүдээ угаах хэрэгтэй вэ?', preview: 'Зөв арчилгааны хуваарь' },
      { q: 'Ямар гэдэс хэрэглэх нь зөв вэ?', preview: 'Зөвлөмжит ариутгагч' },
      { q: 'Шүдний утас хэрэглэх шаардлагатай юу?', preview: 'Хоорондын цэвэрлэгээ' },
      { q: 'Шүдний ойрын эрүүл байдлыг яаж хадгалах вэ?', preview: 'Буй эрхтний арчилгаа' },
    ],
  },
  {
    title: 'Шүдний цайруулалт',
    questions: [
      { q: 'Шүдийг цагаан болгох аргууд юу вэ?', preview: 'Whitening арга барил' },
      { q: 'Whitening procedure хэр удаан үргэлжлэх вэ?', preview: 'Үргэлжлэх хугацаа' },
      { q: 'Гэрийн нөхцөлд цайруулж болох уу?', preview: 'DIY арга зам' },
      { q: 'Цайруулалтын дараа ямар хоол идэх ёсгүй вэ?', preview: 'Хоолны зааварчилгаа' },
    ],
  },
  {
    title: 'Шүдний өвчин тэмдэг',
    questions: [
      { q: 'Шүд өвдвөл яах хэрэгтэй вэ?', preview: 'Яаралтай арга хэмжээ' },
      { q: 'Буй эрхтэн цус гарвал ямар шалтгаантай вэ?', preview: 'Буй эрхтний өвчин' },
      { q: 'Шүдний мэдрэмтгий байдлыг яаж арилгах вэ?', preview: 'Sensitivity шийдэл' },
      { q: 'Шүдний хорхой гарвал яаж эмчлэх вэ?', preview: 'Хорхойн эмчилгээ' },
    ],
  },
  {
    title: 'Хүүхдийн шүдний эрүүл мэнд',
    questions: [
      { q: 'Хүүхдийн шүдэнд фтор хэрэгтэй юу?', preview: 'Фторын ач тус' },
      { q: 'Хэдэн наснаас эмчид үзүүлэх хэрэгтэй вэ?', preview: 'Эхний эмчийн үзлэг' },
      { q: 'Хүүхдийн сүүн шүдийг яаж арчлах вэ?', preview: 'Сүүн шүдний арчилгаа' },
      { q: 'Шүд солигдох насны онцлог юу вэ?', preview: 'Шилжилтийн үе' },
    ],
  },
  {
    title: 'Шүдний засал эмчилгээ',
    questions: [
      { q: 'Суулгамал шүд ба бэхэлгээний ялгаа юу вэ?', preview: 'Implant vs Bridge' },
      { q: 'Шүд авахуулсны дараа яаж арчлах вэ?', preview: 'Extraction дараах арчилгаа' },
      { q: 'Ломбо хийлгэсний дараа ямар мэдрэмж байх вэ?', preview: 'Filling дараах мэдрэмж' },
      { q: 'Нүдэн засал (braces) хэр удаан зүүх вэ?', preview: 'Orthodontic treatment' },
    ],
  },
  {
    title: 'Инээмсэглэлийн эрүүл мэнд',
    questions: [
      { q: 'Хоол идсэний дараа шүдээ угаах шаардлагатай юу?', preview: 'Хооллолтын дараах арчилгаа' },
      { q: 'Элсэн чихэр шүдэнд яаж нөлөөлдөг вэ?', preview: 'Чихэрийн хор нөлөө' },
      { q: 'Жирэмсэн үед шүдний эмчид үзүүлж болох уу?', preview: 'Жирэмсний үеийн арчилгаа' },
      { q: 'Хэдэн сард нэг удаа шүдний эмчид үзүүлэх хэрэгтэй вэ?', preview: 'Урьдчилан сэргийлэх үзлэг' },
    ],
  },
];

export default function DentalTips({
  onAskQuestion,
}: {
  onAskQuestion: (question: string) => void;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="site-section site-section-soft">
      <div className="site-container">

        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="site-eyebrow">AI зөвлөгөө</span>
          <h2 className="site-h2 mb-4">Шүдний тухай түгээмэл асуултууд</h2>
          <p className="site-lead">
            Асуултаа сонгоод AI ассистентээс шууд хариулт аваарай.
          </p>
        </div>

        {/* items-start — эс бөгөөс нэг картыг нээхэд хажуугийнх нь сунаж хоосон зай үүснэ */}
        <div className="grid sm:grid-cols-2 gap-4 items-start">
          {CATEGORIES.map((cat, idx) => (
            <div key={cat.title} className="site-card overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--site-bg-soft)] transition-colors"
              >
                <span className="site-h3">{cat.title}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--site-muted)] transition-transform duration-200 ${openIdx === idx ? 'rotate-180' : ''}`}
                />
              </button>

              {openIdx === idx && (
                <div className="border-t border-[var(--site-line)]">
                  {cat.questions.map(item => (
                    <button
                      key={item.q}
                      onClick={() => onAskQuestion(item.q)}
                      className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left group border-b border-[var(--site-line)] last:border-b-0 hover:bg-[var(--site-bg-soft)] transition-colors"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-[var(--site-ink)] group-hover:text-[var(--site-accent)] transition-colors leading-snug">
                          {item.q}
                        </p>
                        <p className="text-[12px] text-[var(--site-muted)] mt-0.5">{item.preview}</p>
                      </div>
                      <MessageCircle className="w-4 h-4 shrink-0 text-[var(--site-muted)] group-hover:text-[var(--site-accent)] transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
