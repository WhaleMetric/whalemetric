import { NextResponse } from 'next/server';

const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WhaleMetric — Gestionar Fuentes</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
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
    --shadow-md: 0 4px 16px rgba(0,0,0,0.12);
    --font: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }
  body { font-family: var(--font); background: var(--bg-subtle); color: var(--text-primary); -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.5; }
  .app { display: flex; min-height: 100vh; }

  /* ═══ SIDEBAR ═══ */
  .sidebar { width: var(--sidebar-w); background: var(--bg); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 40; transition: transform 300ms ease; }
  .sidebar-header { padding: 20px 20px 16px; border-bottom: 1px solid var(--border-light); }
  .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text-primary); }
  .sidebar-btn { margin: 12px 16px 0; padding: 9px 14px; background: var(--accent); color: white; border: none; border-radius: var(--radius); font-size: 13px; font-weight: 500; font-family: var(--font); cursor: pointer; display: flex; align-items: center; gap: 7px; transition: all 150ms ease; justify-content: center; text-decoration: none; }
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
  .nav-divider { height: 1px; background: var(--border-light); margin: 8px 16px; }
  .sidebar-footer { padding: 14px 16px; border-top: 1px solid var(--border-light); }
  .user-block { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius); cursor: pointer; transition: background 150ms ease; }
  .user-block:hover { background: var(--bg-subtle); }
  .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: white; flex-shrink: 0; }
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 13px; font-weight: 550; color: var(--text-primary); }
  .user-role { font-size: 11px; color: var(--purple-text); font-weight: 500; }
  .sidebar-overlay { display: none; }
  .mobile-menu-btn { display: none; }

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
  .content { flex: 1; padding: 28px; }
  .page-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; }
  .page-title { font-size: 22px; font-weight: 600; letter-spacing: -0.4px; }
  .page-subtitle { font-size: 13px; color: var(--text-tertiary); margin-top: 2px; }

  /* ═══ SEARCH + TABS ROW ═══ */
  .search-tabs-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .search-bar { position: relative; flex: 0 0 220px; }
  .search-bar svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-tertiary); pointer-events: none; }
  .search-bar input { width: 100%; height: 38px; padding: 0 14px 0 42px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 13px; font-family: var(--font); color: var(--text-primary); background: var(--bg); outline: none; transition: border-color 150ms ease; }
  .search-bar input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(10,10,10,0.06); }
  .search-bar input::placeholder { color: var(--text-tertiary); }
  .tabs { display: flex; gap: 2px; background: var(--bg-muted); border-radius: var(--radius); padding: 3px; flex: 1; }
  .tab { padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; color: var(--text-secondary); cursor: pointer; border: none; background: transparent; font-family: var(--font); transition: all 150ms ease; white-space: nowrap; }
  .tab:hover { color: var(--text-primary); }
  .tab.active { background: var(--bg); color: var(--text-primary); box-shadow: var(--shadow-xs); font-weight: 600; }

  /* ═══ GROUPS & CARDS ═══ */
  .group { margin-bottom: 32px; }
  .group-header { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-tertiary); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 8px; }
  .group-count { font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 10px; background: var(--bg-muted); color: var(--text-secondary); text-transform: none; letter-spacing: 0; }
  .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
  .source-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: box-shadow 150ms ease; animation: fadeIn 300ms ease both; }
  .source-card:hover { box-shadow: var(--shadow-sm); }
  .card-top { display: flex; align-items: center; gap: 12px; }
  .card-logo { width: 40px; height: 40px; border-radius: 8px; background: var(--bg-muted); object-fit: contain; padding: 4px; flex-shrink: 0; }
  .card-logo-placeholder { width: 40px; height: 40px; border-radius: 8px; background: var(--bg-muted); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: var(--text-tertiary); flex-shrink: 0; }
  .card-info { flex: 1; min-width: 0; }
  .card-name { font-size: 14px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-lang { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; display: flex; align-items: center; gap: 4px; }
  .card-bottom { display: flex; align-items: center; justify-content: space-between; }
  .badges-group { display: flex; gap: 4px; flex-wrap: wrap; }
  .btn-config { padding: 5px 10px; font-size: 12px; border-radius: 5px; background: transparent; color: var(--text-secondary); border: 1px solid var(--border); cursor: pointer; font-family: var(--font); font-weight: 500; transition: all 150ms ease; }
  .btn-config:hover { background: var(--bg-subtle); color: var(--text-primary); border-color: var(--text-secondary); }

  /* ═══ ESTADOS ═══ */
  .state-box { padding: 60px 20px; text-align: center; color: var(--text-tertiary); }
  .state-box svg { width: 36px; height: 36px; margin: 0 auto 12px; opacity: 0.3; display: block; }
  .state-box p { font-size: 14px; }
  .state-box small { font-size: 12px; margin-top: 4px; display: block; }
  .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.6s linear infinite; margin: 40px auto; }

  /* ═══ MODAL ═══ */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; pointer-events: none; transition: opacity 200ms ease; }
  .modal-overlay.open { opacity: 1; pointer-events: all; }
  .modal { background: var(--bg); border-radius: 12px; box-shadow: var(--shadow-md); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; animation: modalIn 200ms ease; }
  .modal-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .modal-title { font-size: 16px; font-weight: 600; letter-spacing: -0.3px; }
  .modal-close { width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); transition: all 150ms ease; flex-shrink: 0; }
  .modal-close:hover { background: var(--bg-muted); color: var(--text-primary); }
  .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-light); display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-label { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .form-label span { color: var(--text-tertiary); font-weight: 400; }
  .form-input { height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: var(--font); color: var(--text-primary); background: var(--bg); outline: none; transition: border-color 150ms ease; width: 100%; }
  .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(10,10,10,0.06); }
  .form-select { height: 38px; padding: 0 28px 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: var(--font); color: var(--text-primary); background: var(--bg); outline: none; transition: border-color 150ms ease; width: 100%; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
  .form-select:focus { border-color: var(--accent); }
  .modal-source-header { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
  .modal-source-logo { width: 40px; height: 40px; border-radius: 8px; background: var(--bg-muted); object-fit: contain; padding: 4px; }
  .modal-source-name { font-size: 15px; font-weight: 600; }
  .modal-source-type { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }
  .last-news-box { background: var(--bg-subtle); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 12px; font-size: 13px; }
  .last-news-box a { color: var(--blue); text-decoration: none; font-weight: 500; }
  .last-news-box a:hover { text-decoration: underline; }
  .last-news-date { font-size: 11px; color: var(--text-tertiary); margin-top: 4px; font-family: var(--font-mono); }
  .modal-link { font-size: 13px; color: var(--blue); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
  .modal-link:hover { text-decoration: underline; }
  .msg-success { background: var(--green-bg); color: var(--green-text); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; }
  .msg-error { background: var(--red-bg); color: var(--red-text); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; }

  /* ═══ ANIMACIONES ═══ */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }

  /* ═══ RESPONSIVE ═══ */
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 35; opacity: 0; pointer-events: none; transition: opacity 300ms; }
    .sidebar-overlay.open { opacity: 1; pointer-events: all; }
    .main { margin-left: 0; }
    .mobile-menu-btn { display: flex; background: none; border: none; cursor: pointer; color: var(--text-primary); padding: 4px; }
    .content { padding: 16px; }
    .header { padding: 0 16px; }
    .search-tabs-row { flex-direction: column; align-items: stretch; }
    .search-bar { flex: none; }
    .tabs { overflow-x: auto; }
  }
