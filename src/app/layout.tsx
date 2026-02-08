import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BTC Dashboard',
  description: 'Bitcoin Dashboard - Built by Skippy & Nagatha',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
