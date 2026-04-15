import { NextResponse } from 'next/server';

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WhaleMetric — Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #FFFFFF; --bg-subtle: #FAFAFA; --bg-muted: #F5F5F5;
    --border: #E5E7EB; --border-light: #F0F0F0;
    --text-primary: #0A0A0A; --text-secondary: #6B7280; --text-tertiary: #9CA3AF;
    --accent: #0A0A0A; --accent-hover: #171717;
    --green: #10B981; --green-bg: #ECFDF5; --green-text: #065F46;
    --red: #EF4444; --red-bg: #FEF2F2; --red-text: #991B1B;
    --amber: #F59E0B; --amber-bg: #FFFBEB; --amber-text: #92400E;
    --blue: #3B82F6; --blue-bg: #EFF6FF; --blue-text: #1E40AF;
    --purple: #8B5CF6; --purple-bg: #F5F3FF; --purple-text: #5B21B6;
    --sidebar-w: 260px; --header-h: 56px;
    --radius: 8px; --radius-sm: 6px;
    --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --font: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }
  body { font-family: var(--font); background: var(--bg-subtle); color: var(--text-primary); -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.5; }
  .app { display: flex; min-height: 100vh; }

  /* ═══ SIDEBAR ═══ */
  .sidebar { width: var(--sidebar-w); background: var(--bg); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 40; transition: transform 300ms ease; }
  .sidebar-header { padding: 20px 20px 16px; border-bottom: 1px solid var(--border-light); }
  .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text-primary); }
  .sidebar-btn { margin: 12px 16px 0; padding: 9px 14px; background: var(--accent); color: white; border: none; border-radius: var(--radius); font-size: 13px; font-weight: 500; font-family: var(--font); cursor: pointer; display: flex; align-items: center; gap: 7px; transition: all 150ms ease; justify-content: center; }
  .sidebar-btn:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
  .sidebar-btn-secondary { margin: 8px 16px 0; padding: 9px 14px; background: transparent; color: var(--text-secondary); border: 1px solid var(--border); border-radius: var(--radius); font-size: 13px; font-weight: 500; font-family: var(--font); cursor: pointer; display: flex; align-items: center; gap: 7px; transition: all 150ms ease; justify-content: center; }
  .sidebar-btn-secondary:hover { background: var(--bg-subtle); color: var(--text-primary); }
  .sidebar-nav { flex: 1; padding: 16px 0; overflow-y: auto; }
  .nav-section-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary); font-weight: 500; padding: 8px 20px 6px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 20px; color: var(--text-secondary); text-decoration: none; font-size: 13px; font-weight: 450; transition: all 150ms ease; cursor: pointer; border-left: 2px solid transparent; margin: 1px 0; }
  .nav-item:hover { color: var(--text-primary); background: var(--bg-subtle); }
  .nav-item.active { color: var(--text-primary); background: var(--bg-subtle); border-left-color: var(--accent); font-weight: 550; }
  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; opacity: 0.55; }
  .nav-item.active svg { opacity: 0.85; }
  .nav-badge { margin-left: auto; font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 10px; background: var(--blue-bg); color: var(--blue-text); }
  .nav-divider { height: 1px; background: var(--border-light); margin: 8px 16px; }
  .sidebar-footer { padding: 14px 16px; border-top: 1px solid var(--border-light); }
  .user-block { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius); cursor: pointer; }
  .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: white; flex-shrink: 0; }
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 13px; font-weight: 550; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 11px; color: var(--purple-text); font-weight: 500; }

  /* ═══ MAIN ═══ */
  .main { flex: 1; margin-left: var(--sidebar-w); min-height: 100vh; display: flex; flex-direction: column; }
  .header { height: var(--header-h); border-bottom: 1px solid var(--border); background: var(--bg); display: flex; align-items: center; justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 30; }
  .header-left { display: flex; align-items: center; gap: 16px; }
  .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-tertiary); }
  .breadcrumb-current { color: var(--text-primary); font-weight: 500; }
  .header-right { display: flex; align-items: center; gap: 10px; }
  .btn { padding: 7px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; font-family: var(--font); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 150ms ease; border: 1px solid transparent; text-decoration: none; }
  .btn-primary { background: var(--accent); color: white; border-color: var(--accent); }
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
  .btn-secondary { background: var(--bg); color: var(--text-secondary); border-color: var(--border); }
  .btn-secondary:hover { background: var(--bg-subtle); color: var(--text-primary); }
  .btn svg { width: 14px; height: 14px; }

  /* ═══ SECTIONS ═══ */
  .section { display: none; }
  .section.active { display: block; }
  .content { flex: 1; padding: 28px; }
  .page-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; }
  .page-title { font-size: 22px; font-weight: 600; letter-spacing: -0.4px; }
  .page-subtitle { font-size: 13px; color: var(--text-tertiary); margin-top: 2px; }

  /* ═══ KPIs ═══ */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .kpi-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; transition: box-shadow 150ms ease; animation: fadeInUp 400ms ease both; }
  .kpi-card:hover { box-shadow: var(--shadow-sm); }
  .kpi-label { font-size: 11px; color: var(--text-tertiary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .kpi-label svg { width: 14px; height: 14px; opacity: 0.5; }
  .kpi-value { font-size: 28px; font-weight: 700; letter-spacing: -1px; color: var(--text-primary); line-height: 1.1; font-family: var(--font-mono); }
  .kpi-footer { font-size: 12px; color: var(--text-tertiary); margin-top: 8px; }
  .kpi-card:nth-child(1) { animation-delay: 0ms; }
  .kpi-card:nth-child(2) { animation-delay: 50ms; }
  .kpi-card:nth-child(3) { animation-delay: 100ms; }
  .kpi-card:nth-child(4) { animation-delay: 150ms; }

  /* ═══ CHARTS ═══ */
  .chart-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 16px; }
  .chart-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
  .chart-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .chart-sub { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }
  .chart-wrap { position: relative; height: 240px; }
  .chart-wrap-sm { position: relative; height: 180px; }

  /* ═══ PERIOD TABS ═══ */
  .period-tabs { display: flex; gap: 4px; }
  .period-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; font-weight: 500; font-family: var(--font); color: var(--text-secondary); background: var(--bg); cursor: pointer; transition: all 150ms ease; }
  .period-btn:hover { background: var(--bg-subtle); }
  .period-btn.active { background: var(--accent); color: white; border-color: var(--accent); }

  /* ═══ TOP 5 ═══ */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .top5-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .top5-head { padding: 14px 16px 12px; border-bottom: 1px solid var(--border-light); font-size: 13px; font-weight: 600; }
  .top5-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 16px; border-bottom: 1px solid var(--border-light); }
  .top5-row:last-child { border-bottom: none; }
  .top5-name { font-size: 13px; color: var(--text-primary); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }
  .top5-type-lbl { font-size: 10px; color: var(--text-tertiary); margin-top: 1px; }
  .top5-count { font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--text-primary); }

  /* ═══ TYPE STAT CARDS ═══ */
  .type-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
  .type-stat { background: var(--bg-subtle); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; }
  .type-stat-label { font-size: 11px; color: var(--text-tertiary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px; display: flex; align-items: center; gap: 5px; }
  .type-stat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .type-stat-val { font-size: 20px; font-weight: 700; color: var(--text-primary); font-family: var(--font-mono); letter-spacing: -0.5px; }
  .type-stat-sub { font-size: 11px; color: var(--text-tertiary); margin-top: 3px; }

  /* ═══ FILTERS ═══ */
  .filters-bar { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .filter-group { display: flex; align-items: center; gap: 6px; }
  .filter-label { font-size: 12px; color: var(--text-tertiary); font-weight: 500; white-space: nowrap; }
  .filter-input { height: 34px; padding: 0 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: var(--font); color: var(--text-primary); background: var(--bg); transition: border-color 150ms ease; outline: none; }
  .filter-input:focus { border-color: var(--accent); }
  .filter-input::placeholder { color: var(--text-tertiary); }
  .search-input { width: 220px; padding-left: 32px; }
  .search-wrap { position: relative; }
  .search-wrap svg { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--text-tertiary); pointer-events: none; }
  select.filter-input { cursor: pointer; padding-right: 28px; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; }
  .filters-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
  .results-count { font-size: 12px; color: var(--text-tertiary); white-space: nowrap; }

  /* ═══ TABLE ═══ */
  .table-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; animation: fadeInUp 400ms ease 200ms both; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead th { text-align: left; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary); padding: 10px 16px; background: var(--bg-subtle); border-bottom: 1px solid var(--border); white-space: nowrap; cursor: pointer; user-select: none; }
  thead th:hover { color: var(--text-primary); }
  .sort-icon { display: inline-block; margin-left: 4px; opacity: 0.4; font-size: 10px; }
  .sort-icon.active { opacity: 1; }
  tbody td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid var(--border-light); color: var(--text-secondary); vertical-align: middle; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: var(--bg-subtle); }
  .type-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; white-space: nowrap; background: #F5F5F5; color: #555; }
  .date-cell { font-family: var(--font-mono); font-size: 12px; white-space: nowrap; }

  /* ═══ PAGINATION ═══ */
  .pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--border-light); background: var(--bg-subtle); }
  .pagination-info { font-size: 12px; color: var(--text-tertiary); }
  .pagination-btns { display: flex; gap: 4px; }
  .page-btn { height: 30px; min-width: 30px; padding: 0 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); font-size: 12px; font-family: var(--font); color: var(--text-secondary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 150ms ease; }
  .page-btn:hover:not(:disabled) { background: var(--bg-subtle); color: var(--text-primary); }
  .page-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
  .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ═══ EMPTY / LOADING ═══ */
  .state-box { padding: 60px 20px; text-align: center; color: var(--text-tertiary); }
  .state-box svg { width: 36px; height: 36px; margin: 0 auto 12px; opacity: 0.3; display: block; }
  .state-box p { font-size: 14px; }
  .state-box small { font-size: 12px; margin-top: 4px; display: block; }
  .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto; }
  .loading-msg { text-align: center; padding: 40px; color: var(--text-tertiary); font-size: 13px; }

  /* ═══ ANIMATIONS ═══ */
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ═══ RESPONSIVE ═══ */
  .mobile-menu-btn { display: none; }
  .sidebar-overlay { display: none; }
  @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .two-col { grid-template-columns: 1fr; } .type-cards { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 35; opacity: 0; pointer-events: none; transition: opacity 300ms; }
    .sidebar-overlay.open { opacity: 1; pointer-events: all; }
    .main { margin-left: 0; }
    .mobile-menu-btn { display: flex; background: none; border: none; cursor: pointer; color: var(--text-primary); padding: 4px; }
    .content { padding: 16px; }
    .header { padding: 0 16px; }
  }