</style>
</head>
<body>
<div class="app">
  <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

  <!-- ═══ SIDEBAR ═══ -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <a href="/admin" class="logo">
        <img src="/imgs/LogoLargoWhaleMetric.png" alt="WhaleMetric" style="height:19px;width:auto;display:block;">
      </a>
    </div>

    <a href="/admin/fuentes" class="sidebar-btn" style="text-decoration:none">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07"/></svg>
      Gestionar fuentes
    </a>

    <button class="sidebar-btn-secondary" onclick="alert('Próximamente')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
      Ver Transcripciones
    </button>

    <nav class="sidebar-nav">
      <div class="nav-section-label">Vistas</div>
      <a class="nav-item" href="/admin">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Todas las noticias
      </a>
      <a class="nav-item" href="/admin?view=prensa_digital">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2"/></svg>
        Prensa digital
      </a>
      <a class="nav-item" href="/admin?view=prensa_escrita">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>
        Prensa escrita
      </a>
      <a class="nav-item" href="/admin?view=television">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
        Televisión
      </a>
      <a class="nav-item" href="/admin?view=radio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        Radio
      </a>
      <div class="nav-divider"></div>
      <div class="nav-section-label">Sistema</div>
      <a class="nav-item" href="/admin?section=bbdd">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        Base de datos
      </a>
      <a class="nav-item" href="/admin/flujos-locales">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
        Flujos en local
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
          <span class="breadcrumb-current">Gestionar fuentes</span>
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-secondary" onclick="loadSources()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Actualizar
        </button>
        <button class="btn btn-primary" onclick="openAddSourceModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Añadir fuente
        </button>
      </div>
    </header>

    <div class="content">
      <div class="page-header">
        <div>
          <div class="page-title">Gestionar fuentes</div>
          <div class="page-subtitle" id="subtitle">Cargando...</div>
        </div>
      </div>

      <div class="search-tabs-row">
        <div class="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="search-input" placeholder="Buscar fuente..." oninput="onSearch()">
        </div>
        <div class="tabs">
          <button class="tab active" onclick="setTab('all', this)">Todas</button>
          <button class="tab" onclick="setTab('prensa_digital', this)">Prensa digital</button>
          <button class="tab" onclick="setTab('prensa_escrita', this)">Prensa escrita</button>
          <button class="tab" onclick="setTab('television', this)">Televisión</button>
          <button class="tab" onclick="setTab('radio', this)">Radio</button>
        </div>
      </div>

      <div id="content-area"><div class="spinner"></div></div>
    </div>
  </main>
