import type { Crisis } from '@/lib/types/crisis';

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const daysAgo  = (d: number) => new Date(now - d * 86400_000).toISOString();

// ── Crisis 1 · BBVA-Sabadell · CRITICAL · ACTIVE · 18h ───────────────────────

const CRISIS_BBVA: Crisis = {
  id: 'crisis-mock-bbva-sabadell',
  title: 'Crisis reputacional BBVA-Sabadell',
  severity: 'CRITICAL',
  status: 'active',
  subject_type: 'radar',
  subject_id: 'mock-crisis-banca',
  subject_name: 'Crisis sector banca',
  started_at: hoursAgo(18),
  escalated_at: hoursAgo(4),
  last_updated_at: hoursAgo(0.05), // ~3 min
  narrative_summary: 'La OPA hostil de BBVA divide a medios y Gobierno, con CNMC evaluando vetos.',
  narrative_text:
    'La OPA hostil de BBVA sobre Sabadell ha desatado una crisis reputacional sin precedentes para el sector. El consejo del Sabadell la califica de "hostil y destructiva", mientras la CNMC revisa plazos y el Gobierno catalán se posiciona en contra. La narrativa dominante ha virado de "concentración estratégica" a "veto necesario" en apenas 10 horas.',
  vital_signs: {
    mentions_per_hour: 412,
    mentions_delta_pct: 187,
    reach_estimated: 5_800_000,
    sentiment_negative_pct: 78,
    duration_hours: 18,
    velocity: 'viral',
    peak_mentions: 567,
    threshold_critical: true,
  },
  sparkline_data: [60, 82, 110, 145, 220, 310, 420, 567, 510, 460, 430, 412],
  timeline: [
    { id: 'e1', kind: 'start',              at: hoursAgo(18), title: 'Inicio de crisis',             description: 'BBVA anuncia oferta directa a accionistas del Sabadell tras rechazo del consejo.' },
    { id: 'e2', kind: 'peak_volume',        at: hoursAgo(14), title: 'Pico de 567 menciones/hora', description: 'Cobertura simultánea de prensa económica y generalista, con entrada de Financial Times.' },
    { id: 'e3', kind: 'new_framing',        at: hoursAgo(10), title: 'Nuevo encuadre: "veto CNMC"',   description: 'El Confidencial introduce el marco regulatorio dominante del ciclo.' },
    { id: 'e4', kind: 'stakeholder_enters', at: hoursAgo(8),  title: 'Gobierno catalán se pronuncia', description: 'Aragonés califica la operación de "nociva para el tejido empresarial catalán".' },
    { id: 'e5', kind: 'response_published', at: hoursAgo(6),  title: 'CEO BBVA responde',             description: 'Publica carta abierta defendiendo valor para accionistas y continuidad de marca.' },
    { id: 'e6', kind: 'escalation',         at: hoursAgo(4),  title: 'Escalada a CRITICAL',           description: 'Umbral combinado de volumen + sentimiento negativo + duración cruzado.' },
    { id: 'e7', kind: 'stakeholder_enters', at: hoursAgo(2),  title: 'CNMC abre revisión formal',     description: 'Anuncia revisión de plazos y análisis de concentración.' },
    { id: 'e8', kind: 'user_note',          at: hoursAgo(1),  title: 'Contacto con responsable de comunicación Sabadell', description: 'Llamada a las 09:40 para coordinar mensaje. Sin declaración conjunta prevista.', is_user_note: true },
  ],
  stakeholders: [
    { id: 's1', name: 'Consejo Sabadell', role: 'Órgano de gobierno del banco', side: 'attacker', mentions: 42, quotes: [
      { source: 'El País', text: 'Consideramos la oferta hostil y destructiva para el valor a largo plazo.', at: hoursAgo(14) },
    ] },
    { id: 's2', name: 'CNMC', role: 'Comisión Nacional de los Mercados', side: 'attacker', mentions: 38, quotes: [
      { source: 'Expansión', text: 'Vamos a revisar con exhaustividad los plazos y la concentración resultante.', at: hoursAgo(2) },
    ] },
    { id: 's3', name: 'Gobierno catalán', role: 'Generalitat', side: 'attacker', mentions: 24, quotes: [
      { source: 'La Vanguardia', text: 'La operación es nociva para el tejido empresarial catalán.', at: hoursAgo(8) },
    ] },
    { id: 's4', name: 'CEO BBVA', role: 'Dirección ejecutiva', side: 'defender', mentions: 31, quotes: [
      { source: 'El Confidencial', text: 'Esta operación generará valor para accionistas de ambas entidades.', at: hoursAgo(6) },
    ] },
    { id: 's5', name: 'Moncloa', role: 'Portavocía Gobierno', side: 'defender', mentions: 12, quotes: [
      { source: 'eldiario.es', text: 'Confiamos en que el proceso se desarrolle con normalidad y transparencia.', at: hoursAgo(12) },
    ] },
    { id: 's6', name: 'Financial Times',     role: 'Medio internacional',   side: 'neutral', mentions: 18, quotes: [] },
    { id: 's7', name: 'Reuters',             role: 'Agencia internacional', side: 'neutral', mentions: 14, quotes: [] },
    { id: 's8', name: 'Accionistas minoritarios Sabadell', role: 'Colectivo', side: 'neutral', mentions: 10, quotes: [
      { source: 'Cinco Días', text: 'Necesitamos información clara antes de tomar posición.', at: hoursAgo(9) },
    ] },
    { id: 's9', name: 'Bloomberg',           role: 'Medio internacional',   side: 'neutral', mentions: 9,  quotes: [] },
    { id: 's10', name: 'Asociación de analistas bursátiles', role: 'Gremio', side: 'neutral', mentions: 7, quotes: [] },
  ],
  dominant_framings: [
    { id: 'f1', label: 'Concentración bancaria', pct: 42, trend: 'up'   },
    { id: 'f2', label: 'Veto CNMC',              pct: 28, trend: 'up'   },
    { id: 'f3', label: 'Gobierno catalán en contra', pct: 18, trend: 'stable' },
    { id: 'f4', label: 'Accionistas minoritarios', pct: 12, trend: 'down' },
  ],
  ai_recommendations: [
    { number: 1, action: 'Publicar comunicado oficial conjunto con datos de continuidad operativa', marco_sugerido: 'Transparencia operativa', impacto_esperado: 'Neutralizar ~35% del framing "hostilidad"' },
    { number: 2, action: 'Contactar a portavoces económicos de medios catalanes antes de las 14:00', marco_sugerido: 'Compromiso territorial', impacto_esperado: 'Reducir peso del framing "Gobierno catalán en contra"' },
    { number: 3, action: 'Responder al framing "veto CNMC" con timeline regulatorio detallado', marco_sugerido: 'Cumplimiento normativo', impacto_esperado: 'Desacelerar la propagación del marco regulatorio adverso' },
  ],
  critical_news: [
    { id: 'cn1',  source: 'El Confidencial', headline: 'BBVA eleva la oferta por Sabadell en plena reunión del consejo',      published_at: hoursAgo(0.5), sentiment: 'neutro',   url: '#' },
    { id: 'cn2',  source: 'Expansión',       headline: 'La CNMC abre revisión formal de plazos',                               published_at: hoursAgo(2),   sentiment: 'neutro',   url: '#' },
    { id: 'cn3',  source: 'El País',         headline: 'El consejo del Sabadell califica la OPA de hostil y destructiva',      published_at: hoursAgo(3),   sentiment: 'negativo', url: '#' },
    { id: 'cn4',  source: 'La Vanguardia',   headline: 'Gobierno catalán se posiciona contra la operación',                    published_at: hoursAgo(5),   sentiment: 'negativo', url: '#' },
    { id: 'cn5',  source: 'Financial Times', headline: 'A test for Spain\'s banking landscape',                                published_at: hoursAgo(7),   sentiment: 'neutro',   url: '#' },
    { id: 'cn6',  source: 'Cinco Días',      headline: 'Accionistas minoritarios exigen transparencia',                        published_at: hoursAgo(8),   sentiment: 'negativo', url: '#' },
    { id: 'cn7',  source: 'ABC',             headline: 'El mercado descuenta la operación pero duda del calendario',           published_at: hoursAgo(9),   sentiment: 'neutro',   url: '#' },
    { id: 'cn8',  source: 'El Mundo',        headline: 'La banca concentrada, a debate en el Congreso',                        published_at: hoursAgo(10),  sentiment: 'negativo', url: '#' },
    { id: 'cn9',  source: 'Reuters',         headline: 'Spanish lender faces hostile bid as ECB watches',                      published_at: hoursAgo(11),  sentiment: 'neutro',   url: '#' },
    { id: 'cn10', source: 'eldiario.es',     headline: 'Moncloa pide calma ante la fusión bancaria',                           published_at: hoursAgo(12),  sentiment: 'neutro',   url: '#' },
    { id: 'cn11', source: 'Nació Digital',   headline: 'Sabadell y su identidad catalana en el ojo del debate',                published_at: hoursAgo(13),  sentiment: 'negativo', url: '#' },
    { id: 'cn12', source: 'elEconomista',    headline: 'CEO BBVA: "Esta operación generará valor para todos"',                 published_at: hoursAgo(14),  sentiment: 'positivo', url: '#' },
  ],
  top_amplifiers: [
    { source: 'El Confidencial', pct: 18, mentions: 112 },
    { source: 'Expansión',       pct: 15, mentions: 94  },
    { source: 'El País',         pct: 12, mentions: 75  },
    { source: 'Cinco Días',      pct: 10, mentions: 62  },
    { source: 'La Vanguardia',   pct: 9,  mentions: 58  },
    { source: 'El Mundo',        pct: 8,  mentions: 51  },
    { source: 'ABC',             pct: 7,  mentions: 44  },
    { source: 'Financial Times', pct: 6,  mentions: 38  },
    { source: 'Reuters',         pct: 5,  mentions: 31  },
    { source: 'eldiario.es',     pct: 4,  mentions: 24  },
  ],
  is_mock: true,
};