</style>
</head>
<body>
<div class="app">
  <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <a href="/admin" class="logo">
        <img src="/imgs/LogoLargoWhaleMetric.png" alt="WhaleMetric" style="height:19px;width:auto;display:block;">
      </a>
    </div>

    <a href="/fuentes" class="sidebar-btn" style="text-decoration:none">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07"/></svg>
      Gestionar fuentes
    </a>

    <button class="sidebar-btn-secondary" onclick="openTranscriptions()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
      Ver Transcripciones
    </button>

    <nav class="sidebar-nav">
      <div class="nav-section-label">Vistas</div>
      <a class="nav-item active" id="nav-all" href="#" onclick="setView('all'); return false;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Todas las noticias
        <span class="nav-badge" id="badge-all">—</span>
      </a>
      <a class="nav-item" id="nav-prensa_digital" href="#" onclick="setView('prensa_digital'); return false;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2"/></svg>
        Prensa digital
        <span class="nav-badge" id="badge-prensa_digital">—</span>
      </a>
      <a class="nav-item" id="nav-prensa_escrita" href="#" onclick="setView('prensa_escrita'); return false;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>
        Prensa escrita
        <span class="nav-badge" id="badge-prensa_escrita">—</span>
      </a>
      <a class="nav-item" id="nav-television" href="#" onclick="setView('television'); return false;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
        Televisión
        <span class="nav-badge" id="badge-television">—</span>
      </a>
      <a class="nav-item" id="nav-radio" href="#" onclick="setView('radio'); return false;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        Radio
        <span class="nav-badge" id="badge-radio">—</span>
      </a>

      <div class="nav-divider"></div>
      <div class="nav-section-label">Sistema</div>
      <a class="nav-item" id="nav-bbdd" href="#" onclick="setSection('bbdd'); return false;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        Base de datos
      </a>
      <a class="nav-item" href="https://eu2.make.com/9045387" target="_blank">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        Make · Escenario RSS
      </a>
    </nav>

    <div class="sidebar-footer">
      <div class="user-block">
        <div class="user-avatar">A</div>
        <div class="user-info">
          <div class="user-name">Admin</div>
          <div class="user-role">Acceso total · WhaleMetric</div>
        </div>
      </div>
    </div>
  </aside>

  <main class="main">
    <header class="header">
      <div class="header-left">
        <button class="mobile-menu-btn" onclick="toggleSidebar()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="breadcrumb">
          <span>WhaleMetric</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span class="breadcrumb-current" id="breadcrumb-current">Todas las noticias</span>
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-secondary" id="btn-export-csv" onclick="exportCSV()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar CSV
        </button>
        <button class="btn btn-secondary" onclick="refreshCurrent()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Actualizar
        </button>
      </div>
    </header>

    <!-- ═══ SECCIÓN NOTICIAS ═══ -->
    <div id="section-noticias" class="section active">
      <div class="content">

        <!-- KPIs -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Hoy
            </div>
            <div class="kpi-value" id="kpi-hoy">—</div>
            <div class="kpi-footer">Noticias publicadas hoy</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2"/></svg>
              Últimas 48h
            </div>
            <div class="kpi-value" id="kpi-48h">—</div>
            <div class="kpi-footer">Noticias recientes</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Esta semana
            </div>
            <div class="kpi-value" id="kpi-semana">—</div>
            <div class="kpi-footer">Desde el lunes</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Fuentes activas
            </div>
            <div class="kpi-value" id="kpi-sources">—</div>
            <div class="kpi-footer">Con noticias indexadas</div>
          </div>
        </div>

        <!-- Gráfico actividad 7d -->
        <div class="chart-card">
          <div class="chart-head">
            <div>
              <div class="chart-title">Actividad de ingesta — 7 días</div>
              <div class="chart-sub">Noticias indexadas por día y tipo de fuente</div>
            </div>
          </div>
          <div class="chart-wrap-sm"><canvas id="chart-activity-news"></canvas></div>
        </div>

        <!-- Top 5 -->
        <div class="two-col">
          <div class="top5-card">
            <div class="top5-head">Top 5 más activos (48h)</div>
            <div id="top5-active"></div>
          </div>
          <div class="top5-card">
            <div class="top5-head">Top 5 menos activos (48h, mín. 5 noticias)</div>
            <div id="top5-inactive"></div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="filters-bar">
          <div class="filter-group">
            <div class="search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" class="filter-input search-input" id="search-input" placeholder="Buscar por título..." oninput="onSearch()">
            </div>
          </div>
          <div class="filter-group">
            <span class="filter-label">Fuente</span>
            <select class="filter-input" id="filter-source" onchange="applyFilters()">
              <option value="">Todas</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Tipo</span>
            <select class="filter-input" id="filter-type" onchange="applyFilters()">
              <option value="">Todos</option>
              <option value="prensa_digital">Prensa digital</option>
              <option value="prensa_escrita">Prensa escrita</option>
              <option value="television">Televisión</option>
              <option value="radio">Radio</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Desde</span>
            <input type="date" class="filter-input" id="filter-from" onchange="applyFilters()">
          </div>
          <div class="filter-group">
            <span class="filter-label">Hasta</span>
            <input type="date" class="filter-input" id="filter-to" onchange="applyFilters()">
          </div>
          <div class="filters-right">
            <span class="results-count" id="results-count"></span>
            <button class="btn btn-secondary" onclick="clearFilters()" style="padding:5px 10px;font-size:12px;">Limpiar</button>
          </div>
        </div>

        <!-- Tabla -->
        <div class="table-card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fuente</th>
                  <th>Titular y descripción</th>
                  <th style="width:80px;white-space:nowrap">Tipo</th>
                  <th style="width:90px;white-space:nowrap">IA</th>
                  <th onclick="setSort('published_at')" id="th-published_at" style="width:100px;white-space:nowrap">Fecha <span class="sort-icon active" id="si-published_at">↓</span></th>
                  <th style="width:90px;white-space:nowrap">Ver artículo</th>
                </tr>
              </thead>
              <tbody id="news-tbody">
                <tr><td colspan="6"><div class="state-box"><div class="spinner"></div></div></td></tr>
              </tbody>
            </table>
          </div>
          <div class="pagination" id="pagination" style="display:none">
            <span class="pagination-info" id="pagination-info"></span>
            <div class="pagination-btns" id="pagination-btns"></div>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══ SECCIÓN BASE DE DATOS ═══ -->
    <div id="section-bbdd" class="section">
      <div class="content">
        <div class="page-header">
          <div>
            <div class="page-title">Base de datos</div>
            <div class="page-subtitle">Estadísticas de ingesta y almacenamiento</div>
          </div>
        </div>

        <!-- Bloque A: Actividad diaria -->
        <div class="chart-card">
          <div class="chart-head">
            <div>
              <div class="chart-title">Bloque A — Actividad diaria</div>
              <div class="chart-sub">Noticias por tipo de fuente + MB del día</div>
            </div>
            <div class="period-tabs">
              <button class="period-btn active" onclick="loadDbActivity(7, this)">7d</button>
              <button class="period-btn" onclick="loadDbActivity(30, this)">30d</button>
              <button class="period-btn" onclick="loadDbActivity(90, this)">3m</button>
              <button class="period-btn" onclick="loadDbActivity(365, this)">1a</button>
            </div>
          </div>
          <div class="loading-msg" id="db-activity-msg">Cargando...</div>
          <div class="chart-wrap" id="db-activity-wrap" style="display:none"><canvas id="chart-activity-db"></canvas></div>
        </div>

        <!-- Bloque B: Almacenamiento acumulado -->
        <div class="chart-card">
          <div class="chart-head">
            <div>
              <div class="chart-title">Bloque B — Almacenamiento acumulado</div>
              <div class="chart-sub">Crecimiento histórico completo en GB</div>
            </div>
          </div>
          <div class="loading-msg" id="db-storage-msg">Cargando...</div>
          <div class="chart-wrap" id="db-storage-wrap" style="display:none"><canvas id="chart-storage-db"></canvas></div>
          <div class="type-cards" id="db-type-cards"></div>
        </div>

      </div>
    </div>

  </main>
