import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './auth.css';
import AuthBrand from './_components/AuthBrand';
import AuthHero from './_components/AuthHero';
import type { MediaLogo } from './_components/MediaRadar';
import { createClient } from '@/lib/supabase/server';

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

// The query to public.sources is cheap; cachear 1h es suficiente.
export const revalidate = 3600;

async function fetchMediaLogos(): Promise<{ logos: MediaLogo[]; total: number }> {
  try {
    const supabase = await createClient();

    const [logosRes, countRes] = await Promise.all([
      supabase
        .from('sources')
        .select('id, name, icon_url, type')
        .not('icon_url', 'is', null)
        .order('name', { ascending: true })
        .limit(40),
      supabase
        .from('sources')
        .select('id', { count: 'exact', head: true })
        .not('icon_url', 'is', null),
    ]);

    const logos = (logosRes.data ?? []) as MediaLogo[];
    const total = countRes.count ?? logos.length;
    return { logos, total };
  } catch {
    return { logos: [], total: 0 };
  }
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logos, total } = await fetchMediaLogos();

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
              <AuthHero mediaLogos={logos} totalMedia={total} />
            </aside>
          </div>
        </div>
      </body>
    </html>
  );
}
