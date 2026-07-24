import Link from 'next/link';
import { MessageSquare, CalendarCheck, LayoutDashboard } from 'lucide-react';

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
