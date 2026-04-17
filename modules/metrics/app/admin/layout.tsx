import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import './admin.css';
import AdminSidebar from './_components/AdminSidebar';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Admin — WhaleMetric',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${dmSans.variable} ${jetbrainsMono.variable}`}
      style={{
        fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
        // Override Geist from root layout
      }}
    >
      <div className="app">
        <AdminSidebar />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
