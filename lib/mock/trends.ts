import type {
  Trend,
  EmergingTopic,
  TrendType,
  TrendTimelinePoint,
} from '@/lib/types/trends';

// ── Helpers ──────────────────────────────────────────────────────────────────

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const daysAgo  = (d: number) => new Date(now - d * 86400_000).toISOString();

function timeline30d(base: number, growth: number, seed: number): TrendTimelinePoint[] {
  const out: TrendTimelinePoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400_000);
    const iso = d.toISOString().slice(0, 10);
    const wobble = Math.sin(seed + i * 0.3) * 0.12 + 1;
    const progress = (29 - i) / 29;
    const value = base + (growth * progress);
    out.push({ date: iso, value: Math.max(0, Math.round(value * wobble)) });
  }
  return out;
}

// ── Trends ───────────────────────────────────────────────────────────────────

export const MOCK_TRENDS: Trend[] = [
  // 1. volume_spike · radar Crisis sector banca (BBVA/Sabadell)
  {
    id: 'trend-mock-1',
    subject_type: 'radar',
    subject_id: 'mock-crisis-banca',
    subject_name: 'Crisis sector banca',
    type: 'volume_spike',
    direction: 'up',
    title: 'Pico de volumen +187% en el radar BBVA-Sabadell',
    description: 'La OPA sobre Sabadell ha disparado las menciones en las últimas 4 horas, con entrada fuerte de cabeceras económicas.',
    magnitude: 187,
    confidence: 92,
    velocity: 45.3,
    detected_at: hoursAgo(4),
    window_start: hoursAgo(6),
    window_end:   hoursAgo(0),
    metadata: {
      current_value: 247,
      baseline: 86,
      peak: 312,
      new_keywords: ['CNMC', 'concentración bancaria', 'veto', 'OPA hostil'],
      top_sources: ['El País', 'Expansión', 'Cinco Días', 'El Confidencial'],
    },
    sparkline_data: [12, 14, 13, 15, 18, 22, 28, 41, 63, 92, 140, 247],
    timeline_30d: timeline30d(80, 167, 1.1),
    narrative_text: 'El radar detecta un repunte brusco de cobertura tras la nueva oferta de BBVA al consejo del Sabadell. La prensa económica lidera el volumen mientras los medios generalistas amplifican el ángulo regulatorio.',
    related_news: [
      { id: 'n1-1', source: 'El Confidencial', headline: 'BBVA eleva la oferta por Sabadell en mitad del consejo', published_at: hoursAgo(1),  sentiment: 'neutro',   url: '#' },
      { id: 'n1-2', source: 'Expansión',       headline: 'La CNMC abre revisión formal de plazos',             published_at: hoursAgo(3),  sentiment: 'neutro',   url: '#' },
      { id: 'n1-3', source: 'El País',         headline: 'Gobierno catalán se pronuncia contra la operación',  published_at: hoursAgo(6),  sentiment: 'negativo', url: '#' },
      { id: 'n1-4', source: 'Cinco Días',      headline: 'Accionistas minoritarios piden transparencia',       published_at: hoursAgo(9),  sentiment: 'negativo', url: '#' },
    ],
    top_sources_breakdown: [
      { source: 'El Confidencial', pct: 24, mentions: 59 },
      { source: 'Expansión',       pct: 21, mentions: 52 },
      { source: 'El País',         pct: 17, mentions: 42 },
      { source: 'Cinco Días',      pct: 14, mentions: 35 },
      { source: 'El Mundo',        pct: 9,  mentions: 22 },
    ],
    is_highlighted: true,
    is_mock: true,
  },

  // 2. new_framing · radar Política económica Gobierno
  {
    id: 'trend-mock-2',
    subject_type: 'radar',
    subject_id: 'mock-politica-economica',
    subject_name: 'Política económica Gobierno',
    type: 'new_framing',
    direction: 'up',
    title: 'Nuevo encuadre: "agotamiento del ciclo económico"',
    description: 'Tres cabeceras han introducido el marco "agotamiento del ciclo" en las últimas 6 horas, desplazando al relato anterior de "resiliencia".',
    magnitude: 3,
    confidence: 81,
    velocity: 12.4,
    detected_at: hoursAgo(6),
    window_start: hoursAgo(24),
    window_end:   hoursAgo(0),
    metadata: {
      current_value: 3,
      baseline: 0,
      peak: 3,
      new_keywords: ['agotamiento', 'ciclo económico', 'desaceleración', 'techo de crecimiento'],
      top_sources: ['Expansión', 'El Mundo', 'ABC'],
    },
    sparkline_data: [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3],
    timeline_30d: timeline30d(8, 14, 2.3),
    narrative_text: 'Un encuadre conservador sobre la economía está ganando tracción. Los tres medios que lo lanzaron comparten ángulo: fin de ciclo, no crisis aguda.',
    related_news: [
      { id: 'n2-1', source: 'Expansión', headline: 'Llega el agotamiento del ciclo, avisan los analistas',     published_at: hoursAgo(2), sentiment: 'negativo', url: '#' },
      { id: 'n2-2', source: 'El Mundo',  headline: 'La economía española entra en fase de techo',               published_at: hoursAgo(4), sentiment: 'negativo', url: '#' },
      { id: 'n2-3', source: 'ABC',       headline: 'Las señales del fin de ciclo: empleo, crédito y consumo',    published_at: hoursAgo(5), sentiment: 'negativo', url: '#' },
    ],
    top_sources_breakdown: [
      { source: 'Expansión', pct: 45, mentions: 14 },
      { source: 'El Mundo',  pct: 30, mentions: 9  },
      { source: 'ABC',       pct: 25, mentions: 8  },
    ],
    is_highlighted: true,
    is_mock: true,
  },

  // 3. sentiment_shift · señal BBVA
  {
    id: 'trend-mock-3',
    subject_type: 'signal',
    subject_id: 'mock-bbva',
    subject_name: 'BBVA',
    type: 'sentiment_shift',
    direction: 'down',
    title: 'Caída de sentimiento positivo en BBVA: 71% → 62%',
    description: 'El tono positivo ha descendido 9 puntos en 6 horas, empujado por titulares que cuestionan la agresividad de la OPA.',
    magnitude: 9,
    confidence: 88,
    velocity: 1.5,
    detected_at: hoursAgo(6),
    window_start: hoursAgo(24),
    window_end:   hoursAgo(0),
    metadata: {
      current_value: 62,
      baseline: 71,
      peak: 75,
      new_keywords: ['hostil', 'agresividad', 'rechazo consejo'],
      top_sources: ['El País', 'La Vanguardia', 'eldiario.es'],
    },
    sparkline_data: [75, 73, 72, 72, 71, 70, 68, 66, 65, 64, 63, 62],
    timeline_30d: timeline30d(72, -10, 3.7),
    narrative_text: 'La cobertura positiva cede frente a piezas críticas. El marco "hostilidad" se consolida.',
    related_news: [
      { id: 'n3-1', source: 'El País',        headline: 'Sabadell acusa a BBVA de maniobra hostil', published_at: hoursAgo(2), sentiment: 'negativo', url: '#' },
      { id: 'n3-2', source: 'La Vanguardia',  headline: '¿Es sana tanta concentración bancaria?',   published_at: hoursAgo(5), sentiment: 'negativo', url: '#' },
      { id: 'n3-3', source: 'eldiario.es',    headline: 'Los clientes catalanes, en el ojo del huracán', published_at: hoursAgo(7), sentiment: 'negativo', url: '#' },
    ],
    top_sources_breakdown: [
      { source: 'El País',       pct: 32, mentions: 48 },
      { source: 'La Vanguardia', pct: 22, mentions: 34 },
      { source: 'eldiario.es',   pct: 16, mentions: 24 },
      { source: 'El Confidencial', pct: 14, mentions: 21 },
      { source: 'ABC',           pct: 10, mentions: 15 },
    ],
    is_highlighted: true,
    is_mock: true,
  },

  // 4. sustained_growth · señal Transición energética
  {
    id: 'trend-mock-4',
    subject_type: 'signal',
    subject_id: 'mock-transicion-energetica',
    subject_name: 'Transición energética',
    type: 'sustained_growth',
    direction: 'up',
    title: 'Crecimiento sostenido +34% en 7 días',
    description: 'La señal acumula 7 días consecutivos al alza. El ritmo es moderado pero consistente.',
    magnitude: 34,
    confidence: 84,
    velocity: 4.9,
    detected_at: hoursAgo(2),
    window_start: daysAgo(7),
    window_end:   hoursAgo(0),
    metadata: {
      current_value: 162,
      baseline: 121,
      peak: 178,
      new_keywords: ['hidrógeno verde', 'autoconsumo', 'eólica marina'],
      top_sources: ['elEconomista', 'Energías Renovables', 'Cinco Días'],
    },
    sparkline_data: [120, 124, 128, 131, 137, 142, 148, 152, 156, 158, 161, 162],
    timeline_30d: timeline30d(110, 60, 4.2),
    narrative_text: 'Crecimiento limpio sin picos anómalos. La narrativa sectorial sostiene el volumen en ausencia de evento disparador.',
    related_news: [
      { id: 'n4-1', source: 'elEconomista',        headline: 'Hidrógeno verde, la apuesta de la próxima década',   published_at: hoursAgo(3),  sentiment: 'positivo', url: '#' },
      { id: 'n4-2', source: 'Energías Renovables', headline: 'El autoconsumo fotovoltaico bate récord trimestral', published_at: hoursAgo(8),  sentiment: 'positivo', url: '#' },
      { id: 'n4-3', source: 'Cinco Días',          headline: 'La inversión en eólica marina se duplica en 2026',   published_at: hoursAgo(14), sentiment: 'positivo', url: '#' },
    ],
    top_sources_breakdown: [
      { source: 'elEconomista',        pct: 28, mentions: 45 },
      { source: 'Energías Renovables', pct: 22, mentions: 36 },
      { source: 'Cinco Días',          pct: 18, mentions: 29 },
      { source: 'El País',             pct: 14, mentions: 23 },
      { source: 'Expansión',           pct: 10, mentions: 16 },
    ],
    is_highlighted: true,
    is_mock: true,
  },

  // 5. volume_spike · radar Nike orgánico
  {
    id: 'trend-mock-5',
    subject_type: 'radar',
    subject_id: 'mock-nike-organico',
    subject_name: 'Nike orgánico',
    type: 'volume_spike',
    direction: 'up',
    title: 'Pico +65% por lanzamiento de línea sostenible',
    description: 'Volumen al alza por presentación del producto reciclado, con prensa deportiva y lifestyle amplificando.',
    magnitude: 65,
    confidence: 76,
    velocity: 14.2,
    detected_at: hoursAgo(12),
    window_start: hoursAgo(18),
    window_end:   hoursAgo(0),
    metadata: {
      current_value: 148,
      baseline: 90,
      peak: 162,
      new_keywords: ['reciclado', 'flyknit', 'nike forward', 'zero waste'],
      top_sources: ['Marca', 'As', 'Vogue Business'],
    },
    sparkline_data: [85, 88, 92, 90, 94, 100, 112, 128, 140, 152, 148, 145],
    timeline_30d: timeline30d(82, 66, 5.1),
    narrative_text: 'El lanzamiento empuja un ciclo típico de 48h. La prensa deportiva amplifica producto, la lifestyle el ángulo sostenible.',
    related_news: [
      { id: 'n5-1', source: 'Marca',         headline: 'Nike presenta su línea 100% reciclada',              published_at: hoursAgo(4),  sentiment: 'positivo', url: '#' },
      { id: 'n5-2', source: 'As',            headline: 'La nueva zapatilla sostenible, al detalle',          published_at: hoursAgo(7),  sentiment: 'positivo', url: '#' },
      { id: 'n5-3', source: 'Vogue Business',headline: 'Nike apuesta por el lujo circular',                  published_at: hoursAgo(11), sentiment: 'positivo', url: '#' },
    ],
    top_sources_breakdown: [
      { source: 'Marca',          pct: 30, mentions: 44 },
      { source: 'As',             pct: 24, mentions: 36 },
      { source: 'Vogue Business', pct: 18, mentions: 27 },
      { source: 'Sport',          pct: 14, mentions: 21 },
      { source: 'El Mundo',       pct: 8,  mentions: 12 },
    ],
    is_highlighted: false,
    is_mock: true,
  },

  // 6. sustained_decline · señal Pedro Sánchez
  {
    id: 'trend-mock-6',
    subject_type: 'signal',
    subject_id: 'mock-sanchez',
    subject_name: 'Pedro Sánchez',
    type: 'sustained_decline',
    direction: 'down',
    title: 'Volumen cae -22% en 5 días',
    description: 'La señal desciende de forma sostenida, sin eventos disparadores visibles. Menor presencia en medios generalistas.',
    magnitude: 22,
    confidence: 79,
    velocity: 2.1,
    detected_at: hoursAgo(18),
    window_start: daysAgo(5),
    window_end:   hoursAgo(0),
    metadata: {
      current_value: 312,
      baseline: 402,
      peak: 418,
      new_keywords: [],
      top_sources: ['El País', 'La Vanguardia', 'ABC'],
    },
    sparkline_data: [402, 390, 380, 368, 355, 342, 338, 330, 324, 318, 314, 312],
    timeline_30d: timeline30d(400, -90, 6.4),
    narrative_text: 'Retroceso gradual coherente con el final del ciclo informativo de la semana anterior. No hay disparador puntual.',
    related_news: [
      { id: 'n6-1', source: 'El País',       headline: 'Agenda interna copa la semana presidencial',   published_at: hoursAgo(10), sentiment: 'neutro', url: '#' },
      { id: 'n6-2', source: 'La Vanguardia', headline: 'Reunión con grupos parlamentarios sin apariciones públicas', published_at: hoursAgo(22), sentiment: 'neutro', url: '#' },
    ],
    top_sources_breakdown: [
      { source: 'El País',       pct: 26, mentions: 81 },
      { source: 'La Vanguardia', pct: 18, mentions: 56 },
      { source: 'ABC',           pct: 16, mentions: 50 },
      { source: 'El Mundo',      pct: 14, mentions: 44 },
      { source: 'eldiario.es',   pct: 10, mentions: 31 },
    ],
    is_highlighted: false,
    is_mock: true,
  },

  // 7. emerging_topic · radar Coalición Gobierno
  {
    id: 'trend-mock-7',
    subject_type: 'radar',
    subject_id: 'mock-coalicion-gobierno',
    subject_name: 'Coalición Gobierno · narrativa conjunta',
    type: 'emerging_topic',
    direction: 'up',
    title: 'Emerge el concepto "geometría variable parlamentaria"',
    description: 'Término acuñado esta semana por dos medios y replicado en otros tres. Marca encuadre novedoso sobre los pactos.',
    magnitude: 23,
    confidence: 72,
    velocity: 3.8,
    detected_at: hoursAgo(20),
    window_start: daysAgo(3),
    window_end:   hoursAgo(0),
    metadata: {
      current_value: 23,
      baseline: 0,
      peak: 23,
      new_keywords: ['geometría variable', 'bloque plurinacional', 'mayoría cambiante'],
      top_sources: ['eldiario.es', 'Público', 'La Vanguardia'],
    },
    sparkline_data: [0, 0, 0, 1, 2, 3, 5, 8, 12, 16, 20, 23],
    timeline_30d: timeline30d(2, 21, 7.2),
    narrative_text: 'El término captura la volatilidad de los apoyos parlamentarios sin repetir el ya gastado "pactos puntuales".',
    related_news: [
      { id: 'n7-1', source: 'eldiario.es',   headline: 'Geometría variable: así se sostiene el Gobierno', published_at: hoursAgo(5),  sentiment: 'neutro', url: '#' },
      { id: 'n7-2', source: 'Público',       headline: 'La nueva gramática de la investidura',            published_at: hoursAgo(14), sentiment: 'neutro', url: '#' },
      { id: 'n7-3', source: 'La Vanguardia', headline: 'Bloques plurinacionales: análisis de un experimento', published_at: hoursAgo(26), sentiment: 'neutro', url: '#' },
    ],
    top_sources_breakdown: [
      { source: 'eldiario.es',   pct: 35, mentions: 8 },
      { source: 'Público',       pct: 26, mentions: 6 },
      { source: 'La Vanguardia', pct: 22, mentions: 5 },
      { source: 'ARA',           pct: 17, mentions: 4 },
    ],
    is_highlighted: false,
    is_mock: true,
  },

  // 8. source_expansion · señal Sabadell
  {
    id: 'trend-mock-8',
    subject_type: 'signal',
    subject_id: 'mock-sabadell',
    subject_name: 'Sabadell',
    type: 'source_expansion',
    direction: 'up',
    title: '8 medios extranjeros entran a cubrir la señal',
    description: 'Hasta esta semana la cobertura era doméstica. Ahora aparecen Financial Times, Reuters, Bloomberg y cinco más.',
    magnitude: 8,
    confidence: 89,
    velocity: 2.8,
    detected_at: hoursAgo(28),
    window_start: daysAgo(4),
    window_end:   hoursAgo(0),
    metadata: {
      current_value: 14,
      baseline: 6,
      peak: 14,
      new_keywords: ['hostile takeover', 'Spanish lender', 'ECB oversight'],
      top_sources: ['Financial Times', 'Reuters', 'Bloomberg', 'Le Monde'],
    },
    sparkline_data: [6, 6, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14],
    timeline_30d: timeline30d(5, 10, 8.8),
    narrative_text: 'La internacionalización de la cobertura responde al tamaño simbólico de la operación. FT y Reuters lideran.',
    related_news: [
      { id: 'n8-1', source: 'Financial Times', headline: 'BBVA-Sabadell: a test for Spain\'s banking landscape', published_at: hoursAgo(8),  sentiment: 'neutro', url: '#' },
      { id: 'n8-2', source: 'Reuters',         headline: 'Spanish lender faces hostile bid as ECB watches',       published_at: hoursAgo(16), sentiment: 'neutro', url: '#' },
      { id: 'n8-3', source: 'Bloomberg',       headline: 'Concentration risks eyed in Madrid',                   published_at: hoursAgo(22), sentiment: 'neutro', url: '#' },
    ],
    top_sources_breakdown: [
      { source: 'Financial Times', pct: 24, mentions: 14 },
      { source: 'Reuters',         pct: 20, mentions: 11 },
      { source: 'Bloomberg',       pct: 17, mentions: 10 },
      { source: 'Le Monde',        pct: 14, mentions: 8  },
      { source: 'Handelsblatt',    pct: 12, mentions: 7  },
    ],
    is_highlighted: false,
    is_mock: true,
  },

  // 9. viral_pattern · señal Albiol
  {
    id: 'trend-mock-9',
    subject_type: 'signal',
    subject_id: 'mock-albiol',
    subject_name: 'Albiol',
    type: 'viral_pattern',
    direction: 'up',
    title: 'Tweet propagado en 23 medios en 3 horas',
    description: 'Una publicación del alcalde de Badalona ha sido replicada o citada en 23 cabeceras en las últimas 3 horas.',
    magnitude: 23,
    confidence: 95,
    velocity: 7.6,
    detected_at: hoursAgo(3),
    window_start: hoursAgo(6),
    window_end:   hoursAgo(0),
    metadata: {
      current_value: 23,
      baseline: 1,
      peak: 23,
      new_keywords: ['tweet', 'viralización', 'cita textual'],
      top_sources: ['La Vanguardia', 'El Periódico', 'Nació Digital', 'ABC'],
    },
    sparkline_data: [1, 1, 2, 3, 6, 9, 13, 16, 19, 21, 22, 23],
    timeline_30d: timeline30d(1, 22, 9.1),
    narrative_text: 'Patrón clásico de propagación viral: arranque en prensa catalana, salto a estatal en ~90 minutos.',
    related_news: [
      { id: 'n9-1', source: 'La Vanguardia', headline: 'Albiol vuelve a encender la polémica en redes',  published_at: hoursAgo(1), sentiment: 'negativo', url: '#' },
      { id: 'n9-2', source: 'El Periódico',  headline: 'El tweet del alcalde indigna a la oposición',    published_at: hoursAgo(2), sentiment: 'negativo', url: '#' },
      { id: 'n9-3', source: 'ABC',           headline: 'Cataluña se tensa de nuevo por un mensaje breve', published_at: hoursAgo(2), sentiment: 'negativo', url: '#' },
    ],
    top_sources_breakdown: [
      { source: 'La Vanguardia', pct: 22, mentions: 5 },
      { source: 'El Periódico',  pct: 17, mentions: 4 },
      { source: 'Nació Digital', pct: 17, mentions: 4 },
      { source: 'ABC',           pct: 13, mentions: 3 },
      { source: 'El Mundo',      pct: 13, mentions: 3 },
    ],
    is_highlighted: false,
    is_mock: true,
  },

  // 10. recurring_pattern · señal BBVA
  {
    id: 'trend-mock-10',
    subject_type: 'signal',
    subject_id: 'mock-bbva',
    subject_name: 'BBVA',
    type: 'recurring_pattern',
    direction: 'neutral',
    title: 'Pico recurrente los lunes a primera hora',
    description: 'La señal muestra un pico estable los lunes entre 7:00 y 10:00 desde hace 6 semanas. No es anómalo, es estructural.',
    magnitude: 38,
    confidence: 93,
    velocity: 0.6,
    detected_at: hoursAgo(38),
    window_start: daysAgo(42),
    window_end:   hoursAgo(0),
    metadata: {
      current_value: 38,
      baseline: 28,
      peak: 42,
      new_keywords: ['informes semanales', 'análisis bursátil', 'apertura lunes'],
      top_sources: ['Expansión', 'Cinco Días', 'elEconomista'],
    },
    sparkline_data: [29, 40, 31, 32, 30, 41, 32, 33, 31, 42, 30, 38],
    timeline_30d: timeline30d(30, 5, 10.3),
    narrative_text: 'Patrón semanal ligado a aperturas de mercado y revisiones analíticas. Útil para calibrar baselines dinámicas.',
    related_news: [
      { id: 'n10-1', source: 'Expansión',    headline: 'Los analistas revisan al alza el precio objetivo',     published_at: hoursAgo(30), sentiment: 'positivo', url: '#' },
      { id: 'n10-2', source: 'Cinco Días',   headline: 'BBVA abre la semana con volumen por encima del tipo', published_at: hoursAgo(34), sentiment: 'neutro',   url: '#' },
    ],
    top_sources_breakdown: [
      { source: 'Expansión',    pct: 34, mentions: 36 },
      { source: 'Cinco Días',   pct: 28, mentions: 30 },
      { source: 'elEconomista', pct: 18, mentions: 19 },
      { source: 'El País',      pct: 12, mentions: 13 },
      { source: 'El Mundo',     pct: 8,  mentions: 8  },
    ],
    is_highlighted: false,
    is_mock: true,
  },
];

