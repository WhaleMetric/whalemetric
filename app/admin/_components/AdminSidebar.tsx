'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  external?: boolean;
  badgeId?: string;
}

const VISTAS: NavItem[] = [
  { label: 'Todas las noticias', href: '/admin', icon: 'grid', badgeId: 'badge-all' },
  { label: 'Prensa digital',     href: '/admin?view=prensa_digital', icon: 'digital', badgeId: 'badge-prensa_digital' },
  { label: 'Prensa escrita',     href: '/admin?view=prensa_escrita', icon: 'print', badgeId: 'badge-prensa_escrita' },
  { label: 'Televisión',         href: '/admin?view=television', icon: 'tv', badgeId: 'badge-television' },
  { label: 'Radio',              href: '/admin?view=radio', icon: 'radio', badgeId: 'badge-radio' },
];

const SISTEMA: NavItem[] = [
  { label: 'Base de datos',   href: '/admin?section=bbdd', icon: 'db' },
  { label: 'Flujos en local', href: '/admin/flujos-locales', icon: 'flows' },
];

function Icon({ name }: { name: string }) {
  const p = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, width: 16, height: 16 };
  switch (name) {
    case 'grid':
      return (
        <svg {...p}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'digital':
      return (
        <svg {...p}>
          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
        </svg>
      );
    case 'print':
      return (
        <svg {...p}>
          <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
          <path d="M10 6h8v4h-8V6z" />
        </svg>
      );
    case 'tv':
      return (
        <svg {...p}>
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
          <polyline points="17 2 12 7 7 2" />
        </svg>
      );
    case 'radio':
      return (
        <svg {...p}>
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
          <path d="M19 10v2a7 7 0 01-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      );
    case 'db':
      return (
        <svg {...p}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'flows':
      return (
        <svg {...p}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    // Flujos en local is active when under /admin/flujos-locales
    if (href.startsWith('/admin/flujos-locales')) {
      return pathname.startsWith('/admin/flujos-locales');
    }
    // Other admin links point at /admin with query params — mark none as active here;
    // /admin's own internal JS handles active state inside that page.
    return false;
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay open"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Menú"
        style={{ position: 'fixed', top: 12, left: 12, zIndex: 50 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/admin" className="logo" prefetch={false}>
            <img
              src="/imgs/LogoLargoWhaleMetric.png"
              alt="WhaleMetric"
              style={{ height: 19, width: 'auto', display: 'block' }}
            />
          </Link>
        </div>

        <Link
          href="/admin/fuentes"
          className="sidebar-btn"
          style={{ textDecoration: 'none' }}
          prefetch={false}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
            <path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07" />
          </svg>
          Gestionar fuentes
        </Link>

        <button
          className="sidebar-btn-secondary"
          onClick={() => alert('Próximamente')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          Ver Transcripciones
        </button>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Vistas</div>
          {VISTAS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${isActive(item.href) ? ' active' : ''}`}
              prefetch={false}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}

          <div className="nav-divider" />
          <div className="nav-section-label">Sistema</div>
          {SISTEMA.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${isActive(item.href) ? ' active' : ''}`}
              prefetch={false}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-block">
            <div className="user-avatar">A</div>
            <div className="user-info">
              <div className="user-name">Admin</div>
              <div className="user-role">Acceso total · WhaleMetric</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
