import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BTC Dashboard',
  description: 'Real-time Bitcoin price, Fear & Greed Index, network stats, and halving countdown',
  keywords: ['Bitcoin', 'BTC', 'cryptocurrency', 'price', 'dashboard', 'fear greed index'],
  authors: [{ name: 'Skippy the Magnificent' }, { name: 'Nagatha' }],
  openGraph: {
    title: 'BTC Dashboard',
    description: 'Real-time Bitcoin price, Fear & Greed Index, and network stats',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f7931a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 antialiased`}>
        {children}
      </body>
    </html>
  );
}