</div>

<!-- ═══ MODAL AÑADIR FUENTE ═══ -->
<div class="modal-overlay" id="modalAdd">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Añadir fuente</div>
      <button class="modal-close" onclick="closeModal('modalAdd')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div id="msg-add"></div>
      <div class="form-group">
        <label class="form-label">Nombre comercial</label>
        <input type="text" id="add-name" class="form-input" placeholder="Ej: El País">
      </div>
      <div class="form-group">
        <label class="form-label">Tipo</label>
        <select id="add-type" class="form-select" onchange="updateUrlLabel()">
          <option value="prensa_digital">Prensa digital</option>
          <option value="prensa_escrita">Prensa escrita</option>
          <option value="television">Televisión</option>
          <option value="radio">Radio</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Ámbito</label>
        <select id="add-scope" class="form-select">
          <option value="national">Nacional</option>
          <option value="regional">Regional / Autonómico</option>
          <option value="international">Internacional</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Idioma</label>
        <select id="add-lang" class="form-select">
          <option value="es">Español</option>
          <option value="ca">Catalán</option>
          <option value="en">Inglés</option>
          <option value="fr">Francés</option>
          <option value="ar">Árabe</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" id="add-url-label">URL RSS</label>
        <input type="text" id="add-url" class="form-input" placeholder="https://...">
      </div>
      <div class="form-group">
        <label class="form-label">Logo <span>(opcional)</span></label>
        <input type="file" id="add-logo" accept="image/png,image/jpeg,image/webp" class="form-input" style="padding:6px;" onchange="previewLogo(this)">
        <div id="logo-preview" style="display:none;margin-top:8px;">
          <img id="logo-preview-img" style="width:48px;height:48px;object-fit:contain;border-radius:6px;background:#f5f5f5;padding:4px;">
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modalAdd')">Cancelar</button>
      <button class="btn btn-primary" onclick="saveNewSource()">Añadir fuente</button>
    </div>
  </div>
</div>

<!-- ═══ MODAL CONFIGURAR FUENTE ═══ -->
<div class="modal-overlay" id="modalConfig">
  <div class="modal">
    <div class="modal-header">
      <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
        <img id="cfg-logo" src="" alt="" class="modal-source-logo" onerror="this.style.display='none'">
        <div>
          <div class="modal-source-name" id="cfg-name">—</div>
          <div class="modal-source-type" id="cfg-type">—</div>
        </div>
      </div>
      <button class="modal-close" onclick="closeModal('modalConfig')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div id="msg-config"></div>
      <div class="form-group">
        <label class="form-label" id="cfg-url-label">URL RSS / M3U8</label>
        <input type="text" id="cfg-url" class="form-input" placeholder="https://...">
      </div>
      <div>
        <a href="https://eu2.make.com/903093/scenarios?folderId=496683" target="_blank" class="modal-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          Ver escenarios en Make →
        </a>
      </div>
      <div class="form-group">
        <div class="form-label">Última noticia indexada</div>
        <div class="last-news-box" id="cfg-last-news">Cargando...</div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modalConfig')">Cerrar</button>
      <button class="btn btn-primary" onclick="saveConfig()">Guardar</button>
    </div>
  </div>
