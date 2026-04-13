import { NextResponse } from 'next/server';

const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WhaleMetric — Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #FFFFFF;
    --bg-subtle: #FAFAFA;
    --bg-muted: #F5F5F5;
    --border: #E5E7EB;
    --border-light: #F0F0F0;
    --text-primary: #0A0A0A;
    --text-secondary: #6B7280;
    --text-tertiary: #9CA3AF;
    --accent: #0A0A0A;
    --accent-hover: #171717;
    --green: #10B981;
    --green-bg: #ECFDF5;
    --green-text: #065F46;
    --red: #EF4444;
    --red-bg: #FEF2F2;
    --red-text: #991B1B;
    --amber: #F59E0B;
    --amber-bg: #FFFBEB;
    --amber-text: #92400E;
    --blue: #3B82F6;
    --blue-bg: #EFF6FF;
    --blue-text: #1E40AF;
    --purple: #8B5CF6;
    --purple-bg: #F5F3FF;
    --purple-text: #5B21B6;
    --sidebar-w: 260px;
    --header-h: 56px;
    --radius: 8px;
    --radius-sm: 6px;
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
  .logo-icon { width: 28px; height: 28px; background: var(--accent); border-radius: 7px; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 700; letter-spacing: -0.5px; }
  .logo-text { font-size: 15px; font-weight: 600; letter-spacing: -0.3px; }
  .logo-text span { color: var(--text-tertiary); font-weight: 400; font-size: 12px; margin-left: 4px; }

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

  .admin-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: var(--purple-bg); color: var(--purple-text); border-radius: 4px; font-size: 10px; font-weight: 600; letter-spacing: 0.3px; margin: 8px 16px 0; }

  .sidebar-footer { padding: 14px 16px; border-top: 1px solid var(--border-light); }
  .user-block { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius); cursor: pointer; transition: background 150ms ease; }
  .user-block:hover { background: var(--bg-subtle); }
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
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
  .btn-secondary { background: var(--bg); color: var(--text-secondary); border-color: var(--border); }
  .btn-secondary:hover { background: var(--bg-subtle); color: var(--text-primary); }
  .btn svg { width: 14px; height: 14px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

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

  /* ═══ FILTROS ═══ */
  .filters-bar { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .filter-group { display: flex; align-items: center; gap: 6px; }
  .filter-label { font-size: 12px; color: var(--text-tertiary); font-weight: 500; white-space: nowrap; }

  .filter-input {
    height: 34px; padding: 0 10px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    font-size: 13px; font-family: var(--font); color: var(--text-primary); background: var(--bg);
    transition: border-color 150ms ease; outline: none;
  }
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
  thead th.sorted { color: var(--text-primary); }
  .sort-icon { display: inline-block; margin-left: 4px; opacity: 0.4; font-size: 10px; }
  .sort-icon.active { opacity: 1; }

  tbody td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid var(--border-light); color: var(--text-secondary); vertical-align: middle; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: var(--bg-subtle); }

  .td-title { color: var(--text-primary) !important; font-weight: 500; max-width: 380px; }
  .td-title a { color: inherit; text-decoration: none; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .td-title a:hover { color: var(--blue); text-decoration: underline; }

  .source-pill { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); background: var(--bg-muted); padding: 3px 8px; border-radius: 4px; white-space: nowrap; }
  .source-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  .type-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; white-space: nowrap; }
  .type-prensa_digital  { background: var(--blue-bg);   color: var(--blue-text); }
  .type-prensa_escrita  { background: var(--amber-bg);  color: var(--amber-text); }
  .type-television      { background: var(--purple-bg); color: var(--purple-text); }
  .type-radio           { background: var(--green-bg);  color: var(--green-text); }

  .date-cell { font-family: var(--font-mono); font-size: 12px; white-space: nowrap; }

  /* ═══ EMPTY / LOADING ═══ */
  .state-box { padding: 60px 20px; text-align: center; color: var(--text-tertiary); }
  .state-box svg { width: 36px; height: 36px; margin: 0 auto 12px; opacity: 0.3; display: block; }
  .state-box p { font-size: 14px; }
  .state-box small { font-size: 12px; margin-top: 4px; display: block; }

  .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto; }

  /* ═══ PAGINATION ═══ */
  .pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--border-light); background: var(--bg-subtle); }
  .pagination-info { font-size: 12px; color: var(--text-tertiary); }
  .pagination-btns { display: flex; gap: 4px; }
  .page-btn { height: 30px; min-width: 30px; padding: 0 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); font-size: 12px; font-family: var(--font); color: var(--text-secondary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 150ms ease; }
  .page-btn:hover:not(:disabled) { background: var(--bg-subtle); color: var(--text-primary); }
  .page-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
  .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ═══ ANIMATIONS ═══ */
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .kpi-card:nth-child(1) { animation-delay: 0ms; }
  .kpi-card:nth-child(2) { animation-delay: 50ms; }
  .kpi-card:nth-child(3) { animation-delay: 100ms; }
  .kpi-card:nth-child(4) { animation-delay: 150ms; }

  /* ═══ RESPONSIVE ═══ */
  .mobile-menu-btn { display: none; }
  .sidebar-overlay { display: none; }
  @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 35; opacity: 0; pointer-events: none; transition: opacity 300ms; }
    .sidebar-overlay.open { opacity: 1; pointer-events: all; }
    .main { margin-left: 0; }
    .mobile-menu-btn { display: flex; background: none; border: none; cursor: pointer; color: var(--text-primary); padding: 4px; }
    .content { padding: 16px; }
    .header { padding: 0 16px; }
    .filters-bar { gap: 8px; }
    .search-input { width: 160px; }
  }
