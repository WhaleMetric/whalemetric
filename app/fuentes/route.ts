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
  .btn-secondary { background: var(--bg); color: var(--text-secondary); border-color: var(--border); }
  .btn-secondary:hover { background: var(--bg-subtle); color: var(--text-primary); }
  .btn svg { width: 14px; height: 14px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
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

  /* ═══ TABS ═══ */
  .tabs { display: flex; gap: 2px; background: var(--bg-muted); border-radius: var(--radius); padding: 3px; flex: 1; width: auto; }
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
  .card-lang { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }
  .card-bottom { display: flex; align-items: center; justify-content: space-between; }
  .badge-ok { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; background: var(--green-bg); color: var(--green-text); }
  .badge-ok::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
  .badge-none { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 4px; background: var(--bg-muted); color: var(--text-tertiary); }
  .badge-stream { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; background: var(--purple-bg); color: var(--purple-text); }
  .badge-stream::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--purple); }
  .badge-text { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; background: var(--blue-bg); color: var(--blue-text); }
  .badge-text::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--blue); }
  .badges-group { display: flex; gap: 4px; flex-wrap: wrap; }
  .btn-config { padding: 5px 10px; font-size: 12px; border-radius: 5px; background: transparent; color: var(--text-secondary); border: 1px solid var(--border); cursor: pointer; font-family: var(--font); font-weight: 500; transition: all 150ms ease; }
  .btn-config:hover { background: var(--bg-subtle); color: var(--text-primary); border-color: var(--text-secondary); }

  /* ═══ ESTADOS ═══ */
  .state-box { padding: 60px 20px; text-align: center; color: var(--text-tertiary); }
  .state-box svg { width: 36px; height: 36px; margin: 0 auto 12px; opacity: 0.3; display: block; }
  .state-box p { font-size: 14px; }
  .state-box small { font-size: 12px; margin-top: 4px; display: block; }
  .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.6s linear infinite; margin: 40px auto; }

  /* ═══ ANIMACIONES ═══ */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ═══ RESPONSIVE ═══ */
  .mobile-menu-btn { display: none; }
  .sidebar-overlay { display: none; }
  @media (max-width: 1200px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 35; opacity: 0; pointer-events: none; transition: opacity 300ms; }
    .sidebar-overlay.open { opacity: 1; pointer-events: all; }
    .main { margin-left: 0; }
    .mobile-menu-btn { display: flex; background: none; border: none; cursor: pointer; color: var(--text-primary); padding: 4px; }
    .content { padding: 16px; }
    .header { padding: 0 16px; }
    .cards-grid { grid-template-columns: 1fr; }
    .tabs { width: 100%; overflow-x: auto; }
  }
</style>
</head>
<body>
<div class="app">
  <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

  <!-- ═══ SIDEBAR (idéntico a /admin) ═══ -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <a href="/admin" class="logo">
        <img src="/imgs/LogoLargoWhaleMetric.png" alt="WhaleMetric" style="height:28px;width:auto;display:block;">
      </a>
    </div>

    <a href="/fuentes" class="sidebar-btn" style="text-decoration:none">
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
      <a class="nav-item" href="/admin">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2"/></svg>
        Prensa digital
      </a>
      <a class="nav-item" href="/admin">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>
        Prensa escrita
      </a>
      <a class="nav-item" href="/admin">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
        Televisión
      </a>
      <a class="nav-item" href="/admin">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        Radio
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
          <span class="breadcrumb-current">Gestionar fuentes</span>
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-secondary" onclick="loadSources()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Actualizar
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

