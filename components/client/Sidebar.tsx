"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

/* ── SVG icon helpers ── */

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

/* ── Section icons ── */

const icons: Record<string, React.ReactNode> = {
  "centro-de-mando": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  senales: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" /></svg>,
  radares: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
  tendencias: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
  crisis: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  narrativas: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>,
  stakeholders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
  territorios: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  "agenda-legislativa": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg>,
  benchmarking: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  "share-of-voice": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  "analisis-rivales": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
  rumores: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  "impacto-medios": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  "cobertura-earned": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2" /><polyline points="17 2 12 7 7 2" /></svg>,
  "evolucion-dia": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  "comparativa-pre-post": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  "briefing-diario": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  informes: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  clipping: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg>,
  "alertas-historial": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
  exportar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  fuentes: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>,
};

/* ── Types ── */

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  title: string;
  accordion: boolean;
  defaultOpen: boolean;
  items: NavItem[];
}

/* ── Data ── */

const sections: NavSection[] = [
  {
    title: "INTELIGENCIA",
    accordion: false,
    defaultOpen: true,
    items: [
      { label: "Centro de mando", href: "/dashboard", icon: "centro-de-mando" },
      { label: "Senales", href: "/senales", icon: "senales" },
      { label: "Radares", href: "/radares", icon: "radares" },
      { label: "Tendencias", href: "/tendencias", icon: "tendencias" },
      { label: "Crisis", href: "/crisis", icon: "crisis", badge: 2 },
    ],
  },
  {
    title: "SEGUIMIENTO",
    accordion: true,
    defaultOpen: true,
    items: [
      { label: "Narrativas", href: "/narrativas", icon: "narrativas" },
      { label: "Stakeholders", href: "/stakeholders", icon: "stakeholders" },
      { label: "Territorios", href: "/territorios", icon: "territorios" },
      { label: "Agenda legislativa", href: "/agenda-legislativa", icon: "agenda-legislativa" },
    ],
  },
  {
    title: "COMPETIDORES",
    accordion: true,
    defaultOpen: false,
    items: [
      { label: "Benchmarking", href: "/competidores/benchmarking", icon: "benchmarking" },
      { label: "Analisis de rivales", href: "/analisis-rivales", icon: "analisis-rivales" },
      { label: "Rumores y movimientos", href: "/rumores", icon: "rumores" },
    ],
  },
  {
    title: "CAMPANA / PROYECTO",
    accordion: true,
    defaultOpen: false,
    items: [
      { label: "Impacto en medios", href: "/impacto-medios", icon: "impacto-medios" },
      { label: "Cobertura earned", href: "/cobertura-earned", icon: "cobertura-earned" },
      { label: "Evolucion dia a dia", href: "/evolucion-dia", icon: "evolucion-dia" },
      { label: "Comparativa pre/post", href: "/comparativa", icon: "comparativa-pre-post" },
    ],
  },
  {
    title: "REPORTING",
    accordion: true,
    defaultOpen: false,
    items: [
      { label: "Briefing diario", href: "/briefing", icon: "briefing-diario" },
      { label: "Informes", href: "/informes", icon: "informes" },
      { label: "Clipping", href: "/clipping", icon: "clipping" },
      { label: "Alertas historial", href: "/alertas-historial", icon: "alertas-historial" },
      { label: "Exportar", href: "/exportar", icon: "exportar" },
    ],
  },
];

/* ── Component ── */

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, loading: userLoading } = useCurrentUser();

  const displayName = user?.account_name ?? user?.email ?? '';
  const avatarInitial = (user?.account_name ?? user?.email ?? '?')
    .trim()
    .charAt(0)
    .toUpperCase() || '?';
  const planLabel = user?.plan ? `Plan ${user.plan}` : '';

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      const init: Record<string, boolean> = {};
      for (const s of sections) {
        init[s.title] = s.defaultOpen;
      }
      return init;
    }
  );

  const toggle = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <Link href="/dashboard">
          <img src="/imgs/LogoLargoWhaleMetric.png" alt="WhaleMetric" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {sections.map((section) => {
          const isOpen = openSections[section.title];
          return (
            <div key={section.title}>
              {section.accordion ? (
                <button
                  onClick={() => toggle(section.title)}
                  className="nav-section-btn"
                >
                  {section.title}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`nav-section-chevron ${isOpen ? "open" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              ) : (
                <div className="nav-section-label">{section.title}</div>
              )}

              {(isOpen || !section.accordion) &&
                section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${(pathname === item.href || pathname.startsWith(item.href + "/")) ? "active" : ""}`}
                  >
                    {icons[item.icon]}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </Link>
                ))}
            </div>
          );
        })}

        <div className="nav-divider" />

        {/* Fuentes de datos */}
        <Link
          href="/admin/fuentes"
          className={`nav-item ${pathname === "/admin/fuentes" ? "active" : ""}`}
        >
          {icons.fuentes}
          <span style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.5px", fontWeight: 500 }}>
            Fuentes de datos
          </span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-block">
          <div className="user-avatar">{userLoading ? '' : avatarInitial}</div>
          <div className="user-info">
            {userLoading ? (
              <>
                <div style={skStyle(12, 120)} />
                <div style={{ ...skStyle(10, 80), marginTop: 4 }} />
              </>
            ) : (
              <>
                <div className="user-name" title={displayName}>
                  {displayName || '—'}
                </div>
                {planLabel && <div className="user-role">{planLabel}</div>}
              </>
            )}
          </div>
          <div className="footer-actions">
            <button
              onClick={toggleTheme}
              className="footer-btn"
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link href="/configuracion" className="footer-btn">
              <GearIcon />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

function skStyle(h: number, w: number): React.CSSProperties {
  return {
    height: h,
    width: w,
    background: 'var(--bg-muted)',
    borderRadius: 4,
    animation: 'sidebar-user-pulse 1.4s ease-in-out infinite',
  };
}