</div>

<script>
const SUPABASE_URL = 'https://txxygcdafjcuyvvzbbnx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4eHlnY2RhZmpjdXl2dnpiYm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTA1NjEsImV4cCI6MjA5MTU4NjU2MX0.JCeVp6a3bRKbSPkG_aoYvVwMIFTFn7-IFaXjaeZ0Ik0';
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const INTERNACIONAL_NAMES = ['Al Jazeera','CNN','France 24','BBC'];
const AUTONOMICO_NAMES = ['TV3','8TV','RAC1','Catalunya Radio','CatalunyaPress','Nació Digital','Vilaweb','ARA','El Nacional','Tot Badalona','La Ciutat','El Mon','Puntauvui'];

const LANG_FLAGS = {
  ca: '<img src="/imgs/cat.png" style="width:12px;height:12px;border-radius:0;object-fit:cover;flex-shrink:0;vertical-align:middle;margin-right:4px"> Catalán',
  es: '<img src="/imgs/esp.png" style="width:12px;height:12px;border-radius:0;object-fit:cover;flex-shrink:0;vertical-align:middle;margin-right:4px"> Español',
  en: '<img src="/imgs/usa.png" style="width:12px;height:12px;border-radius:0;object-fit:cover;flex-shrink:0;vertical-align:middle;margin-right:4px"> Inglés',
  fr: '<img src="/imgs/fra.png" style="width:12px;height:12px;border-radius:0;object-fit:cover;flex-shrink:0;vertical-align:middle;margin-right:4px"> Francés',
  ar: '<img src="/imgs/aue.png" style="width:12px;height:12px;border-radius:0;object-fit:cover;flex-shrink:0;vertical-align:middle;margin-right:4px"> Árabe',
};
const LANG_FALLBACK = {
  'TV3':'ca','RAC1':'ca','Catalunya Radio':'ca','CatalunyaPress':'ca',
  'Nació Digital':'ca','Vilaweb':'ca','ARA':'ca','El Nacional':'ca',
  'El Mon':'ca','Puntauvui':'ca','La Ciutat':'ca','8TV':'ca',
  'CNN':'en','BBC':'en','France 24':'fr','Al Jazeera':'ar',
};
const TYPE_LABELS = { prensa_digital:'Prensa digital', prensa_escrita:'Prensa escrita', television:'Televisión', radio:'Radio' };
const SCOPE_ORDER = ['international','regional','national'];
const SCOPE_LABELS = { international:'Internacionales', regional:'Regionales / Autonómicos', national:'Estatales' };

let allSources = [];
let currentTab = 'all';
let searchQuery = '';
let searchTimeout = null;
let currentCfgId = null;

function getScope(s) {
  if (s.scope) return s.scope;
  if (INTERNACIONAL_NAMES.some(n => s.name.toLowerCase().includes(n.toLowerCase()))) return 'international';
  if (AUTONOMICO_NAMES.some(n => s.name.toLowerCase().includes(n.toLowerCase()))) return 'regional';
  return 'national';
}
function getLang(s) {
  const code = s.language_code || LANG_FALLBACK[s.name] || 'es';
  return LANG_FLAGS[code] || LANG_FLAGS['es'];
}

async function loadSources() {
  document.getElementById('content-area').innerHTML = '<div class="spinner"></div>';
  try {
    const { data, error } = await db.from('sources').select('*').order('name');
    if (error) throw error;
    allSources = data || [];
    document.getElementById('subtitle').textContent = allSources.length + ' fuentes en total';
    render();
  } catch(e) {
    document.getElementById('content-area').innerHTML =
      '<div class="state-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><p>Error al cargar</p><small>' + escHtml(e.message) + '</small></div>';
  }
}