</style>
</head>
<body>
<div class="app">
  <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

  <!-- ═══ SIDEBAR ═══ -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <a href="#" class="logo">
        <div class="logo-icon">W</div>
        <div class="logo-text">WhaleMetric <span>admin</span></div>
      </a>
    </div>

    <div class="admin-badge">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Acceso total
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
      <a class="nav-item active" href="#" onclick="setView('all')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Todas las noticias
        <span class="nav-badge" id="badge-all">—</span>
      </a>
      <a class="nav-item" href="#" onclick="setView('prensa_digital')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2"/></svg>
        Prensa digital
        <span class="nav-badge" id="badge-prensa_digital">—</span>
      </a>
      <a class="nav-item" href="#" onclick="setView('prensa_escrita')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>
        Prensa escrita
        <span class="nav-badge" id="badge-prensa_escrita">—</span>
      </a>
      <a class="nav-item" href="#" onclick="setView('television')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
        Televisión
        <span class="nav-badge" id="badge-television">—</span>
      </a>
      <a class="nav-item" href="#" onclick="setView('radio')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        Radio
        <span class="nav-badge" id="badge-radio">—</span>
      </a>

      <div class="nav-divider"></div>
      <div class="nav-section-label">Sistema</div>
      <a class="nav-item" href="https://supabase.com/dashboard/project/txxygcdafjcuyvvzbbnx" target="_blank">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        Supabase
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

  <!-- ═══ MAIN ═══ -->
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
        <button class="btn btn-secondary" onclick="exportCSV()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar CSV
        </button>
        <button class="btn btn-secondary" onclick="loadData()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Actualizar
        </button>
      </div>
    </header>

    <div class="content">
      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2"/></svg>
            Total noticias
          </div>
          <div class="kpi-value" id="kpi-total">—</div>
          <div class="kpi-footer" id="kpi-total-sub">Cargando...</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            Televisión
          </div>
          <div class="kpi-value" id="kpi-tv">—</div>
          <div class="kpi-footer">Noticias de TV</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
            Radio
          </div>
          <div class="kpi-value" id="kpi-radio">—</div>
          <div class="kpi-footer">Noticias de radio</div>
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
          <button class="btn btn-secondary" onclick="clearFilters()" style="padding:5px 10px;font-size:12px;">
            Limpiar
          </button>
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
                <th>Tipo</th>
                <th onclick="setSort('published_at')" id="th-published_at">Fecha <span class="sort-icon active" id="si-published_at">↓</span></th>
                <th>Enlace</th>
              </tr>
            </thead>
            <tbody id="news-tbody">
              <tr><td colspan="5"><div class="state-box"><div class="spinner"></div></td></tr>
            </tbody>
          </table>
        </div>
        <div class="pagination" id="pagination" style="display:none">
          <span class="pagination-info" id="pagination-info"></span>
          <div class="pagination-btns" id="pagination-btns"></div>
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
let state = {
  view: 'all',
  search: '',
  source: '',
  type: '',
  from: '',
  to: '',
  sort: 'published_at',
  dir: 'desc',
  page: 0,
  total: 0,
  allNews: [],
  filtered: [],
};

let searchTimeout = null;

const TYPE_LABELS = {
  prensa_digital: 'Prensa digital',
  prensa_escrita: 'Prensa escrita',
  television: 'Televisión',
  radio: 'Radio',
};

const SOURCE_COLORS = {
  prensa_digital: '#3B82F6',
  prensa_escrita: '#F59E0B',
  television: '#8B5CF6',
  radio: '#10B981',
};