// ── Emerging topics (rendered in the horizontal scroller) ────────────────────

export const MOCK_EMERGING_TOPICS: EmergingTopic[] = [
  { id: 'et-1', word: 'agotamiento ciclo económico', mentions: 47, sources: 8,  growth_pct: 340, window_hours: 48 },
  { id: 'et-2', word: 'geometría variable',          mentions: 23, sources: 5,  growth_pct: 180, window_hours: 72 },
  { id: 'et-3', word: 'veto CNMC',                   mentions: 62, sources: 12, growth_pct: 215, window_hours: 24 },
  { id: 'et-4', word: 'OPA hostil',                  mentions: 89, sources: 14, growth_pct: 420, window_hours: 12 },
  { id: 'et-5', word: 'concentración bancaria',      mentions: 34, sources: 6,  growth_pct: 95,  window_hours: 72 },
  { id: 'et-6', word: 'moneda digital BCE',          mentions: 18, sources: 4,  growth_pct: 140, window_hours: 96 },
  { id: 'et-7', word: 'hidrógeno verde',             mentions: 29, sources: 7,  growth_pct: 85,  window_hours: 168 },
];

// ── Lookups & helpers ────────────────────────────────────────────────────────

export function findMockTrend(id: string): Trend | undefined {
  return MOCK_TRENDS.find((t) => t.id === id);
}

export const TREND_TYPE_ORDER: TrendType[] = [
  'volume_spike',
  'sustained_growth',
  'sustained_decline',
  'sentiment_shift',
  'new_framing',
  'source_expansion',
  'emerging_topic',
  'viral_pattern',
  'recurring_pattern',
];