function setTab(tab, el) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  render();
}
function onSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
    render();
  }, 200);
}

function render() {
  let sources = allSources;
  if (currentTab !== 'all') sources = sources.filter(s => s.type === currentTab);
  if (searchQuery) sources = sources.filter(s => s.name.toLowerCase().includes(searchQuery));
  const groups = { international:[], regional:[], national:[] };
  sources.forEach(s => { const sc = getScope(s); (groups[sc] || groups.national).push(s); });
  const total = sources.length;
  document.getElementById('subtitle').textContent = total + ' fuente' + (total !== 1 ? 's' : '') + (searchQuery || currentTab !== 'all' ? ' (filtradas)' : ' en total');
  if (total === 0) {
    document.getElementById('content-area').innerHTML = '<div class="state-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p>Sin resultados</p><small>Prueba con otros filtros</small></div>';
    return;
  }
  let html = '';
  let delay = 0;
  SCOPE_ORDER.forEach(key => {
    const items = groups[key];
    if (!items.length) return;
    html += '<div class="group"><div class="group-header">' + SCOPE_LABELS[key] + ' <span class="group-count">' + items.length + '</span></div><div class="cards-grid">';
    items.forEach(s => {
      const lang = getLang(s);
      const hasIcon = !!s.icon_url;
      const logoHtml = hasIcon
        ? '<img class="card-logo" src="' + escHtml(s.icon_url) + '" alt="' + escHtml(s.name) + '" onerror="this.style.display=\`none\`;this.nextElementSibling.style.display=\`flex\`"><div class="card-logo-placeholder" style="display:none">' + escHtml(s.name.charAt(0).toUpperCase()) + '</div>'
        : '<div class="card-logo-placeholder">' + escHtml(s.name.charAt(0).toUpperCase()) + '</div>';
      const isMedia = s.type === 'television' || s.type === 'radio';
      const badge = isMedia
        ? '<div class="badges-group"><span style="display:inline-flex;align-items:center;gap:5px;background:#F5F5F5;color:#444;font-size:11px;font-weight:500;padding:3px 8px;border-radius:4px;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10B981;flex-shrink:0;"></span>Stream OK</span><span style="display:inline-flex;align-items:center;gap:5px;background:#F5F5F5;color:#444;font-size:11px;font-weight:500;padding:3px 8px;border-radius:4px;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10B981;flex-shrink:0;"></span>Text OK</span></div>'
        : (hasIcon ? '<span style="display:inline-flex;align-items:center;gap:5px;background:#F5F5F5;color:#444;font-size:11px;font-weight:500;padding:3px 8px;border-radius:4px;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10B981;flex-shrink:0;"></span>RSS OK</span>' : '<span style="display:inline-flex;align-items:center;gap:5px;background:#F5F5F5;color:#999;font-size:11px;font-weight:500;padding:3px 8px;border-radius:4px;">Sin configurar</span>');
      html += '<div class="source-card" style="animation-delay:' + delay + 'ms">'
        + '<div class="card-top">' + logoHtml
        + '<div class="card-info"><div class="card-name">' + escHtml(s.name) + '</div>'
        + '<div class="card-lang">' + lang + '</div></div></div>'
        + '<div class="card-bottom">' + badge
        + '<button class="btn-config" onclick="openConfigModal(' + JSON.stringify(s) + ')">Configurar</button>'
        + '</div></div>';
      delay = (delay + 30) % 300;
    });
    html += '</div></div>';
  });
  document.getElementById('content-area').innerHTML = html;
}