<script>
const SUPABASE_URL = 'https://txxygcdafjcuyvvzbbnx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4eHlnY2RhZmpjdXl2dnpiYm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTA1NjEsImV4cCI6MjA5MTU4NjU2MX0.JCeVp6a3bRKbSPkG_aoYvVwMIFTFn7-IFaXjaeZ0Ik0';
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fallback hardcodeado por si scope/language_code no existen en la tabla
const INTERNACIONAL_NAMES = ['Al Jazeera','CNN','France 24','BBC'];
const AUTONOMICO_NAMES = ['TV3','8TV','RAC1','Catalunya Radio','CatalunyaPress','Nació Digital','Vilaweb','ARA','El Nacional','Tot Badalona','La Ciutat','El Mon','Puntauvui'];
const LANG_FLAGS = {
  ca: '<img src="/imgs/cat.png" style="width:16px;height:11px;border-radius:2px;object-fit:cover;vertical-align:middle;margin-right:4px"> Catalán',
  es: '<img src="/imgs/esp.png" style="width:16px;height:11px;border-radius:2px;object-fit:cover;vertical-align:middle;margin-right:4px"> Español',
  en: '<img src="/imgs/usa.png" style="width:16px;height:11px;border-radius:2px;object-fit:cover;vertical-align:middle;margin-right:4px"> Inglés',
  fr: '<img src="/imgs/fra.png" style="width:16px;height:11px;border-radius:2px;object-fit:cover;vertical-align:middle;margin-right:4px"> Francés',
  ar: '<img src="/imgs/aue.png" style="width:16px;height:11px;border-radius:2px;object-fit:cover;vertical-align:middle;margin-right:4px"> Árabe',
};
const LANG_FALLBACK = {
  'TV3':'ca','RAC1':'ca','Catalunya Radio':'ca','CatalunyaPress':'ca',
  'Nació Digital':'ca','Vilaweb':'ca','ARA':'ca','El Nacional':'ca',
  'El Mon':'ca','Puntauvui':'ca','La Ciutat':'ca','8TV':'ca',
  'CNN':'en','BBC':'en','France 24':'fr','Al Jazeera':'en',
};
const SCOPE_ORDER = ['international','regional','national'];
const SCOPE_LABELS = { international:'Internacionales', regional:'Regionales / Autonómicos', national:'Estatales' };

let allSources = [];
let currentTab = 'all';
let searchQuery = '';
let searchTimeout = null;

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
    const { data, error } = await db
      .from('sources')
      .select('*')
      .order('name');
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
  sources.forEach(s => {
    const scope = getScope(s);
    (groups[scope] || groups.national).push(s);
  });

  const total = sources.length;
  document.getElementById('subtitle').textContent =
    total + ' fuente' + (total !== 1 ? 's' : '') + (searchQuery || currentTab !== 'all' ? ' (filtradas)' : ' en total');

  if (total === 0) {
    document.getElementById('content-area').innerHTML =
      '<div class="state-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p>Sin resultados</p><small>Prueba con otros filtros</small></div>';
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
        ? '<img class="card-logo" src="' + escHtml(s.icon_url) + '" alt="' + escHtml(s.name) + '" onerror="this.style.display=\`none\`;this.nextElementSibling.style.display=\`flex\`">'
          + '<div class="card-logo-placeholder" style="display:none">' + escHtml(s.name.charAt(0).toUpperCase()) + '</div>'
        : '<div class="card-logo-placeholder">' + escHtml(s.name.charAt(0).toUpperCase()) + '</div>';
      const isMediaStream = s.type === 'television' || s.type === 'radio';
      const badge = isMediaStream
        ? '<div class="badges-group"><span class="badge-stream">Stream OK</span><span class="badge-text">Text OK</span></div>'
        : (hasIcon ? '<span class="badge-ok">RSS OK</span>' : '<span class="badge-none">Sin configurar</span>');
      html += '<div class="source-card" style="animation-delay:' + delay + 'ms">'
        + '<div class="card-top">' + logoHtml
        + '<div class="card-info"><div class="card-name">' + escHtml(s.name) + '</div>'
        + '<div class="card-lang">' + lang + '</div></div></div>'
        + '<div class="card-bottom">' + badge
        + \`<button class="btn-config" onclick="configurar(\\\`\${s.id}\\\`,\\\`\${escHtml(s.name)}\\\`)">Configurar</button>\`
        + '</div></div>';
      delay = (delay + 30) % 300;
    });
    html += '</div></div>';
  });

  document.getElementById('content-area').innerHTML = html;
}

function configurar(id, name) {
  alert('Configurar fuente: ' + name + '\\nID: ' + id + '\\n(Próximamente: formulario de configuración)');
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
