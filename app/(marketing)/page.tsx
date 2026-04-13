"use client";

import { useEffect } from "react";

const LOGO = "https://www.whalemetric.com/imgs/LogoLargoWhaleMetric.png";

export default function Home() {
  useEffect(() => {
    // Scroll reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.07 }
    );
    document.querySelectorAll(".rv").forEach((el) => observer.observe(el));

    // Nav scroll
    const onScroll = () => {
      document
        .getElementById("main-nav")
        ?.classList.toggle("scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* NAV */}
      <nav id="main-nav">
        <a href="#" className="nav-logo">
          <img src={LOGO} alt="WhaleMetric" />
        </a>
        <ul className="nav-links">
          <li><a href="#para-quien">Para quien</a></li>
          <li><a href="#fuentes">Fuentes</a></li>
          <li><a href="#senales">Senales</a></li>
          <li><a href="#informes">Informes</a></li>
          <li><a href="#precios">Precios</a></li>
        </ul>
        <div className="nav-actions">
          <a href="#" className="n-ghost">Iniciar sesion</a>
          <a href="#" className="n-solid">Solicitar acceso &rarr;</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-grid"></div>
        <div className="hero-glow"></div>
        <div className="hero-inner">
          <div className="live-badge">
            <span className="live-pip"><span className="live-dot"></span>EN DIRECTO</span>
            Analizando 50.000+ fuentes ahora mismo
          </div>

          <h1>
            Todo lo que publican<br />
            los medios sobre ti,<br />
            <span className="ital">inteligencia pura</span>
          </h1>

          <p className="hero-lead">
            WhaleMetric captura en tiempo real todo lo que emiten las televisiones, radios, periodicos, medios digitales y redes sociales. Lo analiza con IA y te entrega lo que importa: contexto, tendencia y accion.
          </p>
          <p className="hero-sub">Sin datos en bruto. Sin ruido. Solo la informacion que cambia decisiones.</p>

          <div className="hero-ctas">
            <a href="#" className="btn-main">Solicitar demostracion &rarr;</a>
            <a href="#para-quien" className="btn-outline">Ver para quien es</a>
          </div>

          <div className="src-band">
            <span className="src-pre">Cobertura total:</span>
            <div className="src-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
              Television
            </div>
            <div className="src-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>
              Radio
            </div>
            <div className="src-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Prensa
            </div>
            <div className="src-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Medios digitales
            </div>
            <div className="src-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Redes sociales
            </div>
          </div>

          <div className="hero-stats">
            <div className="hs">
              <span className="hs-num">50.000+</span>
              <div className="hs-label">Fuentes monitorizadas</div>
            </div>
            <div className="hs">
              <span className="hs-num">&lt; 4 min</span>
              <div className="hs-label">Latencia maxima de ingesta</div>
            </div>
            <div className="hs">
              <span className="hs-num">97%</span>
              <div className="hs-label">Precision en analisis de sentimiento</div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track">
          <div className="ti"><strong>Iberdrola</strong> · 234 menciones hoy <span className="ti-status ti-live">LIVE</span></div>
          <div className="ti"><strong>Precio electricidad</strong> · sentimiento negativo acelerado <span className="ti-status ti-alert">ALERTA</span></div>
          <div className="ti"><strong>Repsol × ESG</strong> · nueva narrativa detectada <span className="ti-status ti-watch">WATCH</span></div>
          <div className="ti"><strong>Pedro Sanchez</strong> · 1.203 menciones <span className="ti-status ti-live">LIVE</span></div>
          <div className="ti"><strong>CaixaBank</strong> · tendencia emergente en prensa regional <span className="ti-status ti-watch">WATCH</span></div>
          <div className="ti"><strong>Telefonica</strong> · alerta de sentimiento negativo <span className="ti-status ti-alert">ALERTA</span></div>
          {/* duplicate for seamless scroll */}
          <div className="ti"><strong>Iberdrola</strong> · 234 menciones hoy <span className="ti-status ti-live">LIVE</span></div>
          <div className="ti"><strong>Precio electricidad</strong> · sentimiento negativo acelerado <span className="ti-status ti-alert">ALERTA</span></div>
          <div className="ti"><strong>Repsol × ESG</strong> · nueva narrativa detectada <span className="ti-status ti-watch">WATCH</span></div>
          <div className="ti"><strong>Pedro Sanchez</strong> · 1.203 menciones <span className="ti-status ti-live">LIVE</span></div>
          <div className="ti"><strong>CaixaBank</strong> · tendencia emergente en prensa regional <span className="ti-status ti-watch">WATCH</span></div>
          <div className="ti"><strong>Telefonica</strong> · alerta de sentimiento negativo <span className="ti-status ti-alert">ALERTA</span></div>
        </div>
      </div>

      {/* PARA QUIEN */}
      <section className="section" id="para-quien">
        <div className="si">
          <div className="rv" style={{ maxWidth: 640 }}>
            <span className="s-eyebrow">Para quien es</span>
            <h2 className="t-h2" style={{ fontSize: "clamp(36px,4vw,56px)", marginBottom: 18 }}>Disenado para quien<br />toma decisiones<br />con <em>informacion</em></h2>
          </div>
          <div className="who-grid">
            {/* Card 1 */}
            <div className="who-card rv rv-d1">
              <div className="who-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
              </div>
              <div className="who-title">Grandes empresas</div>
              <div className="who-desc">Cotizadas, energeticas, banca, telecomunicaciones, construccion. Organizaciones donde la reputacion mediatica impacta directamente en la cotizacion, la regulacion y la confianza institucional.</div>
              <div className="who-why">
                <div className="who-why-label">Por que lo necesitan</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Anticipar crisis antes de que impacten en mercados</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Medir cuota de voz frente a competidores</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Justificar inversiones en comunicacion con datos</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="who-card rv rv-d2">
              <div className="who-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="who-title">Agencias de comunicacion</div>
              <div className="who-desc">Consultoras estrategicas, agencias de RRPP y despachos de crisis que gestionan la reputacion de multiples clientes simultaneamente.</div>
              <div className="who-why">
                <div className="who-why-label">Por que lo necesitan</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Monitorizar multiples clientes desde un unico panel</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Generar informes ejecutivos automaticos para cada cuenta</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Detectar oportunidades de posicionamiento mediatico</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="who-card rv rv-d3">
              <div className="who-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
              </div>
              <div className="who-title">Partidos y organismos publicos</div>
              <div className="who-desc">Partidos politicos, ministerios, comunidades autonomas y organismos que necesitan entender como les perciben los medios y anticipar la agenda publica.</div>
              <div className="who-why">
                <div className="who-why-label">Por que lo necesitan</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Seguimiento continuo de la narrativa sobre politicas publicas</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Deteccion temprana de crisis de comunicacion institucional</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Analisis de cobertura territorial por comunidad autonoma</div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="who-card rv rv-d1">
              <div className="who-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <div className="who-title">Fondos e inversores</div>
              <div className="who-desc">Fondos de inversion, family offices y gestoras que incorporan el riesgo reputacional y la percepcion mediatica como variable en sus decisiones de inversion.</div>
              <div className="who-why">
                <div className="who-why-label">Por que lo necesitan</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Evaluar riesgo reputacional antes de invertir</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Monitorizar participadas en tiempo real</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Alertas de cambios en narrativa ESG o regulatoria</div>
              </div>
            </div>

            {/* Card 5 */}
            <div className="who-card rv rv-d2">
              <div className="who-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <div className="who-title">Marcas de consumo e industria</div>
              <div className="who-desc">Alimentacion, automocion, farmaceuticas, retail y tecnologia. Empresas donde un viral negativo puede impactar en ventas antes de que el equipo de comunicacion reaccione.</div>
              <div className="who-why">
                <div className="who-why-label">Por que lo necesitan</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Monitorizar percepcion de marca en medios y redes</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Detectar campanas de boicot o criticas virales</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Alertas de retiradas, criticas masivas o crisis virales</div>
              </div>
            </div>

            {/* Card 6 */}
            <div className="who-card rv rv-d3">
              <div className="who-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <div className="who-title">Personajes publicos</div>
              <div className="who-desc">Directivos, artistas, deportistas, academicos y figuras publicas que necesitan saber exactamente que narrativa construyen los medios sobre ellos.</div>
              <div className="who-why">
                <div className="who-why-label">Por que lo necesitan</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Seguimiento personal de su reputacion mediatica</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Deteccion de asociaciones de imagen no deseadas</div>
                <div className="who-why-item"><span className="why-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></span> Analisis de cobertura antes de fichajes o decisiones</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FUENTES */}
      <section className="section" id="fuentes" style={{ background: "var(--g100)" }}>
        <div className="si">
          <div className="sources-layout">
            <div className="rv">
              <span className="s-eyebrow">Cobertura de fuentes</span>
              <h2 className="t-h2" style={{ fontSize: "clamp(36px,4vw,56px)", marginBottom: 18 }}>Todo lo que se<br />emite y publica,<br /><em>sin excepcion</em></h2>
              <p className="t-body" style={{ marginBottom: 48 }}>WhaleMetric no selecciona fuentes. Lo ingesta todo: desde grandes cadenas nacionales hasta medios locales, emisoras comarcales y portales especializados. La cobertura completa es lo que hace posible la inteligencia real.</p>
              <div className="source-rows">
                <div className="source-row">
                  <div className="sr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg></div>
                  <div className="sr-body"><div className="sr-name">Television nacional y autonomica</div><div className="sr-detail">TVE, Antena 3, Telecinco, La Sexta, cuatro y 120+ canales regionales. Transcripcion y analisis de audio en tiempo real.</div></div>
                  <span className="sr-status st-live">En directo</span>
                </div>
                <div className="source-row">
                  <div className="sr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg></div>
                  <div className="sr-body"><div className="sr-name">Radio nacional y local</div><div className="sr-detail">SER, COPE, Onda Cero, RNE y mas de 200 emisoras con cobertura de programacion completa.</div></div>
                  <span className="sr-status st-live">En directo</span>
                </div>
                <div className="source-row">
                  <div className="sr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
                  <div className="sr-body"><div className="sr-name">Prensa escrita y digital</div><div className="sr-detail">El Pais, El Mundo, La Vanguardia, ABC, El Confidencial, elDiario.es y mas de 12.000 cabeceras nacionales e internacionales.</div></div>
                  <span className="sr-status st-rt">Tiempo real</span>
                </div>
                <div className="source-row">
                  <div className="sr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                  <div className="sr-body"><div className="sr-name">Redes sociales</div><div className="sr-detail">X (Twitter), LinkedIn, Instagram, TikTok, YouTube y Facebook. Cobertura de cuentas publicas verificadas y medios institucionales.</div></div>
                  <span className="sr-status st-live">En directo</span>
                </div>
                <div className="source-row">
                  <div className="sr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div>
                  <div className="sr-body"><div className="sr-name">Fuentes institucionales y regulatorias</div><div className="sr-detail">Parlamento, BOE, CNMC, CNMV, Congreso, notas de prensa oficiales y organismos publicos.</div></div>
                  <span className="sr-status st-daily">Diario</span>
                </div>
              </div>
            </div>
            <div className="rv rv-d2">
              <div className="cov-visual">
                <div className="cov-visual-title">Cobertura activa ahora</div>
                <div className="cov-stats">
                  <div className="cov-stat"><div className="cov-stat-num">50K+</div><div className="cov-stat-label">Fuentes indexadas</div></div>
                  <div className="cov-stat"><div className="cov-stat-num">3,8M</div><div className="cov-stat-label">Publicaciones / dia</div></div>
                  <div className="cov-stat"><div className="cov-stat-num">&lt;4min</div><div className="cov-stat-label">Latencia maxima</div></div>
                  <div className="cov-stat"><div className="cov-stat-num">12</div><div className="cov-stat-label">Paises cubiertos</div></div>
                </div>
                <div className="cov-bar-section" style={{ marginTop: 28 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, color: "var(--g300)", marginBottom: 16 }}>Distribucion por tipo de fuente</div>
                  <div className="cov-bar-row"><div className="cov-bar-label">Prensa digital</div><div className="cov-bar-track"><div className="cov-bar-fill" style={{ width: "78%" }}></div></div><div className="cov-bar-val">78%</div></div>
                  <div className="cov-bar-row"><div className="cov-bar-label">Prensa escrita</div><div className="cov-bar-track"><div className="cov-bar-fill" style={{ width: "52%" }}></div></div><div className="cov-bar-val">52%</div></div>
                  <div className="cov-bar-row"><div className="cov-bar-label">Television</div><div className="cov-bar-track"><div className="cov-bar-fill" style={{ width: "35%" }}></div></div><div className="cov-bar-val">35%</div></div>
                  <div className="cov-bar-row"><div className="cov-bar-label">Radio</div><div className="cov-bar-track"><div className="cov-bar-fill" style={{ width: "28%" }}></div></div><div className="cov-bar-val">28%</div></div>
                  <div className="cov-bar-row"><div className="cov-bar-label">Redes sociales</div><div className="cov-bar-track"><div className="cov-bar-fill" style={{ width: "45%" }}></div></div><div className="cov-bar-val">45%</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section className="product-section">
        <div className="product-inner rv" style={{ textAlign: "center" }}>
          <span className="s-eyebrow">El panel de control</span>
          <h2 className="t-h2" style={{ fontSize: "clamp(36px,4vw,58px)", marginBottom: 16 }}>Todo lo que necesitas,<br /><em>en una sola vista</em></h2>
          <p className="t-body" style={{ maxWidth: 560, margin: "0 auto" }}>Disenado para directivos que necesitan contexto inmediato, no para analistas que procesan datos en bruto.</p>
          <div className="product-window">
            <div className="pw-bar">
              <div className="pw-dot"></div><div className="pw-dot"></div><div className="pw-dot"></div>
              <div className="pw-url">app.whalemetric.com/dashboard</div>
            </div>
            <div className="dash">
              <div className="dash-sb">
                <div className="dsb-logo"><img src={LOGO} alt="WhaleMetric" /></div>
                <div className="dsb-sec">Panel</div>
                <div className="dsb-item on"><div className="dsb-il"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Resumen ejecutivo</div></div>
                <div className="dsb-item"><div className="dsb-il"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Alertas activas</div><span style={{ background: "rgba(200,41,30,.1)", color: "var(--red)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100 }}>3</span></div>
                <div className="dsb-item"><div className="dsb-il"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Feed en directo</div><span style={{ color: "#007A50", fontSize: 11, fontWeight: 600 }}>&#9679;</span></div>
                <div className="dsb-sec">Mis senales</div>
                <div className="dsb-kw"><div className="dsb-dot dd-b"></div>Iberdrola<span className="dsb-kw-num up">234 &uarr;</span></div>
                <div className="dsb-kw"><div className="dsb-dot dd-g"></div>Iberdrola &times; ESG<span className="dsb-kw-num up">12 &uarr;&uarr;</span></div>
                <div className="dsb-kw"><div className="dsb-dot dd-r"></div>Precio luz [alerta]<span className="dsb-kw-num alert">47!</span></div>
                <div className="dsb-kw"><div className="dsb-dot dd-b"></div>Endesa &middot; rival<span className="dsb-kw-num" style={{ color: "var(--g300)" }}>89&rarr;</span></div>
                <div style={{ padding: "10px 18px" }}><span style={{ fontSize: 12, color: "var(--blue)", cursor: "pointer" }}>+ Ver todas (12)</span></div>
                <div className="dsb-sec">Fuentes</div>
                <div className="dsb-item"><div className="dsb-il">Digital</div><span style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600 }}>487</span></div>
                <div className="dsb-item"><div className="dsb-il">Prensa</div><span style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600 }}>513</span></div>
                <div className="dsb-item"><div className="dsb-il">Television</div><span style={{ fontSize: 11, color: "var(--g300)" }}>&mdash;</span></div>
              </div>
              <div className="dash-main">
                <div className="dash-kpis">
                  <div className="kpi"><div className="kpi-l">Menciones este mes</div><div className="kpi-v">2.847</div><div className="kpi-d pos">&uarr; +18% vs anterior</div></div>
                  <div className="kpi"><div className="kpi-l">Indice de reputacion</div><div className="kpi-v">74<sup>/100</sup></div><div className="kpi-d pos">&uarr; +3 esta semana</div></div>
                  <div className="kpi"><div className="kpi-l">Cuota de voz</div><div className="kpi-v">23<sup>%</sup></div><div className="kpi-d neg">&darr; -2% Repsol sube</div></div>
                  <div className="kpi"><div className="kpi-l">Sentimiento positivo</div><div className="kpi-v">64<sup>%</sup></div><div className="kpi-d pos">&uarr; Estable</div></div>
                </div>
                <div className="dash-mid">
                  <div className="db">
                    <div className="db-t">Menciones diarias &mdash; ultimos 30 dias</div>
                    <div className="fbars">
                      <div className="fb md" style={{ height: "38%" }}></div><div className="fb md" style={{ height: "55%" }}></div>
                      <div className="fb md" style={{ height: "33%" }}></div><div className="fb md" style={{ height: "68%" }}></div>
                      <div className="fb md" style={{ height: "44%" }}></div><div className="fb md" style={{ height: "60%" }}></div>
                      <div className="fb md" style={{ height: "50%" }}></div><div className="fb md" style={{ height: "76%" }}></div>
                      <div className="fb md" style={{ height: "63%" }}></div><div className="fb md" style={{ height: "54%" }}></div>
                      <div className="fb md" style={{ height: "72%" }}></div><div className="fb hi" style={{ height: "97%" }}></div>
                    </div>
                  </div>
                  <div className="db">
                    <div className="db-t">Analisis de sentimiento</div>
                    <div className="sent-list">
                      <div className="sent-r"><div className="sent-top"><span>Positivo</span><span>64%</span></div><div className="sent-bg"><div className="sent-fill sf-pos"></div></div></div>
                      <div className="sent-r"><div className="sent-top"><span>Negativo</span><span>22%</span></div><div className="sent-bg"><div className="sent-fill sf-neg"></div></div></div>
                      <div className="sent-r"><div className="sent-top"><span>Neutro</span><span>14%</span></div><div className="sent-bg"><div className="sent-fill sf-neu"></div></div></div>
                    </div>
                  </div>
                </div>
                <div className="dash-news">
                  <div className="db-t" style={{ marginBottom: 10 }}>Ultimas publicaciones relevantes</div>
                  <div className="news-items">
                    <div className="news-item"><div className="ni-dot nd-pos"></div><div className="ni-txt">Iberdrola lidera la inversion renovable con 4.200M comprometidos para 2026</div><div className="ni-src">El Pais &middot; 4min</div></div>
                    <div className="news-item"><div className="ni-dot nd-neg"></div><div className="ni-txt">La tarifa electrica vuelve a maximos &mdash; consumidores senalan a las grandes electricas</div><div className="ni-src">RTVE &middot; 28min</div></div>
                    <div className="news-item"><div className="ni-dot" style={{ background: "var(--g300)" }}></div><div className="ni-txt">Iberdrola presenta resultados Q1: beneficio neto de 1.100M, en linea con previsiones</div><div className="ni-src">Expansion &middot; 1h</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNALS */}
      <section className="signals-section" id="senales">
        <div className="sig-bg"></div>
        <div className="sig-inner">
          <div className="sig-header rv">
            <span className="sig-eyebrow">Sistema de senales</span>
            <h2 className="sig-h2">Cuatro formas de<br />seguir lo que <em>importa</em></h2>
            <p className="sig-lead">No toda la informacion tiene la misma urgencia ni la misma naturaleza. WhaleMetric distingue entre entidades, combinaciones, tendencias y alertas criticas para que actues con precision.</p>
          </div>
          <div className="sig-grid">
            <div className="sig-card rv">
              <div className="sig-card-top"><div className="sig-num">01</div><div className="sig-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div></div>
              <div className="sig-card-title">Entidad</div>
              <div className="sig-card-desc">Seguimiento continuo de una marca, persona, institucion o producto. Todo lo que se publica sobre ella en cualquier fuente, clasificado por relevancia, fuente y sentimiento.</div>
              <div className="sig-example">
                <div className="se-line"><span className="se-kw">&quot;Iberdrola&quot;</span> <span className="se-note">&middot; todas las fuentes &middot; tiempo real</span></div>
                <div className="se-line"><span className="se-kw">&quot;Pedro Sanchez&quot;</span> <span className="se-note">&middot; TV + prensa nacional</span></div>
                <div className="se-line"><span className="se-kw">&quot;iPhone 17&quot;</span> <span className="se-note">&middot; digital + redes sociales</span></div>
              </div>
            </div>

            <div className="sig-card rv rv-d1">
              <div className="sig-card-top"><div className="sig-num">02</div><div className="sig-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div></div>
              <div className="sig-card-title">Fusion de senales</div>
              <div className="sig-card-desc">Detecta exactamente cuando dos entidades o conceptos aparecen en el mismo contexto editorial. El mayor riesgo siempre vive en la interseccion, no en el termino aislado.</div>
              <div className="sig-example">
                <div className="se-line"><span className="se-kw">&quot;Mi empresa&quot;</span> <span className="se-op">+</span> <span className="se-kw">&quot;boicot&quot;</span></div>
                <div className="se-line"><span className="se-kw">&quot;Mi CEO&quot;</span> <span className="se-op">+</span> <span className="se-kw">&quot;dimision&quot;</span></div>
                <div className="se-line"><span className="se-kw">&quot;Trump&quot;</span> <span className="se-op">+</span> <span className="se-kw">&quot;aranceles&quot;</span> <span className="se-op">sin</span> <span className="se-kw">&quot;China&quot;</span></div>
              </div>
            </div>

            <div className="sig-card rv rv-d2">
              <div className="sig-card-top"><div className="sig-num">03</div><div className="sig-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div></div>
              <div className="sig-card-title">Tendencia emergente</div>
              <div className="sig-card-desc">La IA identifica temas que estan ganando presencia mediatica antes de que dominen la agenda. Actuas cuando aun hay margen de respuesta, no cuando ya es inevitable.</div>
              <div className="sig-example">
                <div className="se-line"><span className="se-kw">&quot;IA regulacion Europa&quot;</span> <span style={{ color: "#7BA8FF", fontWeight: 700 }}>&uarr;&uarr;&uarr; +180%</span></div>
                <div className="se-line"><span className="se-kw">&quot;Hidrogeno verde&quot;</span> <span style={{ color: "#7BA8FF", fontWeight: 700 }}>&uarr; +34%</span></div>
                <div className="se-line"><span className="se-kw">&quot;Crisis vivienda BCN&quot;</span> <span style={{ color: "#FF7B73", fontWeight: 700 }}>&uarr;&uarr; acelerando</span></div>
              </div>
            </div>

            <div className="sig-card alert-card rv rv-d3">
              <div className="sig-card-top"><div className="sig-num">04</div><div className="sig-icon-wrap" style={{ borderColor: "rgba(200,41,30,.3)" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div></div>
              <div className="sig-card-title">Alerta critica</div>
              <div className="sig-card-desc">Activacion automatica cuando el sismografo detecta una anomalia. No espera a que sea noticia: aprende el patron normal de tu entidad y te avisa ante cualquier desviacion significativa.</div>
              <div className="sig-example">
                <div className="se-line" style={{ color: "#FF7B73", fontWeight: 600 }}>&#11044; ACTIVACION AUTOMATICA</div>
                <div className="se-line"><span className="se-kw">&quot;Mi marca&quot;</span> <span style={{ color: "#FF7B73", fontWeight: 700 }}>+347% en 90 minutos</span></div>
                <div className="se-line se-note">Causa probable: declaracion del Ministro de Economia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEEP FEATURES */}
      <section className="section">
        <div className="si">
          <div className="rv" style={{ maxWidth: 640, marginBottom: 0 }}>
            <span className="s-eyebrow">Inteligencia avanzada</span>
            <h2 className="t-h2" style={{ fontSize: "clamp(36px,4vw,58px)", marginBottom: 18 }}>Mas alla de saber<br />que dicen. <em>Entender<br />por que importa.</em></h2>
          </div>
          <div className="deep-grid rv rv-d1">
            <div className="deep-card"><div className="deep-card-accent dca-ink"></div><div className="dc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div><div className="dc-title">Mapa de narrativas</div><div className="dc-desc">La IA agrupa todas las publicaciones en las 4-6 historias que los medios estan construyendo sobre ti en este momento. No son noticias sueltas: son narrativas con volumen, tendencia y sentimiento medibles.</div><div className="dc-detail"><strong>Ejemplo real:</strong> Iberdrola este mes &mdash; &quot;Lider en renovables&quot; 45% &middot; &quot;Precios de la luz&quot; 38% &middot; &quot;Conflicto regulatorio&quot; 17%. Ver cual crece te dice donde actuar primero.</div></div>
            <div className="deep-card"><div className="deep-card-accent dca-blue"></div><div className="dc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div><div className="dc-title">Cuota de voz sectorial</div><div className="dc-desc">Del total de menciones en tu sector esta semana, que porcentaje corresponde a tu organizacion? Este es el KPI numero uno en comunicacion corporativa. WhaleMetric lo calcula en tiempo real contra todos tus competidores.</div><div className="dc-detail"><strong>Resultado:</strong> Sabes si estas ganando o perdiendo presencia mediatica frente a la competencia, semana a semana, con datos objetivos para llevar a direccion.</div></div>
            <div className="deep-card"><div className="deep-card-accent dca-ink"></div><div className="dc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div><div className="dc-title">Distribucion geografica</div><div className="dc-desc">Lo que publican sobre ti en Catalunya no es lo mismo que en Madrid, el Pais Vasco o Andalucia. La reputacion mediatica varia por territorio. WhaleMetric te muestra exactamente donde y como.</div><div className="dc-detail"><strong>Util para:</strong> Organizaciones con implantacion nacional, empresas reguladas en distintas autonomias y campanas de comunicacion territorial.</div></div>
            <div className="deep-card"><div className="deep-card-accent dca-fade"></div><div className="dc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></div><div className="dc-title">Grafo de influencia mediatica</div><div className="dc-desc">Que medio publica primero sobre tu sector y quien lo amplifica? Identifica los nodos que marcan agenda. Saber que si El Confidencial publica algo negativo lo tendras en 40 medios en 6 horas cambia como priorizas tu respuesta.</div><div className="dc-detail"><strong>Resultado:</strong> Decides donde colocar tus comunicados, a que periodistas escuchar primero y que medio no puedes ignorar en tu sector.</div></div>
            <div className="deep-card"><div className="deep-card-accent dca-ink"></div><div className="dc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div><div className="dc-title">Monitor de silencio mediatico</div><div className="dc-desc">La ausencia de cobertura tambien es informacion. Si tu volumen normal cae un 80% sin causa aparente, algo esta pasando: un boicot silencioso, una agenda que te ignora, o una crisis que se prepara fuera de tu vista.</div><div className="dc-detail"><strong>El sistema aprende</strong> cual es tu patron normal de menciones y te alerta cuando se desvia significativamente, tanto al alza como a la baja.</div></div>
            <div className="deep-card"><div className="deep-card-accent dca-blue"></div><div className="dc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div className="dc-title">Monitor de actores externos</div><div className="dc-desc">Rastrea que dicen sobre ti politicos, reguladores, sindicatos, ONGs y asociaciones de consumidores. Son actores que no son medios pero cuyas declaraciones generan cobertura. Saberlo antes que los periodistas te da ventaja.</div><div className="dc-detail"><strong>Ejemplo:</strong> Un ministro te menciona negativamente en una comision parlamentaria. WhaleMetric te avisa antes de que los medios lo amplifiquen.</div></div>
          </div>
        </div>
      </section>

      {/* REPORTS */}
      <section className="reports-section" id="informes">
        <div className="rep-bg"></div>
        <div className="rep-inner">
          <div className="rv">
            <span className="rep-eyebrow">Informes y briefings</span>
            <h2 className="rep-h2">La inteligencia que<br />necesitas, <em>en el formato</em><br />que ya conoces</h2>
            <p className="rep-lead">No sirve de nada tener los datos si no llegan a quien debe tomar las decisiones, en el momento adecuado y en un formato que puedan leer en tres minutos.</p>
            <div className="rep-types">
              <div className="rep-type"><div className="rep-type-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div><div className="rep-type-name">Briefing ejecutivo diario</div><div className="rep-type-desc">Cada manana a las 8h, un analisis de 5 parrafos generado por IA con todo lo relevante de las ultimas 24 horas. En lenguaje de direccion, con recomendaciones de accion.</div></div></div>
              <div className="rep-type"><div className="rep-type-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div><div><div className="rep-type-name">Informe mensual ejecutivo en PDF</div><div className="rep-type-desc">Un documento con portada de tu organizacion, analisis de narrativas, evolucion del indice de reputacion, comparativa de competidores y recomendaciones estrategicas.</div></div></div>
              <div className="rep-type"><div className="rep-type-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div><div><div className="rep-type-name">Alertas en tiempo real</div><div className="rep-type-desc">Notificaciones inmediatas por email, SMS o Slack cuando el sistema detecta una anomalia. Con causa probable identificada por IA y nivel de urgencia graduado.</div></div></div>
              <div className="rep-type"><div className="rep-type-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div><div><div className="rep-type-name">Analisis de causa raiz</div><div className="rep-type-desc">Cuando hay un pico anomalo, la IA no solo lo detecta: busca la causa. Declaracion de un politico, comunicado de un competidor, resolucion regulatoria.</div></div></div>
            </div>
          </div>
          <div className="rv rv-d2">
            <div className="report-mock">
              <div className="rm-header">
                <div className="rm-logo"><img src={LOGO} alt="WhaleMetric" /></div>
                <div className="rm-meta">Briefing ejecutivo &middot; Lunes 14 Abril 2026 &middot; 08:00h</div>
              </div>
              <div className="rm-body">
                <div className="rm-title">Informe semanal de reputacion mediatica</div>
                <div className="rm-sub">Iberdrola S.A. &middot; Semana del 7 al 13 de Abril de 2026</div>
                <div className="rm-kpis">
                  <div className="rm-kpi"><div className="rm-kpi-v">2.847</div><div className="rm-kpi-l">Menciones totales</div></div>
                  <div className="rm-kpi"><div className="rm-kpi-v">74/100</div><div className="rm-kpi-l">Indice reputacion</div></div>
                  <div className="rm-kpi"><div className="rm-kpi-v">23%</div><div className="rm-kpi-l">Share of voice</div></div>
                </div>
                <div className="rm-narrative">
                  <strong>Resumen ejecutivo:</strong> La semana ha estado marcada por la narrativa del precio de la electricidad, que representa el 38% de las menciones y muestra una tendencia negativa acelerada desde el martes. La narrativa &quot;Lider en renovables&quot; se mantiene estable en el 45% con sentimiento predominantemente positivo.
                </div>
                <div className="rm-bars">
                  <div className="rm-bar md" style={{ height: "42%" }}></div>
                  <div className="rm-bar md" style={{ height: "58%" }}></div>
                  <div className="rm-bar md" style={{ height: "35%" }}></div>
                  <div className="rm-bar md" style={{ height: "70%" }}></div>
                  <div className="rm-bar md" style={{ height: "48%" }}></div>
                  <div className="rm-bar hi" style={{ height: "95%" }}></div>
                  <div className="rm-bar md" style={{ height: "62%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="proof-section">
        <div className="proof-inner rv">
          <p className="proof-label">Utilizado por lideres en comunicacion y direccion</p>
          <div className="proof-logos">
            <div className="pl">Deloitte</div>
            <div className="pl">Llorente &amp; Cuenca</div>
            <div className="pl">Barcelo Hotels</div>
            <div className="pl">Naturgy</div>
            <div className="pl">Brunswick Group</div>
            <div className="pl">Kreab</div>
          </div>
          <div className="testi-grid">
            <div className="testi">
              <div className="testi-quote">&quot;Identificamos una situacion reputacional en desarrollo seis horas antes de que apareciera en los medios generalistas. Ese margen nos permitio coordinar el mensaje y gestionar la narrativa desde el primer momento.&quot;</div>
              <div className="testi-who"><div className="testi-av">CM</div><div><div className="testi-name">Carlos Morales</div><div className="testi-role">Director de Comunicacion &middot; Naturgy</div></div></div>
            </div>
            <div className="testi">
              <div className="testi-quote">&quot;Las fusiones de senales son la funcionalidad que no sabiamos que necesitabamos. Rastrear &apos;nuestro fondo x regulacion SEC&apos; nos alerto de un movimiento regulatorio antes de que lo cubriera ningun medio generalista.&quot;</div>
              <div className="testi-who"><div className="testi-av">AS</div><div><div className="testi-name">Ana Soler</div><div className="testi-role">Managing Partner &middot; Brunswick Group</div></div></div>
            </div>
            <div className="testi">
              <div className="testi-quote">&quot;El briefing diario que genera la IA es lo primero que leo cada manana. Antes dedicaba dos horas a revisar prensa y aun asi me perdia cosas. Ahora en tres minutos tengo todo lo relevante.&quot;</div>
              <div className="testi-who"><div className="testi-av">LR</div><div><div className="testi-name">Laura Rivas</div><div className="testi-role">Directora General &middot; Llorente &amp; Cuenca</div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="precios">
        <div className="si">
          <div className="pricing-wrap">
            <div className="pricing-hd rv">
              <span className="s-eyebrow">Planes</span>
              <h2 className="t-h2" style={{ fontSize: "clamp(36px,4vw,56px)", marginBottom: 14 }}>Sin letra pequena.<br />Sin compromisos ocultos.</h2>
              <p className="t-body-sm">14 dias de acceso completo sin coste. Sin tarjeta de credito.</p>
            </div>
            <div className="pricing-cards rv rv-d1">
              {/* Starter */}
              <div className="plan">
                <div className="plan-tier">Starter</div>
                <div className="plan-price"><span>&euro;</span>299</div>
                <div className="plan-per">al mes &middot; facturacion anual</div>
                <div className="plan-div"></div>
                <ul className="plan-feats">
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Hasta 3 entidades monitorizadas</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> 5 fusiones de senales basicas</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Prensa digital y escrita</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Alertas por correo electronico</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Briefing diario generado por IA</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Indice de reputacion</li>
                  <li className="pf pf-dim"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Television y Radio</li>
                  <li className="pf pf-dim"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Mapa de narrativas</li>
                </ul>
                <a href="#" className="btn-p">Empezar gratis 14 dias</a>
              </div>

              {/* Professional */}
              <div className="plan plan-dark">
                <div className="plan-badge">Mas elegido</div>
                <div className="plan-tier">Professional</div>
                <div className="plan-price"><span>&euro;</span>899</div>
                <div className="plan-per">al mes &middot; facturacion anual</div>
                <div className="plan-div"></div>
                <ul className="plan-feats">
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Hasta 15 entidades monitorizadas</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Fusiones avanzadas Y / SIN / CERCA</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Todas las fuentes: TV, Radio, RRSS</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Alertas email + SMS + Slack</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Mapa de narrativas con IA</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Analisis comparativo de 3 competidores</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Sismografo de riesgo activado</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Informe ejecutivo PDF mensual</li>
                </ul>
                <a href="#" className="btn-p">Empezar gratis 14 dias</a>
              </div>

              {/* Enterprise */}
              <div className="plan">
                <div className="plan-tier">Enterprise</div>
                <div className="plan-price" style={{ fontSize: 42, letterSpacing: "-1px" }}>A medida</div>
                <div className="plan-per">volumen &middot; SLA &middot; onboarding dedicado</div>
                <div className="plan-div"></div>
                <ul className="plan-feats">
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Entidades y senales ilimitadas</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Logica de fusion compleja personalizada</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Centro de seguimiento dedicado</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> API para integracion con sistemas internos</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Customer Success Manager dedicado</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Benchmarking sectorial completo</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Informe ejecutivo semanal con IA</li>
                  <li className="pf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> SLA 99,9% de disponibilidad garantizada</li>
                </ul>
                <a href="#" className="btn-p">Solicitar propuesta</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-section">
        <div className="cta-bg"></div>
        <div className="cta-lines"></div>
        <div className="cta-inner rv">
          <h2 className="cta-h2">La proxima publicacion<br />importante sobre ti<br /><em>ya ha salido</em></h2>
          <p className="cta-sub">La diferencia esta en si la conoces en cuatro minutos o en cuatro horas. Solicita acceso y comprueba lo que WhaleMetric sabe sobre tu organizacion ahora mismo.</p>
          <div className="cta-btns">
            <a href="#" className="btn-cta-white">Solicitar acceso gratuito</a>
            <a href="#" className="btn-cta-ghost">Ver una demostracion en vivo</a>
          </div>
          <div className="cta-trust">14 dias de acceso completo &middot; Sin tarjeta de credito &middot; Sin compromiso</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="f-logo"><img src={LOGO} alt="WhaleMetric" /></div>
        <ul className="f-links">
          <li><a href="#">Producto</a></li>
          <li><a href="#">Para quien</a></li>
          <li><a href="#">Precios</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Documentacion API</a></li>
          <li><a href="#">Contacto</a></li>
          <li><a href="#">Politica de privacidad</a></li>
          <li><a href="#">Terminos de uso</a></li>
        </ul>
        <div className="f-copy">&copy; 2026 WhaleMetric&trade;. Todos los derechos reservados.</div>
      </footer>
    </>
  );
}