/* ═══ MODAL AÑADIR ═══ */
function openAddSourceModal() {
  document.getElementById('add-name').value = '';
  document.getElementById('add-type').value = 'prensa_digital';
  document.getElementById('add-scope').value = 'national';
  document.getElementById('add-lang').value = 'es';
  document.getElementById('add-url').value = '';
  document.getElementById('add-logo').value = '';
  document.getElementById('logo-preview').style.display = 'none';
  document.getElementById('logo-preview-img').src = '';
  document.getElementById('msg-add').innerHTML = '';
  updateUrlLabel();
  openModal('modalAdd');
}
function previewLogo(input) {
  const file = input.files && input.files[0];
  if (!file) { document.getElementById('logo-preview').style.display = 'none'; return; }
  const url = URL.createObjectURL(file);
  document.getElementById('logo-preview-img').src = url;
  document.getElementById('logo-preview').style.display = 'block';
}
function updateUrlLabel() {
  const t = document.getElementById('add-type').value;
  document.getElementById('add-url-label').textContent = (t === 'television' || t === 'radio') ? 'URL M3U8' : 'URL RSS';
}
async function saveNewSource() {
  const name = document.getElementById('add-name').value.trim();
  const type = document.getElementById('add-type').value;
  const scope = document.getElementById('add-scope').value;
  const language_code = document.getElementById('add-lang').value;
  const website = document.getElementById('add-url').value.trim();
  if (!name) { showMsg('msg-add', 'error', 'El nombre es obligatorio.'); return; }
  let icon_url = null;
  const fileInput = document.getElementById('add-logo');
  const file = fileInput.files && fileInput.files[0];
  if (file) {
    try {
      const ext = file.name.split('.').pop();
      const fileName = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now() + '.' + ext;
      const { error: upErr } = await db.storage.from('logos').upload(fileName, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = db.storage.from('logos').getPublicUrl(fileName);
      icon_url = urlData.publicUrl;
    } catch(e) { showMsg('msg-add', 'error', 'Error subiendo logo: ' + e.message); return; }
  }
  try {
    const { error } = await db.from('sources').insert({ name, type, scope, language_code, website, icon_url });
    if (error) throw error;
    showMsg('msg-add', 'success', 'Fuente añadida correctamente.');
    setTimeout(() => { closeModal('modalAdd'); loadSources(); }, 1200);
  } catch(e) { showMsg('msg-add', 'error', e.message); }
}

/* ═══ MODAL CONFIGURAR ═══ */
function openConfigModal(s) {
  currentCfgId = s.id;
  document.getElementById('cfg-name').textContent = s.name;
  document.getElementById('cfg-type').textContent = TYPE_LABELS[s.type] || s.type;
  document.getElementById('cfg-logo').src = s.icon_url || '';
  document.getElementById('cfg-url').value = s.website || '';
  const isMedia = s.type === 'television' || s.type === 'radio';
  document.getElementById('cfg-url-label').textContent = isMedia ? 'URL M3U8' : 'URL RSS';
  document.getElementById('msg-config').innerHTML = '';
  document.getElementById('cfg-last-news').innerHTML = 'Cargando...';
  openModal('modalConfig');
  loadLastNews(s.id);
}
async function loadLastNews(sourceId) {
  try {
    const { data, error } = await db
      .from('news')
      .select('title, url, published_at')
      .eq('source_id', sourceId)
      .order('published_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    if (!data || data.length === 0) {
      document.getElementById('cfg-last-news').innerHTML = '<span style="color:var(--text-tertiary)">Sin noticias indexadas aún.</span>';
      return;
    }
    const n = data[0];
    const date = n.published_at ? new Date(n.published_at).toLocaleDateString('es', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
    document.getElementById('cfg-last-news').innerHTML =
      (n.url ? '<a href="' + escHtml(n.url) + '" target="_blank">' + escHtml(n.title) + '</a>' : escHtml(n.title))
      + '<div class="last-news-date">' + date + '</div>';
  } catch(e) {
    document.getElementById('cfg-last-news').innerHTML = '<span style="color:var(--red-text)">Error: ' + escHtml(e.message) + '</span>';
  }
}
async function saveConfig() {
  const website = document.getElementById('cfg-url').value.trim();
  try {
    const { error } = await db.from('sources').update({ website }).eq('id', currentCfgId);
    if (error) throw error;
    showMsg('msg-config', 'success', 'Guardado correctamente.');
    const src = allSources.find(s => s.id === currentCfgId);
    if (src) src.website = website;
    setTimeout(() => document.getElementById('msg-config').innerHTML = '', 2000);
  } catch(e) { showMsg('msg-config', 'error', e.message); }
}

/* ═══ UTILS ═══ */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function showMsg(elId, type, text) {
  document.getElementById(elId).innerHTML = '<div class="' + (type === 'success' ? 'msg-success' : 'msg-error') + '">' + escHtml(text) + '</div>';
}
function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

loadSources();
</script>
</body>
</html>
`;

export async function GET() {
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
