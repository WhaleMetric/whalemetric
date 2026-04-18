import LiveStatus from './LiveStatus';
import NewsTicker from './NewsTicker';
import MediaRadar, { type MediaLogo } from './MediaRadar';

interface AuthHeroProps {
  mediaLogos: MediaLogo[];
  totalMedia: number;
}

/**
 * Right-panel "newsroom terminal": heading → LIVE status → ticker → radar.
 * Server component that composes three client components. The Supabase
 * query for mediaLogos runs in the layout so this component stays pure.
 */
export default function AuthHero({ mediaLogos, totalMedia }: AuthHeroProps) {
  return (
    <div className="auth-hero-inner">
      <header>
        <p className="auth-hero-top">
          La redacción no duerme.<br />
          Tu dossier de prensa tampoco.
        </p>
      </header>

      <LiveStatus />

      <NewsTicker />

      <MediaRadar logos={mediaLogos} total={totalMedia} />
    </div>
  );
}
