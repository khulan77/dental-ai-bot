import Link from 'next/link';
import {
  MessageSquare,
  CalendarCheck,
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  Ticket,
  Link2,
  ClipboardCheck,
  ChartColumn,
  ArrowRight,
} from 'lucide-react';
import { DEMO_SLUG } from '@/lib/demo';

export const metadata = {
  title: 'Шүдний эмнэлгийн цаг захиалгын систем',
  description:
    'Үйлчлүүлэгч тань шөнө ч, амралтын өдөр ч онлайнаар цагаа захиална. AI ассистент DM-д автоматаар хариулж, захиалгыг бүртгэнэ.',
};

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'DM-д автоматаар хариулна',
    text: 'Үнэ, ажлын цаг, эмч нарын талаарх түгээмэл асуултад AI ассистент монголоор хариулна. Шөнө ирсэн мессеж ч хариугүй үлдэхгүй.',
  },
  {
    icon: CalendarCheck,
    title: 'Цагийг өөрөө захиална',
    text: 'Үйлчлүүлэгч эмч, үйлчилгээ, цагаа сонгоод шууд захиална. Захиалагдсан цаг дахин санал болгогдохгүй.',
  },
  {
    icon: LayoutDashboard,
    title: 'Бүх захиалга нэг дор',
    text: 'Өдрийн хуваарь, эмч тус бүрийн ачаалал, орлогын тооцоог хяналтын самбараас хараарай. Шинэ захиалга ирмэгц имэйлээр мэдэгдэнэ.',
  },
];

/** Үйлчлүүлэгч юу хардаг — /c/demo хуудсан дээр туршиж үзэх зүйлс */
const DEMO_CUSTOMER_STEPS = [
  {
    icon: MessageCircle,
    title: 'AI ассистенттэй чатлана',
    text: '"Үнэ хэд вэ?", "Маргааш сул цаг байна уу?" гэж бичээд хариуг нь хараарай.',
  },
  {
    icon: CalendarDays,
    title: 'Цагаа өөрөө захиална',
    text: 'Салбар, эмч, үйлчилгээгээ сонгоод сул цагаас нэгийг нь аваад үзээрэй.',
  },
  {
    icon: Ticket,
    title: 'Захиалгаа шалгана',
    text: 'Захиалахад өгсөн кодоор захиалгынхаа төлөвийг хэдийд ч хайж олно.',
  },
];

