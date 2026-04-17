'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    section: 'Vistas',
    items: [
      { label: 'Todas las noticias', href: '/admin', icon: 'grid' },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { label: 'Supabase', href: 'https://supabase.com/dashboard/project/txxygcdafjcuyvvzbbnx', icon: 'db', external: true },
      { label: 'Flujos en local', href: '/admin/flujos-locales', icon: 'flows' },
    ],
  },
];

function Icon({ name }: { name: string }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, width: 16, height: 16 };
  if (name === 'grid') return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  if (name === 'db') return <svg {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
  if (name === 'flows') return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>;
  return null;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      {/* overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay open"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* mobile menu btn — injected into header by the layout header area */}
      <button
        id="mobile-sidebar-btn"
        className="mobile-menu-btn"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Menú"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <aside className={`sidebar${mobileOpen ? ' open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <a href="/admin" className="logo">
            <div className="logo-icon">W</div>
            <div className="logo-text">WhaleMetric <span>admin</span></div>
          </a>
        </div>

        <div className="admin-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Acceso total
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className={`nav-item${isActive(item.href) && !item.external ? ' active' : ''}`}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </a>
              ))}
              <div className="nav-divider" />
            </div>
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
