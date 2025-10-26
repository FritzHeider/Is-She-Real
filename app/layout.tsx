import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';

const rubik = Rubik({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Is She Real — Authenticity Intelligence Dashboard',
  description:
    'Interactive authenticity dashboard that visualizes LLM-driven credibility scores alongside a responsive dome gallery of social content.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={rubik.className}>{children}</body>
    </html>
  );
}