</div>

<script>
const SUPABASE_URL = 'https://txxygcdafjcuyvvzbbnx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4eHlnY2RhZmpjdXl2dnpiYm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTA1NjEsImV4cCI6MjA5MTU4NjU2MX0.JCeVp6a3bRKbSPkG_aoYvVwMIFTFn7-IFaXjaeZ0Ik0';
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PAGE_SIZE = 50;
let currentSection = 'noticias';
let chartActivityNews = null;
let chartActivityDb = null;
let chartStorageDb = null;
let state = {
  view: 'all', search: '', source: '', type: '', from: '', to: '',
  sort: 'published_at', dir: 'desc', page: 0, allNews: [], filtered: [],
};
let searchTimeout = null;

const TYPE_LABELS = { prensa_digital: 'Prensa digital', prensa_escrita: 'Prensa escrita', television: 'Televisión', radio: 'Radio' };
const SOURCE_COLORS = { prensa_digital: '#3B82F6', prensa_escrita: '#F59E0B', television: '#8B5CF6', radio: '#10B981' };
const TYPE_KEYS = ['prensa_digital', 'prensa_escrita', 'television', 'radio'];

/* ═══ SECTION NAV ═══ */
function setSection(s) {
  currentSection = s;
  document.querySelectorAll('.section').forEach(function(el) { el.classList.remove('active'); });
  document.getElementById('section-' + s).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(function(el) { el.classList.remove('active'); });
  if (s === 'noticias') {
    document.getElementById('nav-all').classList.add('active');
    document.getElementById('breadcrumb-current').textContent = 'Todas las noticias';
    document.getElementById('btn-export-csv').style.display = '';
  } else {
    document.getElementById('nav-bbdd').classList.add('active');
    document.getElementById('breadcrumb-current').textContent = 'Base de datos';
    document.getElementById('btn-export-csv').style.display = 'none';
    loadDbActivity(7, document.querySelector('.period-btn.active'));
    loadDbStorage();
  }
}