// ── Crisis 2 · Política económica · HIGH · MONITORING · 3d ───────────────────

const CRISIS_ECONOMICA: Crisis = {
  id: 'crisis-mock-politica-economica',
  title: 'Crisis política económica Gobierno',
  severity: 'HIGH',
  status: 'monitoring',
  subject_type: 'radar',
  subject_id: 'mock-politica-economica',
  subject_name: 'Política económica Gobierno',
  started_at: daysAgo(3),
  escalated_at: daysAgo(2),
  last_updated_at: hoursAgo(6),
  narrative_summary: 'Encuadre "agotamiento del ciclo" se asienta frente al discurso oficial de resiliencia.',
  narrative_text:
    'Los medios económicos de orientación conservadora consolidan el marco "agotamiento del ciclo" sobre la política económica del Gobierno. El Ejecutivo responde con datos macro de empleo y recaudación, pero no logra desplazar el encuadre. La conversación es polarizada pero estable en volumen.',
  vital_signs: {
    mentions_per_hour: 180,
    mentions_delta_pct: 22,
    reach_estimated: 3_200_000,
    sentiment_negative_pct: 52,
    duration_hours: 72,
    velocity: 'sostenido',
    peak_mentions: 240,
    threshold_critical: false,
  },
  sparkline_data: [90, 110, 140, 180, 220, 240, 210, 195, 185, 175, 182, 180],
  timeline: [
    { id: 'e1', kind: 'start',       at: daysAgo(3),    title: 'Inicio', description: 'Primeros artículos de opinión cuestionan la sostenibilidad del ciclo.' },
    { id: 'e2', kind: 'new_framing', at: daysAgo(2.5),  title: 'Emerge el framing "agotamiento del ciclo"', description: 'Expansión, El Mundo y ABC consolidan el marco.' },
    { id: 'e3', kind: 'escalation',  at: daysAgo(2),    title: 'Escalada a HIGH', description: 'Volumen supera el umbral durante 48h consecutivas.' },
    { id: 'e4', kind: 'response_published', at: daysAgo(1), title: 'Moncloa publica nota con datos macro', description: 'Defiende cifras de empleo y recaudación.' },
    { id: 'e5', kind: 'de_escalation', at: hoursAgo(12), title: 'Volumen estabilizado', description: 'La conversación mantiene ritmo sin acelerar. Se mueve a monitorización.' },
  ],
  stakeholders: [
    { id: 's1', name: 'Expansión', role: 'Medio económico',    side: 'attacker', mentions: 34, quotes: [] },
    { id: 's2', name: 'El Mundo',  role: 'Medio generalista',  side: 'attacker', mentions: 22, quotes: [] },
    { id: 's3', name: 'ABC',       role: 'Medio generalista',  side: 'attacker', mentions: 19, quotes: [] },
    { id: 's4', name: 'Moncloa',   role: 'Gobierno',           side: 'defender', mentions: 28, quotes: [
      { source: 'eldiario.es', text: 'Los datos de empleo desmontan la tesis del agotamiento.', at: daysAgo(1) },
    ] },
    { id: 's5', name: 'Ministerio de Economía', role: 'Gobierno', side: 'defender', mentions: 16, quotes: [] },
    { id: 's6', name: 'Banco de España', role: 'Regulador',   side: 'neutral',  mentions: 12, quotes: [] },
    { id: 's7', name: 'Cinco Días',      role: 'Medio económico', side: 'neutral', mentions: 10, quotes: [] },
  ],
  dominant_framings: [
    { id: 'f1', label: 'Agotamiento del ciclo',      pct: 48, trend: 'up'     },
    { id: 'f2', label: 'Resiliencia macroeconómica', pct: 32, trend: 'down'   },
    { id: 'f3', label: 'Inflación persistente',      pct: 12, trend: 'stable' },
    { id: 'f4', label: 'Política fiscal',            pct: 8,  trend: 'stable' },
  ],
  ai_recommendations: [
    { number: 1, action: 'Preparar comunicación con indicadores sectoriales (no solo macro agregados)', marco_sugerido: 'Granularidad económica', impacto_esperado: 'Erosionar la simplificación del marco "agotamiento"' },
    { number: 2, action: 'Agendar entrevista con portavoz económico en medio conservador de referencia', marco_sugerido: 'Apertura al debate', impacto_esperado: 'Romper el bloque que sostiene el framing adverso' },
  ],
  critical_news: [
    { id: 'cn1', source: 'Expansión',    headline: 'Llega el agotamiento del ciclo, avisan los analistas',     published_at: hoursAgo(8),  sentiment: 'negativo', url: '#' },
    { id: 'cn2', source: 'El Mundo',     headline: 'La economía española entra en fase de techo',               published_at: hoursAgo(14), sentiment: 'negativo', url: '#' },
    { id: 'cn3', source: 'ABC',          headline: 'Las señales del fin de ciclo: empleo, crédito y consumo',   published_at: hoursAgo(18), sentiment: 'negativo', url: '#' },
    { id: 'cn4', source: 'eldiario.es',  headline: 'Los datos de empleo desmontan la tesis del agotamiento',    published_at: daysAgo(1),   sentiment: 'positivo', url: '#' },
    { id: 'cn5', source: 'Cinco Días',   headline: 'Radiografía de un ciclo que resiste: cinco indicadores',    published_at: daysAgo(1.2), sentiment: 'neutro',   url: '#' },
    { id: 'cn6', source: 'El País',      headline: 'Economistas pronostican moderación sin recesión',           published_at: daysAgo(1.5), sentiment: 'neutro',   url: '#' },
    { id: 'cn7', source: 'La Vanguardia',headline: 'Banco de España advierte de techos salariales',             published_at: daysAgo(2),   sentiment: 'negativo', url: '#' },
  ],
  top_amplifiers: [
    { source: 'Expansión',   pct: 22, mentions: 84 },
    { source: 'El Mundo',    pct: 18, mentions: 68 },
    { source: 'ABC',         pct: 14, mentions: 53 },
    { source: 'eldiario.es', pct: 11, mentions: 42 },
    { source: 'El País',     pct: 10, mentions: 38 },
    { source: 'Cinco Días',  pct: 9,  mentions: 34 },
    { source: 'La Vanguardia', pct: 7, mentions: 26 },
  ],
  is_mock: true,
};

