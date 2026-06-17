import type { Metadata } from 'next';
import { Instrument_Serif, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
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
    <html lang="mn" className={`${instrumentSerif.variable} ${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}