function refreshCurrent() {
  if (currentSection === 'noticias') { loadData(); }
  else { loadDbActivity(7, document.querySelector('.period-btn.active')); loadDbStorage(); }
}

/* ═══ LOAD NEWS ═══ */
async function loadData() {
  showLoading();
  try {
    const { data, error } = await db
      .from('news')
      .select(\`id, title, description, url, published_at, created_at, sources(name, type, icon_url)\`)
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('published_at', { ascending: false })
      .limit(2500);
    if (error) throw error;
    state.allNews = (data || []).map(function(n) {
      return {
        id: n.id, title: n.title, description: n.description, url: n.url,
        published_at: n.published_at, created_at: n.created_at,
        source_name: n.sources ? (n.sources.name || '—') : '—',
        source_type: n.sources ? (n.sources.type || '') : '',
        source_icon: n.sources ? (n.sources.icon_url || '') : '',
      };
    });
    updateKPIs();
    updateBadges();
    populateSourceFilter();
    applyFilters();
    renderMiniActivityChart();
    renderTop5();
  } catch (e) { showError(e.message); }
}

/* ═══ KPIs ═══ */
function updateKPIs() {
  var all = state.allNews;
  var now = new Date();
  var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  var h48ago = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
  var mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7)); mon.setHours(0,0,0,0);
  var monIso = mon.toISOString();
  document.getElementById('kpi-hoy').textContent = all.filter(function(n) { return (n.published_at || n.created_at) >= todayStart; }).length;
  document.getElementById('kpi-48h').textContent = all.filter(function(n) { return (n.published_at || n.created_at) >= h48ago; }).length;
  document.getElementById('kpi-semana').textContent = all.filter(function(n) { return (n.published_at || n.created_at) >= monIso; }).length;
  document.getElementById('kpi-sources').textContent = new Set(all.map(function(n) { return n.source_name; })).size;
}

function updateBadges() {
  var counts = { all: state.allNews.length };
  TYPE_KEYS.forEach(function(t) { counts[t] = state.allNews.filter(function(n) { return n.source_type === t; }).length; });
  Object.keys(counts).forEach(function(k) {
    var el = document.getElementById('badge-' + k);
    if (el) el.textContent = counts[k];
  });
}

/* ═══ MINI ACTIVITY CHART ═══ */
function renderMiniActivityChart() {
  var canvas = document.getElementById('chart-activity-news');
  if (!canvas || typeof Chart === 'undefined') return;
  if (chartActivityNews) { chartActivityNews.destroy(); chartActivityNews = null; }
  var days = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
    days.push(d.toISOString().slice(0,10));
  }
  var grouped = {};
  days.forEach(function(d) { grouped[d] = { prensa_digital: 0, prensa_escrita: 0, television: 0, radio: 0 }; });
  state.allNews.forEach(function(n) {
    var d = (n.published_at || n.created_at || '').slice(0,10);
    if (grouped[d] && n.source_type) grouped[d][n.source_type] = (grouped[d][n.source_type] || 0) + 1;
  });
  var labels = days.map(function(d) { var dt = new Date(d + 'T12:00:00'); return dt.toLocaleDateString('es', {day:'2-digit',month:'short'}); });
  chartActivityNews = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: TYPE_KEYS.map(function(t) {
        return { label: TYPE_LABELS[t], data: days.map(function(d) { return grouped[d][t] || 0; }), backgroundColor: SOURCE_COLORS[t] + 'CC', stack: 'a' };
      })
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { stacked: true, grid: { color: '#F0F0F0' }, ticks: { font: { size: 11 }, precision: 0 } }
      }
    }
  });
}

/* ═══ TOP 5 ═══ */
function renderTop5() {
  var h48ago = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  var news48 = state.allNews.filter(function(n) { return (n.published_at || n.created_at) >= h48ago; });
  var sourceCounts = {};
  news48.forEach(function(n) {
    if (!sourceCounts[n.source_name]) sourceCounts[n.source_name] = { name: n.source_name, type: n.source_type, count: 0 };
    sourceCounts[n.source_name].count++;
  });
  var sorted = Object.values(sourceCounts).sort(function(a,b) { return b.count - a.count; });
  var top5active = sorted.slice(0,5);
  var top5inactive = sorted.filter(function(s) { return s.count >= 5; }).sort(function(a,b) { return a.count - b.count; }).slice(0,5);
  function renderRows(list, elId) {
    var el = document.getElementById(elId);
    if (!el) return;
    if (list.length === 0) {
      el.innerHTML = '<div style="padding:16px;text-align:center;font-size:12px;color:var(--text-tertiary)">Sin datos suficientes</div>';
      return;
    }
    el.innerHTML = list.map(function(s) {
      return '<div class="top5-row">' +
        '<div><div class="top5-name">' + escHtml(s.name) + '</div>' +
        '<div class="top5-type-lbl">' + (TYPE_LABELS[s.type] || s.type) + '</div></div>' +
        '<div class="top5-count">' + s.count + '</div></div>';
    }).join('');
  }
  renderRows(top5active, 'top5-active');
  renderRows(top5inactive, 'top5-inactive');
}

/* ═══ DB: ACTIVIDAD DIARIA ═══ */
async function loadDbActivity(days, btnEl) {
  document.querySelectorAll('.period-btn').forEach(function(b) { b.classList.remove('active'); });
  if (btnEl) btnEl.classList.add('active');
  document.getElementById('db-activity-msg').style.display = 'block';
  document.getElementById('db-activity-msg').textContent = 'Cargando...';
  document.getElementById('db-activity-wrap').style.display = 'none';
  try {
    var { data, error } = await db.from('daily_stats')
      .select('date, source_type, news_count, bytes_total')
      .order('date', { ascending: true })
      .limit(days * 4 + 20);
    if (error) throw error;
    if (!data || data.length === 0) { document.getElementById('db-activity-msg').textContent = 'Sin datos disponibles'; return; }
    var allDates = [...new Set(data.map(function(r) { return r.date; }))].sort();
    var useDates = allDates.slice(-days);
    var pivot = {};
    useDates.forEach(function(d) { pivot[d] = { prensa_digital: 0, prensa_escrita: 0, television: 0, radio: 0, bytes: 0 }; });
    data.forEach(function(r) {
      if (pivot[r.date]) {
        pivot[r.date][r.source_type] = (pivot[r.date][r.source_type] || 0) + (r.news_count || 0);
        pivot[r.date].bytes += (r.bytes_total || 0);
      }
    });
    var labels = useDates.map(function(d) { var dt = new Date(d + 'T12:00:00'); return dt.toLocaleDateString('es', {day:'2-digit',month:'short'}); });
    var mbData = useDates.map(function(d) { return Math.round(pivot[d].bytes / 1024 / 1024 * 100) / 100; });
    document.getElementById('db-activity-msg').style.display = 'none';
    document.getElementById('db-activity-wrap').style.display = 'block';
    var canvas = document.getElementById('chart-activity-db');
    if (chartActivityDb) { chartActivityDb.destroy(); chartActivityDb = null; }
    var barDatasets = TYPE_KEYS.map(function(t) {
      return { type: 'bar', label: TYPE_LABELS[t], data: useDates.map(function(d) { return pivot[d][t] || 0; }), backgroundColor: SOURCE_COLORS[t] + 'CC', stack: 'a', yAxisID: 'y' };
    });
    var lineDataset = { type: 'line', label: 'MB del día', data: mbData, borderColor: '#0A0A0A', backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: days <= 30 ? 3 : 1, tension: 0.3, yAxisID: 'y2' };
    chartActivityDb = new Chart(canvas, {
      type: 'bar',
      data: { labels: labels, datasets: barDatasets.concat([lineDataset]) },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } } },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 }, maxTicksLimit: 14 } },
          y: { stacked: true, position: 'left', grid: { color: '#F0F0F0' }, ticks: { font: { size: 11 }, precision: 0 }, title: { display: true, text: 'Noticias', font: { size: 11 } } },
          y2: { position: 'right', grid: { drawOnChartArea: false }, ticks: { font: { size: 11 } }, title: { display: true, text: 'MB', font: { size: 11 } } }
        }
      }
    });
  } catch(e) { document.getElementById('db-activity-msg').textContent = 'Error: ' + e.message; }
}

/* ═══ DB: ALMACENAMIENTO ACUMULADO ═══ */
async function loadDbStorage() {
  document.getElementById('db-storage-msg').style.display = 'block';
  document.getElementById('db-storage-msg').textContent = 'Cargando...';
  document.getElementById('db-storage-wrap').style.display = 'none';
  document.getElementById('db-type-cards').innerHTML = '';
  try {
    var { data, error } = await db.from('daily_stats')
      .select('date, source_type, cumulative_bytes')
      .order('date', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) { document.getElementById('db-storage-msg').textContent = 'Sin datos disponibles'; return; }
    var totals = {};
    data.forEach(function(r) { totals[r.date] = (totals[r.date] || 0) + (r.cumulative_bytes || 0); });
    var latestDate = Object.keys(totals).sort().pop();
    var latestByType = {};
    data.filter(function(r) { return r.date === latestDate; }).forEach(function(r) { latestByType[r.source_type] = r.cumulative_bytes || 0; });
    var dates = Object.keys(totals).sort();
    var gbData = dates.map(function(d) { return Math.round(totals[d] / 1024 / 1024 / 1024 * 1000) / 1000; });
    var labels = dates.map(function(d) { var dt = new Date(d + 'T12:00:00'); return dt.toLocaleDateString('es', {day:'2-digit',month:'short'}); });
    document.getElementById('db-storage-msg').style.display = 'none';
    document.getElementById('db-storage-wrap').style.display = 'block';
    var canvas = document.getElementById('chart-storage-db');
    if (chartStorageDb) { chartStorageDb.destroy(); chartStorageDb = null; }
    chartStorageDb = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{ label: 'GB acumulados (total)', data: gbData, borderColor: '#0A0A0A', backgroundColor: 'rgba(10,10,10,0.06)', fill: true, borderWidth: 2, pointRadius: 3, tension: 0.3 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: '#F0F0F0' }, ticks: { font: { size: 11 }, callback: function(v) { return v + ' GB'; } } }
        }
      }
    });
    renderTypeCards(latestByType);
  } catch(e) { document.getElementById('db-storage-msg').textContent = 'Error: ' + e.message; }
}

function renderTypeCards(latestByType) {
  var el = document.getElementById('db-type-cards');
  if (!el) return;
  el.innerHTML = TYPE_KEYS.map(function(t) {
    var bytes = latestByType[t] || 0;
    var gb = (bytes / 1024 / 1024 / 1024).toFixed(3);
    var mb = (bytes / 1024 / 1024).toFixed(1);
    var val = parseFloat(gb) >= 0.001 ? gb + ' GB' : mb + ' MB';
    return '<div class="type-stat"><div class="type-stat-label"><span class="type-stat-dot" style="background:' + SOURCE_COLORS[t] + '"></span>' + TYPE_LABELS[t] + '</div><div class="type-stat-val">' + val + '</div><div class="type-stat-sub">acumulado al día</div></div>';
  }).join('');
}

/* ═══ FILTER / SORT / TABLE ═══ */
function populateSourceFilter() {
  var sources = [...new Set(state.allNews.map(function(n) { return n.source_name; }))].sort();
  var sel = document.getElementById('filter-source');
  var cur = sel.value;
  sel.innerHTML = '<option value="">Todas</option>';
  sources.forEach(function(s) { var o = document.createElement('option'); o.value = s; o.textContent = s; if (s === cur) o.selected = true; sel.appendChild(o); });
}

function applyFilters() {
  state.search = document.getElementById('search-input').value.toLowerCase().trim();
  state.source = document.getElementById('filter-source').value;
  state.type   = document.getElementById('filter-type').value;
  state.from   = document.getElementById('filter-from').value;
  state.to     = document.getElementById('filter-to').value;
  var base = state.allNews;
  if (state.view !== 'all') base = base.filter(function(n) { return n.source_type === state.view; });
  if (state.search) base = base.filter(function(n) { return n.title.toLowerCase().includes(state.search) || (n.description || '').toLowerCase().includes(state.search); });
  if (state.source) base = base.filter(function(n) { return n.source_name === state.source; });
  if (state.type)   base = base.filter(function(n) { return n.source_type === state.type; });
  if (state.from)   base = base.filter(function(n) { return n.published_at >= state.from; });
  if (state.to)     base = base.filter(function(n) { return n.published_at <= state.to + 'T23:59:59'; });
  base = sortNews(base);
  state.filtered = base;
  state.page = 0;
  renderTable();
}

function sortNews(arr) {
  return [...arr].sort(function(a, b) {
    var va = a[state.sort] || '', vb = b[state.sort] || '';
    if (state.sort === 'published_at') { va = va || a.created_at; vb = vb || b.created_at; }
    if (state.sort === 'source') { va = a.source_name; vb = b.source_name; }
    var cmp = String(va).localeCompare(String(vb), 'es', { numeric: true });
    return state.dir === 'asc' ? cmp : -cmp;
  });
}

function renderTable() {
  var tbody = document.getElementById('news-tbody');
  var start = state.page * PAGE_SIZE;
  var slice = state.filtered.slice(start, start + PAGE_SIZE);
  document.getElementById('results-count').textContent =
    state.filtered.length === state.allNews.length
      ? state.filtered.length + ' noticias'
      : state.filtered.length + ' de ' + state.allNews.length;
  if (slice.length === 0) {
    tbody.innerHTML = \`<tr><td colspan="6"><div class="state-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <p>Sin resultados</p><small>Prueba con otros filtros</small></div></td></tr>\`;
  } else {
    tbody.innerHTML = slice.map(function(n) {
      var date = n.published_at ? formatDate(n.published_at) : '—';
      var linkCell = n.url ? \`<a href="\${escHtml(n.url)}" target="_blank" style="display:inline-block;padding:4px 10px;border:1px solid #E5E7EB;border-radius:5px;font-size:11px;color:#555;text-decoration:none;background:#fff;white-space:nowrap">Ver &rarr;</a>\` : '—';
      return \`<tr>
        <td><div style="display:flex;align-items:center;gap:8px;">
          <img src="\${n.source_icon || ''}" alt="\${escHtml(n.source_name)}" style="width:28px;height:28px;object-fit:contain;border-radius:6px;background:#f5f5f5;padding:2px;" onerror="this.style.display='none'">
          <span style="font-size:12px;font-weight:600;color:var(--text-primary)">\${escHtml(n.source_name)}</span>
        </div></td>
        <td style="max-width:480px;white-space:normal;line-height:1.5">
          <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">\${escHtml(n.title)}</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.4">\${escHtml(stripHtml(n.description || ''))}</div>
        </td>
        <td style="white-space:nowrap"><span class="type-badge">\${TYPE_LABELS[n.source_type] || n.source_type}</span></td>
        <td style="white-space:nowrap"><span style="display:inline-flex;align-items:center;gap:5px;background:#F5F5F5;color:#666;font-size:11px;font-weight:500;padding:3px 8px;border-radius:4px"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#D1D5DB;flex-shrink:0"></span>Pendiente</span></td>
        <td class="date-cell" style="white-space:nowrap">\${date}</td>
        <td style="white-space:nowrap">\${linkCell}</td>
      </tr>\`;
    }).join('');
  }
  renderPagination();
}

function renderPagination() {
  var total = state.filtered.length;
  var pages = Math.ceil(total / PAGE_SIZE);
  var pag = document.getElementById('pagination');
  var info = document.getElementById('pagination-info');
  var btns = document.getElementById('pagination-btns');
  if (pages <= 1) { pag.style.display = 'none'; return; }
  pag.style.display = 'flex';
  var s = state.page * PAGE_SIZE + 1, e = Math.min((state.page + 1) * PAGE_SIZE, total);
  info.textContent = s + '–' + e + ' de ' + total;
  var html = \`<button class="page-btn" onclick="goPage(\${state.page-1})" \${state.page===0?'disabled':''}>&#8592;</button>\`;
  for (var i = 0; i < pages; i++) {
    if (pages > 7 && i > 1 && i < pages-2 && Math.abs(i - state.page) > 1) {
      if (i === 2 || i === pages-3) html += '<span style="padding:0 4px;color:var(--text-tertiary)">…</span>';
      continue;
    }
    html += \`<button class="page-btn\${i===state.page?' active':''}" onclick="goPage(\${i})">\${i+1}</button>\`;
  }
  html += \`<button class="page-btn" onclick="goPage(\${state.page+1})" \${state.page>=pages-1?'disabled':''}>&#8594;</button>\`;
  btns.innerHTML = html;
}

function goPage(p) {
  state.page = p;
  renderTable();
  document.querySelector('.table-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setView(view) {
  if (currentSection !== 'noticias') setSection('noticias');
  state.view = view;
  document.querySelectorAll('.nav-item').forEach(function(el) { el.classList.remove('active'); });
  var navEl = document.getElementById('nav-' + view) || document.getElementById('nav-all');
  if (navEl) navEl.classList.add('active');
  var labels = { all: 'Todas las noticias', prensa_digital: 'Prensa digital', prensa_escrita: 'Prensa escrita', television: 'Televisión', radio: 'Radio' };
  document.getElementById('breadcrumb-current').textContent = labels[view] || view;
  document.getElementById('filter-type').value = view === 'all' ? '' : view;
  applyFilters();
}

function setSort(field) {
  if (state.sort === field) { state.dir = state.dir === 'asc' ? 'desc' : 'asc'; }
  else { state.sort = field; state.dir = field === 'published_at' ? 'desc' : 'asc'; }
  ['title','source','published_at'].forEach(function(f) {
    var el = document.getElementById('si-' + f);
    if (!el) return;
    el.textContent = f === state.sort ? (state.dir === 'asc' ? '↑' : '↓') : '↕';
    el.classList.toggle('active', f === state.sort);
  });
  state.filtered = sortNews(state.filtered);
  state.page = 0;
  renderTable();
}

function onSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(applyFilters, 300); }

function clearFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-source').value = '';
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-from').value = '';
  document.getElementById('filter-to').value = '';
  state.view = 'all';
  document.querySelectorAll('.nav-item').forEach(function(el, i) { el.classList.toggle('active', i === 0); });
  document.getElementById('breadcrumb-current').textContent = 'Todas las noticias';
  applyFilters();
}

function exportCSV() {
  var rows = [['Título','Fuente','Tipo','Fecha','URL']];
  state.filtered.forEach(function(n) {
    rows.push([
      '"' + (n.title||'').replace(/"/g,'""') + '"',
      '"' + n.source_name + '"',
      '"' + (TYPE_LABELS[n.source_type]||n.source_type) + '"',
      n.published_at ? new Date(n.published_at).toLocaleDateString('es') : '',
      n.url || ''
    ]);
  });
  var csv = rows.map(function(r) { return r.join(','); }).join('\\n');
  var blob = new Blob(['\\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'whalemetric-noticias-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
}

function openTranscriptions() { alert('Próximamente: visor de transcripciones'); }

function showLoading() {
  document.getElementById('news-tbody').innerHTML = '<tr><td colspan="6"><div class="state-box"><div class="spinner"></div><p style="margin-top:12px">Cargando noticias...</p></div></td></tr>';
}

function showError(msg) {
  document.getElementById('news-tbody').innerHTML = \`<tr><td colspan="6"><div class="state-box">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p>Error al cargar</p><small>\${escHtml(msg)}</small></div></td></tr>\`;
}

function formatDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  return d.toLocaleDateString('es', { day:'2-digit', month:'short', year:'numeric' }) + ' ' +
         d.toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' });
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
}
function truncate(str, n) { return str && str.length > n ? str.slice(0, n) + '…' : str; }
function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

loadData();
</script>
</body>
</html>
`;

export async function GET() {
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