// ── Crisis 3 · Nike · MEDIUM · RESOLVED · cerrada hace 2d ────────────────────

const CRISIS_NIKE: Crisis = {
  id: 'crisis-mock-nike',
  title: 'Crisis reputacional Nike (boicot en redes)',
  severity: 'MEDIUM',
  status: 'resolved',
  subject_type: 'radar',
  subject_id: 'mock-nike-organico',
  subject_name: 'Nike orgánico',
  started_at: daysAgo(5),
  escalated_at: daysAgo(4),
  resolved_at: daysAgo(2),
  last_updated_at: daysAgo(2),
  narrative_summary: 'Campaña de boicot en redes por colaboración polémica, contenida con comunicado y ajuste de narrativa.',
  narrative_text:
    'Una colaboración publicitaria generó una ola de críticas en redes sociales sobre el alineamiento de marca. La crisis fue contenida mediante un comunicado rápido, un ajuste en la narrativa de campaña y el apoyo de atletas embajadores. Cierre limpio, sin impacto significativo en la conversación orgánica actual.',
  vital_signs: {
    mentions_per_hour: 0,
    mentions_delta_pct: -94,
    reach_estimated: 1_400_000,
    sentiment_negative_pct: 12,
    duration_hours: 72,
    velocity: 'contained',
    peak_mentions: 320,
    threshold_critical: false,
  },
  sparkline_data: [40, 120, 240, 320, 280, 180, 90, 42, 18, 8, 3, 0],
  timeline: [
    { id: 'e1', kind: 'start',              at: daysAgo(5),   title: 'Inicio', description: 'Colaboración publicitaria genera reacciones adversas en redes.' },
    { id: 'e2', kind: 'escalation',         at: daysAgo(4),   title: 'Escalada a MEDIUM', description: 'Pico de 320 menciones/hora con hashtag de boicot.' },
    { id: 'e3', kind: 'response_published', at: daysAgo(3.5), title: 'Comunicado oficial de Nike', description: 'Comunicación ajusta el enfoque de la campaña y reafirma valores.' },
    { id: 'e4', kind: 'stakeholder_enters', at: daysAgo(3),   title: 'Atletas embajadores respaldan la marca', description: 'Tres figuras con más de 10M de seguidores publican en apoyo.' },
    { id: 'e5', kind: 'de_escalation',      at: daysAgo(2.5), title: 'Conversación en declive', description: 'El volumen cae por debajo del umbral de monitorización.' },
    { id: 'e6', kind: 'resolution',         at: daysAgo(2),   title: 'Crisis resuelta', description: 'Volumen negativo normalizado y sentimiento recuperado. Cierre documentado.' },
  ],
  stakeholders: [
    { id: 's1', name: 'Usuarios redes sociales', role: 'Opinión pública', side: 'attacker', mentions: 48, quotes: [] },
    { id: 's2', name: 'Activistas sostenibilidad', role: 'ONG',           side: 'attacker', mentions: 14, quotes: [] },
    { id: 's3', name: 'Nike Global Comms',     role: 'Marca',            side: 'defender', mentions: 22, quotes: [
      { source: 'Marca', text: 'Reafirmamos nuestro compromiso con los valores de inclusión y sostenibilidad.', at: daysAgo(3.5) },
    ] },
    { id: 's4', name: 'Atletas embajadores',   role: 'Voceros',          side: 'defender', mentions: 18, quotes: [] },
    { id: 's5', name: 'Vogue Business',        role: 'Medio lifestyle',  side: 'neutral',  mentions: 10, quotes: [] },
    { id: 's6', name: 'Marca',                 role: 'Medio deportivo',  side: 'neutral',  mentions: 8,  quotes: [] },
  ],
  dominant_framings: [
    { id: 'f1', label: 'Alineamiento de marca',     pct: 44, trend: 'down'   },
    { id: 'f2', label: 'Respuesta corporativa ágil', pct: 32, trend: 'up'     },
    { id: 'f3', label: 'Sostenibilidad y valores',  pct: 18, trend: 'stable' },
    { id: 'f4', label: 'Debate publicitario',       pct: 6,  trend: 'down'   },
  ],
  ai_recommendations: [],
  critical_news: [
    { id: 'cn1', source: 'Marca',          headline: 'Nike responde a la polémica con un comunicado oficial', published_at: daysAgo(3.5), sentiment: 'neutro',   url: '#' },
    { id: 'cn2', source: 'Vogue Business', headline: 'Crisis de marca: cómo Nike cerró el incendio en 48h',   published_at: daysAgo(2.5), sentiment: 'positivo', url: '#' },
    { id: 'cn3', source: 'As',             headline: 'Atletas patrocinados defienden públicamente a la marca',published_at: daysAgo(3),   sentiment: 'positivo', url: '#' },
    { id: 'cn4', source: 'El Mundo',       headline: 'El boicot pierde fuerza en redes tras el ajuste',       published_at: daysAgo(2.2), sentiment: 'neutro',   url: '#' },
  ],
  top_amplifiers: [
    { source: 'Marca',          pct: 26, mentions: 72 },
    { source: 'As',             pct: 20, mentions: 55 },
    { source: 'Vogue Business', pct: 16, mentions: 44 },
    { source: 'El Mundo',       pct: 12, mentions: 33 },
    { source: 'Sport',          pct: 10, mentions: 28 },
    { source: 'Expansión',      pct: 9,  mentions: 24 },
    { source: 'La Vanguardia',  pct: 7,  mentions: 19 },
  ],
  is_mock: true,
};

// ── Exports ──────────────────────────────────────────────────────────────────

export const MOCK_CRISES: Crisis[] = [CRISIS_BBVA, CRISIS_ECONOMICA, CRISIS_NIKE];

export function findMockCrisis(id: string): Crisis | undefined {
  return MOCK_CRISES.find((c) => c.id === id);
}