/** Эмнэлэг юу хардаг — демо хяналтын самбар дээр туршиж үзэх зүйлс */
const DEMO_ADMIN_STEPS = [
  {
    icon: Link2,
    title: 'Хуваалцах линкээ энднээс үүсгэнэ',
    text: 'Тохиргооноос эмнэлгийнхээ хаягийг сонгож, үйлчлүүлэгчдэдээ тараах линкээ авна. Эмч, үйлчилгээ, үнэ, ажлын цаг бүгд эндээс удирдагдана.',
  },
  {
    icon: ClipboardCheck,
    title: 'Ирсэн захиалгыг баталгаажуулна',
    text: 'Шинэ захиалга "хүлээгдэж буй" төлөвтэй ирнэ. Нэг товчоор баталгаажуулах, цуцлах боломжтой — демо дээр ч ажиллана.',
  },
  {
    icon: ChartColumn,
    title: 'Ачаалал, орлогоо хардаг',
    text: 'Өдөр, 7 хоногийн захиалга, эмч тус бүрийн ачаалал, тогтмол ирдэг үйлчлүүлэгч, орлогын тооцоо нэг дэлгэц дээр.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Толгой */}
      <header className="border-b border-[var(--site-line)]">
        <div className="site-container px-5 sm:px-8 h-16 flex items-center justify-between">
          <span className="text-[15px] font-semibold tracking-tight text-[var(--site-ink)]">
            Шүдний цаг захиалга
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="#demo"
              className="hidden sm:inline text-[13px] font-medium text-[var(--site-ink-soft)] hover:text-[var(--site-accent)] transition-colors"
            >
              Демо
            </Link>
            <Link href="/login" className="site-btn-outline">
              Нэвтрэх
            </Link>
            <Link href="/signup" className="site-btn">
              Эхлэх
            </Link>
          </div>
        </div>
      </header>

      {/* Гол хэсэг */}
      <section className="site-section">
        <div className="site-container max-w-3xl text-center">
          <span className="site-eyebrow">Шүдний эмнэлгүүдэд зориулав</span>
          <h1 className="site-h1 mb-6">
            Цаг захиалгаа
            <br />
            автоматжуулаарай
          </h1>
          <p className="site-lead max-w-xl mx-auto mb-9">
            Үйлчлүүлэгч тань утсаар ярихыг хүлээхгүйгээр, шөнө ч, амралтын өдөр ч онлайнаар
            цагаа захиална. Та зөвхөн ирсэн захиалгаа баталгаажуулна.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup" className="site-btn">
              Эмнэлгээ бүртгүүлэх
            </Link>
            <Link href="/login" className="site-btn-outline">
              Бүртгэлтэй хэрэглэгч
            </Link>
          </div>
        </div>
      </section>

      {/* Боломжууд */}
      <section className="site-section site-section-soft">
        <div className="site-container">
          <div className="grid sm:grid-cols-3 gap-5">
            {FEATURES.map(feature => (
              <div key={feature.title} className="site-card p-6">
                <div className="site-icon-tile mb-5">
                  <feature.icon className="w-[18px] h-[18px]" />
                </div>
                <h2 className="site-h3 mb-2.5">{feature.title}</h2>
                <p className="site-body">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Демо */}
      <section id="demo" className="site-section scroll-mt-16">
        <div className="site-container">
          <div className="max-w-2xl mb-12">
            <span className="site-eyebrow">Демо</span>
            <h2 className="site-h2 mb-4">Эмнэлгийн нүдээр орж үзээрэй</h2>
            <p className="site-lead">
              Демо эмнэлгээр нэвтрээд хяналтын самбарт орно. Тэндээсээ
              үйлчлүүлэгчдэдээ өгөх хуудсаа нэг товчоор нээж хардаг —
              эмнэлэг өдөр бүр яг ингэж ажиллана.
            </p>
          </div>

          {/* 1 — Админ тал. Демо эндээс эхэлнэ. */}
          <div className="mb-14">
            <h3 className="text-[15px] font-semibold text-[var(--site-ink)] mb-5">
              1. Нэвтрээд хяналтын самбартаа орно
            </h3>

            <div className="grid sm:grid-cols-3 gap-5 mb-6">
              {DEMO_ADMIN_STEPS.map(step => (
                <div key={step.title} className="site-card p-6">
                  <div className="site-icon-tile mb-5">
                    <step.icon className="w-[18px] h-[18px]" />
                  </div>
                  <h4 className="site-h3 mb-2.5">{step.title}</h4>
                  <p className="site-body">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Нэвтрэлт cookie өөрчилдөг тул линк биш form POST */}
              <form action="/api/demo-login" method="post" className="self-start">
                <button type="submit" className="site-btn">
                  Демо эмнэлгээр нэвтрэх
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[13px] text-[var(--site-muted)]">
                Бүртгэл шаардлагагүй. Тохиргооны өөрчлөлт хадгалагдахгүй.
              </p>
            </div>
          </div>

          {/* 2 — Тэндээсээ үйлчлүүлэгчийн хуудас руу */}
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--site-ink)] mb-5">
              2. Тэндээсээ үйлчлүүлэгчийн хуудсаа хардаг
            </h3>

            <p className="site-body max-w-2xl mb-6">
              Самбарын хажуугийн цэсэнд{' '}
              <span className="font-medium text-[var(--site-ink)]">
                🌐 Үйлчлүүлэгчийн хуудас
              </span>{' '}
              гэсэн холбоос байна. Дарахад танай эмнэлгийн олон нийтэд
              харагддаг хуудас шинэ цонхонд нээгдэнэ — үйлчлүүлэгч тань яг
              үүнийг хардаг:
            </p>

            <div className="grid sm:grid-cols-3 gap-5 mb-6">
              {DEMO_CUSTOMER_STEPS.map(step => (
                <div key={step.title} className="site-card p-6">
                  <div className="site-icon-tile mb-5">
                    <step.icon className="w-[18px] h-[18px]" />
                  </div>
                  <h4 className="site-h3 mb-2.5">{step.title}</h4>
                  <p className="site-body">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link href={`/c/${DEMO_SLUG}`} className="site-btn-outline self-start">
                Үйлчлүүлэгчийн хуудсыг шууд нээх
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[13px] text-[var(--site-muted)]">
                Демо дээр хийсэн захиалга бодит эмнэлэгт очихгүй.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Хөл */}
      <footer className="border-t border-[var(--site-line)] px-5 sm:px-8 py-8">
        <div className="site-container flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[var(--site-muted)]">
            © {new Date().getFullYear()} Шүдний цаг захиалгын систем
          </p>
          <Link
            href="/api/health"
            className="text-[12px] text-[var(--site-muted)] hover:text-[var(--site-accent)] transition-colors"
          >
            Системийн төлөв
          </Link>
        </div>
      </footer>
    </main>
  );
}
