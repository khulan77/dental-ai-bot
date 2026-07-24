import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Ганц фонт. cyrillic-ext заавал хэрэгтэй — Ө, Ү, ө, ү үсэг тэнд байдаг.
// Үүнгүй бол нэг үгэн дотор хоёр өөр фонт холилдож харагддаг.
const inter = Inter({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-inter',
  display: 'swap',
});

// og:image-ийн бүтэн хаяг үүсгэхэд metadataBase шаардлагатай.
// Vercel дээр NEXT_PUBLIC_APP_URL тохируулаагүй бол VERCEL_URL руу шилжинэ.
function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: 'Шүдний эмнэлгийн цаг захиалгын систем',
  description: 'Үйлчлүүлэгч тань онлайнаар цагаа захиална. AI ассистент DM-д автоматаар хариулна.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
