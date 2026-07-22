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

export const metadata: Metadata = {
  title: 'Dental AI - Шүдний эмнэлгийн AI ассистент',
  description: '24/7 AI bot танай DM-д автоматаар хариулж, цаг захиалга авна',
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