async function loadData() {
  showLoading();
  try {
    const { data, error } = await db
      .from('news')
      .select(\`id, title, description, url, published_at, created_at, sources(name, type, icon_url)\`)
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('published_at', { ascending: false });

    if (error) throw error;

    state.allNews = (data || []).map(n => ({
      id: n.id,
      title: n.title,
      description: n.description,
      url: n.url,
      published_at: n.published_at,
      created_at: n.created_at,
      source_name: n.sources?.name || '—',
      source_type: n.sources?.type || '',
      source_icon: n.sources?.icon_url || '',
    }));

    updateKPIs();
    updateBadges();
    populateSourceFilter();
    applyFilters();
  } catch (e) {
    showError(e.message);
  }
}

function updateKPIs() {
  const all = state.allNews;
  document.getElementById('kpi-total').textContent = all.length;
  document.getElementById('kpi-total-sub').textContent = \`En \${new Set(all.map(n => n.source_name)).size} fuentes\`;
  document.getElementById('kpi-tv').textContent = all.filter(n => n.source_type === 'television').length;
  document.getElementById('kpi-radio').textContent = all.filter(n => n.source_type === 'radio').length;
  document.getElementById('kpi-sources').textContent = new Set(all.map(n => n.source_name)).size;
}

function updateBadges() {
  const counts = { all: state.allNews.length };
  ['prensa_digital','prensa_escrita','television','radio'].forEach(t => {
    counts[t] = state.allNews.filter(n => n.source_type === t).length;
  });
  Object.entries(counts).forEach(([k, v]) => {
    const el = document.getElementById(\`badge-\${k}\`);
    if (el) el.textContent = v;
  });
}

function populateSourceFilter() {
  const sources = [...new Set(state.allNews.map(n => n.source_name))].sort();
  const sel = document.getElementById('filter-source');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Todas</option>';
  sources.forEach(s => {
    const o = document.createElement('option');
    o.value = s; o.textContent = s;
    if (s === cur) o.selected = true;
    sel.appendChild(o);
  });
}

function applyFilters() {
  state.search = document.getElementById('search-input').value.toLowerCase().trim();
  state.source = document.getElementById('filter-source').value;
  state.type   = document.getElementById('filter-type').value;
  state.from   = document.getElementById('filter-from').value;
  state.to     = document.getElementById('filter-to').value;

  let base = state.allNews;

  if (state.view !== 'all') base = base.filter(n => n.source_type === state.view);
  if (state.search)  base = base.filter(n => n.title.toLowerCase().includes(state.search) || (n.description || '').toLowerCase().includes(state.search));
  if (state.source)  base = base.filter(n => n.source_name === state.source);
  if (state.type)    base = base.filter(n => n.source_type === state.type);
  if (state.from)    base = base.filter(n => n.published_at >= state.from);
  if (state.to)      base = base.filter(n => n.published_at <= state.to + 'T23:59:59');

  base = sortNews(base);
  state.filtered = base;
  state.page = 0;
  renderTable();
}

function sortNews(arr) {
  return [...arr].sort((a, b) => {
    let va = a[state.sort] || '', vb = b[state.sort] || '';
    if (state.sort === 'published_at') { va = va || a.created_at; vb = vb || b.created_at; }
    if (state.sort === 'source') { va = a.source_name; vb = b.source_name; }
    const cmp = String(va).localeCompare(String(vb), 'es', { numeric: true });
    return state.dir === 'asc' ? cmp : -cmp;
  });
}

function renderTable() {
  const tbody = document.getElementById('news-tbody');
  const start = state.page * PAGE_SIZE;
  const slice = state.filtered.slice(start, start + PAGE_SIZE);

  document.getElementById('results-count').textContent =
    state.filtered.length === state.allNews.length
      ? \`\${state.filtered.length} noticias\`
      : \`\${state.filtered.length} de \${state.allNews.length}\`;

  if (slice.length === 0) {
    tbody.innerHTML = \`<tr><td colspan="5"><div class="state-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <p>Sin resultados</p><small>Prueba con otros filtros</small>
    </div></td></tr>\`;
  } else {
    tbody.innerHTML = slice.map(n => {
      const date = n.published_at ? formatDate(n.published_at) : '—';
      return \`<tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="\${n.source_icon || ''}" alt="\${escHtml(n.source_name)}"
              style="width:28px;height:28px;object-fit:contain;border-radius:6px;background:#f5f5f5;padding:2px;"
              onerror="this.style.display='none'">
            <span style="font-size:12px;font-weight:500;color:var(--text-primary)">\${escHtml(n.source_name)}</span>
          </div>
        </td>
        <td style="max-width:480px;white-space:normal;line-height:1.5">
          <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">\${escHtml(n.title)}</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.4">\${escHtml(truncate(n.description || '', 150))}</div>
        </td>
        <td><span class="type-badge type-\${n.source_type}">\${TYPE_LABELS[n.source_type] || n.source_type}</span></td>
        <td class="date-cell">\${date}</td>
        <td>\${n.url ? \`<a href="\${escHtml(n.url)}" target="_blank" style="font-size:12px;color:var(--blue);text-decoration:none;white-space:nowrap;">Ver artículo →</a>\` : '—'}</td>
      </tr>\`;
    }).join('');
  }

  renderPagination();
}

function renderPagination() {
  const total = state.filtered.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const pag = document.getElementById('pagination');
  const info = document.getElementById('pagination-info');
  const btns = document.getElementById('pagination-btns');

  if (pages <= 1) { pag.style.display = 'none'; return; }
  pag.style.display = 'flex';

  const start = state.page * PAGE_SIZE + 1;
  const end = Math.min((state.page + 1) * PAGE_SIZE, total);
  info.textContent = \`\${start}–\${end} de \${total}\`;

  let html = \`<button class="page-btn" onclick="goPage(\${state.page-1})" \${state.page===0?'disabled':''}>←</button>\`;
  for (let i = 0; i < pages; i++) {
    if (pages > 7 && i > 1 && i < pages-2 && Math.abs(i - state.page) > 1) {
      if (i === 2 || i === pages-3) html += \`<span style="padding:0 4px;color:var(--text-tertiary)">…</span>\`;
      continue;
    }
    html += \`<button class="page-btn\${i===state.page?' active':''}" onclick="goPage(\${i})">\${i+1}</button>\`;
  }
  html += \`<button class="page-btn" onclick="goPage(\${state.page+1})" \${state.page>=pages-1?'disabled':''}>→</button>\`;
  btns.innerHTML = html;
}

function goPage(p) {
  state.page = p;
  renderTable();
  document.querySelector('.table-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setView(view) {
  state.view = view;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const labels = { all: 'Todas las noticias', prensa_digital: 'Prensa digital', prensa_escrita: 'Prensa escrita', television: 'Televisión', radio: 'Radio' };
  document.getElementById('breadcrumb-current').textContent = labels[view] || view;
  document.getElementById('filter-type').value = view === 'all' ? '' : view;
  applyFilters();
  return false;
}

function setSort(field) {
  if (state.sort === field) {
    state.dir = state.dir === 'asc' ? 'desc' : 'asc';
  } else {
    state.sort = field;
    state.dir = field === 'published_at' ? 'desc' : 'asc';
  }
  ['title','source','published_at'].forEach(f => {
    const el = document.getElementById(\`si-\${f}\`);
    if (!el) return;
    el.textContent = f === state.sort ? (state.dir === 'asc' ? '↑' : '↓') : '↕';
    el.classList.toggle('active', f === state.sort);
  });
  state.filtered = sortNews(state.filtered);
  state.page = 0;
  renderTable();
}

function onSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(applyFilters, 300);
}

function clearFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-source').value = '';
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-from').value = '';
  document.getElementById('filter-to').value = '';
  state.view = 'all';
  document.querySelectorAll('.nav-item').forEach((el,i) => el.classList.toggle('active', i===0));
  document.getElementById('breadcrumb-current').textContent = 'Todas las noticias';
  applyFilters();
}

function exportCSV() {
  const rows = [['Título','Fuente','Tipo','Fecha','URL']];
  state.filtered.forEach(n => {
    rows.push([
      \`"\${(n.title||'').replace(/"/g,'""')}"\`,
      \`"\${n.source_name}"\`,
      \`"\${TYPE_LABELS[n.source_type]||n.source_type}"\`,
      n.published_at ? new Date(n.published_at).toLocaleDateString('es') : '',
      n.url || ''
    ]);
  });
  const csv = rows.map(r => r.join(',')).join('\\n');
  const blob = new Blob(['\\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = \`whalemetric-noticias-\${new Date().toISOString().slice(0,10)}.csv\`;
  a.click();
}

function openAddSource() { alert('Próximamente: formulario para añadir fuente'); }
function openTranscriptions() { alert('Próximamente: visor de transcripciones'); }

function showLoading() {
  document.getElementById('news-tbody').innerHTML = \`<tr><td colspan="5"><div class="state-box"><div class="spinner"></div><p style="margin-top:12px">Cargando noticias...</p></div></td></tr>\`;
}

function showError(msg) {
  document.getElementById('news-tbody').innerHTML = \`<tr><td colspan="5"><div class="state-box">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p>Error al cargar</p><small>\${escHtml(msg)}</small>
  </div></td></tr>\`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day:'2-digit', month:'short', year:'numeric' }) + ' ' +
         d.toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' });
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
