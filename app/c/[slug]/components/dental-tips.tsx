'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';

type Question = {
  q: string;
  preview: string;
};

type Category = {
  icon: string;
  title: string;
  color: string;
  bg: string;
  border: string;
  questions: Question[];
};

const CATEGORIES: Category[] = [
  {
    icon: '🦷',
    title: 'Өдөр тутмын арчилгаа',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    questions: [
      { q: 'Өдөрт хэдэн удаа шүдээ угаах хэрэгтэй вэ?', preview: 'Зөв арчилгааны хуваарь' },
      { q: 'Ямар гэдэс хэрэглэх нь зөв вэ?', preview: 'Зөвлөмжит ариутгагч' },
      { q: 'Шүдний утас хэрэглэх шаардлагатай юу?', preview: 'Хоорондын цэвэрлэгээ' },
      { q: 'Шүдний ойрын эрүүл байдлыг яаж хадгалах вэ?', preview: 'Буй эрхтний арчилгаа' },
    ],
  },
  {
    icon: '✨',
    title: 'Шүдний цайруулалт',
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    questions: [
      { q: 'Шүдийг цагаан болгох аргууд юу вэ?', preview: 'Whitening арга барил' },
      { q: 'Whitening procedure хэр удаан үргэлжлэх вэ?', preview: 'Үргэлжлэх хугацаа' },
      { q: 'Гэрийн нөхцөлд цайруулж болох уу?', preview: 'DIY арга зам' },
      { q: 'Цайруулалтын дараа ямар хоол идэх ёсгүй вэ?', preview: 'Хоолны зааварчилгаа' },
    ],
  },
  {
    icon: '🩺',
    title: 'Шүдний өвчин тэмдэг',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    questions: [
      { q: 'Шүд өвдвөл яах хэрэгтэй вэ?', preview: 'Яаралтай арга хэмжээ' },
      { q: 'Буй эрхтэн цус гарвал ямар шалтгаантай вэ?', preview: 'Буй эрхтний өвчин' },
      { q: 'Шүдний мэдрэмтгий байдлыг яаж арилгах вэ?', preview: 'Sensitivity шийдэл' },
      { q: 'Шүдний хорхой гарвал яаж эмчлэх вэ?', preview: 'Хорхойн эмчилгээ' },
    ],
  },
  {
    icon: '👶',
    title: 'Хүүхдийн шүдний эрүүл мэнд',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    questions: [
      { q: 'Хүүхдийн шүдэнд фтор хэрэгтэй юу?', preview: 'Фторын ач тус' },
      { q: 'Хэдэн наснаас эмчид үзүүлэх хэрэгтэй вэ?', preview: 'Эхний эмчийн үзлэг' },
      { q: 'Хүүхдийн сүүн шүдийг яаж арчлах вэ?', preview: 'Сүүн шүдний арчилгаа' },
      { q: 'Шүд солигдох насны онцлог юу вэ?', preview: 'Шилжилтийн үе' },
    ],
  },
  {
    icon: '🔧',
    title: 'Шүдний засал эмчилгээ',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    questions: [
      { q: 'Суулгамал шүд ба бэхэлгээний ялгаа юу вэ?', preview: 'Implant vs Bridge' },
      { q: 'Шүд авахуулсны дараа яаж арчлах вэ?', preview: 'Extraction дараах арчилгаа' },
      { q: 'Ломбо хийлгэсний дараа ямар мэдрэмж байх вэ?', preview: 'Filling дараах мэдрэмж' },
      { q: 'Нүдэн засал (braces) хэр удаан зүүх вэ?', preview: 'Orthodontic treatment' },
    ],
  },
  {
    icon: '😁',
    title: 'Инээмсэглэлийн эрүүл мэнд',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
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
    <section
      className="bg-white py-24 sm:py-32 px-5 sm:px-8"
      style={{ fontFamily: 'var(--font-jakarta, var(--font-sans))' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="inline-block text-[12px] font-bold text-blue-600 tracking-[0.2em] uppercase mb-4">
            — AI зөвлөгөө —
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Шүдний тухай{' '}
            <span className="italic font-light text-blue-600" style={{ fontFamily: 'var(--font-serif)' }}>
              асуулт
            </span>
          </h2>
          <p className="text-[15px] text-slate-500 leading-relaxed">
            Асуултаа сонгоод AI-д асуугаарай — шууд хариулт авна
          </p>
        </div>

        {/* Category accordion grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.title}
              className={`rounded-2xl border ${cat.border} overflow-hidden transition-all duration-200`}
            >
              {/* Category header */}
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className={`w-full flex items-center justify-between px-5 py-4 ${cat.bg} hover:brightness-95 transition-all`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className={`text-[14px] font-bold ${cat.color}`}>{cat.title}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${cat.color} transition-transform duration-200 ${openIdx === idx ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Questions list */}
              {openIdx === idx && (
                <div className="divide-y divide-slate-50">
                  {cat.questions.map(item => (
                    <button
                      key={item.q}
                      onClick={() => onAskQuestion(item.q)}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-slate-50 text-left group transition-colors"
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-slate-800 group-hover:text-blue-700 transition-colors leading-snug">
                          {item.q}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.preview}</p>
                      </div>
                      <div className="ml-3 flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-600 flex items-center justify-center transition-colors">
                        <MessageCircle className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
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
