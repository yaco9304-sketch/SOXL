import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'SOXL Safety Trading',
  description: '레버리지 ETF 투자 실행 보조 도구 - 감정 개입 제거, 규칙 준수',
  keywords: ['SOXL', 'TQQQ', 'UPRO', 'ETF', 'Trading', '레버리지', '투자'],
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Safety Trading',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-bg-primary text-text-primary`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
