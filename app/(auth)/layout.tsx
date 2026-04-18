import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './auth.css';
import AuthBrand from './_components/AuthBrand';
import AuthHero from './_components/AuthHero';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WhaleMetric — Autenticación',
  description: 'Accede o crea tu cuenta de WhaleMetric.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <div className="auth-root">
          <div className="auth-shell">
            <section className="auth-left">
              <AuthBrand />
              <div className="auth-left-inner">
                <div className="auth-form-wrap">{children}</div>
              </div>
            </section>

            <aside className="auth-right">
              <AuthHero />
            </aside>
          </div>
        </div>
      </body>
    </html>
  );
}
