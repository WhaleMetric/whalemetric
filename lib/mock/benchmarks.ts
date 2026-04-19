import type {
  Benchmark,
  BenchmarkActor,
  BenchmarkSnapshot,
  ActorMetrics,
  TimelineData,
  RecentNewsItem,
} from '@/lib/types/benchmark';

// ── Helpers ───────────────────────────────────────────────────────────────────

function hoursAgoISO(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function buildTimeline(
  actorIds: string[],
  baseSovByActor: Record<string, number>,
  days: number,
  seed = 1,
): TimelineData {
  const points = [];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const iso = d.toISOString().slice(0, 10);
    // jitter each actor's SoV around its base, then re-normalize to 100
    const raw: Record<string, number> = {};
    for (const a of actorIds) {
      const base = baseSovByActor[a] ?? 10;
      const jitter = (rand() - 0.5) * Math.min(8, base * 0.4);
      raw[a] = Math.max(1, base + jitter);
    }
    const total = Object.values(raw).reduce((acc, v) => acc + v, 0);
    const norm: Record<string, number> = {};
    for (const a of actorIds) norm[a] = Math.round((raw[a] / total) * 1000) / 10;
    points.push({ date: iso, values: norm });
  }
  return { points };
}

// ── Benchmark 1: Supermercados en Badalona ───────────────────────────────────

const SUPERS_ACTORS: BenchmarkActor[] = [
  { id: 'mock-bm1-mercadona', display_name: 'Mercadona',  role: 'primary',    color: '#0F172A', position: 0 },
  { id: 'mock-bm1-lidl',      display_name: 'Lidl',       role: 'competitor', color: '#1E3A8A', position: 1 },
  { id: 'mock-bm1-carrefour', display_name: 'Carrefour',  role: 'competitor', color: '#2563EB', position: 2 },
  { id: 'mock-bm1-aldi',      display_name: 'Aldi',       role: 'competitor', color: '#0891B2', position: 3 },
  { id: 'mock-bm1-dia',       display_name: 'Dia',        role: 'competitor', color: '#0D9488', position: 4 },
];

const SUPERS_METRICS: ActorMetrics[] = [
  { actor_id: 'mock-bm1-mercadona', mentions: 850, sov_pct: 45, sentiment_positive_pct: 68, sentiment_neutral_pct: 22, sentiment_negative_pct: 10, reach: 12_500_000, delta_mentions_pct: 12,  delta_sov_pp: 3,  avg_sentiment_score: 0.58 },
  { actor_id: 'mock-bm1-lidl',      mentions: 380, sov_pct: 20, sentiment_positive_pct: 72, sentiment_neutral_pct: 20, sentiment_negative_pct: 8,  reach: 5_800_000,  delta_mentions_pct: 8,   delta_sov_pp: 0,  avg_sentiment_score: 0.64 },
  { actor_id: 'mock-bm1-carrefour', mentions: 340, sov_pct: 18, sentiment_positive_pct: 58, sentiment_neutral_pct: 28, sentiment_negative_pct: 14, reach: 5_100_000,  delta_mentions_pct: -3,  delta_sov_pp: 0,  avg_sentiment_score: 0.44 },
  { actor_id: 'mock-bm1-aldi',      mentions: 190, sov_pct: 10, sentiment_positive_pct: 65, sentiment_neutral_pct: 25, sentiment_negative_pct: 10, reach: 2_900_000,  delta_mentions_pct: 15,  delta_sov_pp: 1,  avg_sentiment_score: 0.55 },
  { actor_id: 'mock-bm1-dia',       mentions: 130, sov_pct: 7,  sentiment_positive_pct: 42, sentiment_neutral_pct: 28, sentiment_negative_pct: 30, reach: 2_000_000,  delta_mentions_pct: -22, delta_sov_pp: -2, avg_sentiment_score: 0.12 },
];

const SUPERS_RECENT_NEWS: RecentNewsItem[] = [
  { id: 'n1',  headline: 'Mercadona abre nuevo supermercado en el centro de Badalona', source: 'La Vanguardia',  published_at: hoursAgoISO(2),  sentiment: 'positivo', actor_id: 'mock-bm1-mercadona', url: '#' },
  { id: 'n2',  headline: 'Dia anuncia el cierre de 40 tiendas en Cataluña',            source: 'El Confidencial', published_at: hoursAgoISO(5),  sentiment: 'negativo', actor_id: 'mock-bm1-dia',       url: '#' },
  { id: 'n3',  headline: 'Lidl lidera la cesta más barata según la OCU',               source: '20 Minutos',      published_at: hoursAgoISO(7),  sentiment: 'positivo', actor_id: 'mock-bm1-lidl',      url: '#' },
  { id: 'n4',  headline: 'Carrefour reestructura su modelo de hipermercado',            source: 'El País',         published_at: hoursAgoISO(12), sentiment: 'neutro',   actor_id: 'mock-bm1-carrefour', url: '#' },
  { id: 'n5',  headline: 'Mercadona convierte a 1.500 trabajadores en indefinidos',    source: 'Expansión',       published_at: hoursAgoISO(18), sentiment: 'positivo', actor_id: 'mock-bm1-mercadona', url: '#' },
  { id: 'n6',  headline: 'Aldi triplica aperturas en España este trimestre',            source: 'El Español',      published_at: hoursAgoISO(24), sentiment: 'positivo', actor_id: 'mock-bm1-aldi',      url: '#' },
  { id: 'n7',  headline: 'La marca Hacendado domina la compra de productos básicos',   source: 'Cinco Días',      published_at: hoursAgoISO(30), sentiment: 'positivo', actor_id: 'mock-bm1-mercadona', url: '#' },
  { id: 'n8',  headline: 'Dia bajo la lupa: dudas sobre su plan financiero',            source: 'OKDiario',        published_at: hoursAgoISO(36), sentiment: 'negativo', actor_id: 'mock-bm1-dia',       url: '#' },
  { id: 'n9',  headline: 'Lidl lanza nueva línea non-food de productos alemanes',       source: 'El Confidencial', published_at: hoursAgoISO(42), sentiment: 'neutro',   actor_id: 'mock-bm1-lidl',      url: '#' },
  { id: 'n10', headline: 'Carrefour Express acelera su implantación en barrios',        source: 'Antena 3',        published_at: hoursAgoISO(48), sentiment: 'neutro',   actor_id: 'mock-bm1-carrefour', url: '#' },
];

const SUPERS_SNAPSHOT: BenchmarkSnapshot = {
  narrative_text:
    'Mercadona lidera con casi el doble de menciones que el segundo competidor, impulsado por su expansión en Cataluña y las nuevas iniciativas de economía circular. Dia registra caída significativa por la cobertura crítica de sus dificultades financieras y cierre de establecimientos. Lidl mantiene el mejor clima de opinión con cobertura positiva sobre calidad-precio.',
  narrative_tags: ['expansión', 'sostenibilidad', 'cierre tiendas', 'marca blanca', 'precio cesta', 'apertura Badalona'],
  actors_metrics: SUPERS_METRICS,
  timeline_comparison: buildTimeline(
    SUPERS_ACTORS.map((a) => a.id),
    { 'mock-bm1-mercadona': 45, 'mock-bm1-lidl': 20, 'mock-bm1-carrefour': 18, 'mock-bm1-aldi': 10, 'mock-bm1-dia': 7 },
    30,
    17,
  ),
  media_type_breakdown: {
    digital: [
      { actor_id: 'mock-bm1-mercadona', pct: 42 },
      { actor_id: 'mock-bm1-lidl',      pct: 24 },
      { actor_id: 'mock-bm1-carrefour', pct: 16 },
      { actor_id: 'mock-bm1-aldi',      pct: 11 },
      { actor_id: 'mock-bm1-dia',       pct: 7 },
    ],
    escrita: [
      { actor_id: 'mock-bm1-mercadona', pct: 52 },
      { actor_id: 'mock-bm1-carrefour', pct: 20 },
      { actor_id: 'mock-bm1-lidl',      pct: 14 },
      { actor_id: 'mock-bm1-aldi',      pct: 8 },
      { actor_id: 'mock-bm1-dia',       pct: 6 },
    ],
    tv: [
      { actor_id: 'mock-bm1-mercadona', pct: 38 },
      { actor_id: 'mock-bm1-carrefour', pct: 24 },
      { actor_id: 'mock-bm1-lidl',      pct: 18 },
      { actor_id: 'mock-bm1-aldi',      pct: 12 },
      { actor_id: 'mock-bm1-dia',       pct: 8 },
    ],
    radio: [
      { actor_id: 'mock-bm1-mercadona', pct: 46 },
      { actor_id: 'mock-bm1-lidl',      pct: 19 },
      { actor_id: 'mock-bm1-carrefour', pct: 17 },
      { actor_id: 'mock-bm1-aldi',      pct: 10 },
      { actor_id: 'mock-bm1-dia',       pct: 8 },
    ],
  },
  top_sources_per_actor: {
    by_actor: {
      'mock-bm1-mercadona': [
        { source: 'Expansión',      pct: 18 },
        { source: 'Cinco Días',     pct: 14 },
        { source: 'La Vanguardia',  pct: 12 },
        { source: 'El País',        pct: 9 },
        { source: 'ABC',            pct: 7 },
      ],
      'mock-bm1-lidl': [
        { source: '20 Minutos',     pct: 22 },
        { source: 'El Confidencial',pct: 18 },
        { source: 'La Razón',       pct: 12 },
        { source: 'El Mundo',       pct: 10 },
        { source: 'La Vanguardia',  pct: 8 },
      ],
      'mock-bm1-carrefour': [
        { source: 'El País',        pct: 20 },
        { source: 'Antena 3',       pct: 16 },
        { source: 'ABC',            pct: 12 },
        { source: 'El Mundo',       pct: 10 },
        { source: 'Cinco Días',     pct: 9 },
      ],
      'mock-bm1-aldi': [
        { source: 'El Español',     pct: 24 },
        { source: 'El Mundo',       pct: 16 },
        { source: 'La Razón',       pct: 12 },
        { source: '20 Minutos',     pct: 10 },
        { source: 'El País',        pct: 8 },
      ],
      'mock-bm1-dia': [
        { source: 'El Confidencial',pct: 28 },
        { source: 'OKDiario',       pct: 22 },
        { source: 'El Español',     pct: 14 },
        { source: 'El Mundo',       pct: 10 },
        { source: 'Expansión',      pct: 8 },
      ],
    },
  },
  keyword_analysis: {
    actors: [
      { actor_id: 'mock-bm1-mercadona', unique: ['expansión portugal', 'ana villa', 'marca hacendado', 'trabajadores indefinidos'], shared_count: 23 },
      { actor_id: 'mock-bm1-lidl',      unique: ['calidad-precio', 'productos alemanes', 'non-food'], shared_count: 19 },
      { actor_id: 'mock-bm1-carrefour', unique: ['hipermercado', 'carrefour express'], shared_count: 17 },
      { actor_id: 'mock-bm1-aldi',      unique: ['apertura express', 'cesta básica'], shared_count: 15 },
      { actor_id: 'mock-bm1-dia',       unique: ['ere', 'cierre tiendas', 'dificultades financieras', 'fondos buitre'], shared_count: 11 },
    ],
  },
  ranking: {
    entries: [
      { actor_id: 'mock-bm1-mercadona', position: 1, previous_position: 1 },
      { actor_id: 'mock-bm1-lidl',      position: 2, previous_position: 2 },
      { actor_id: 'mock-bm1-carrefour', position: 3, previous_position: 3 },
      { actor_id: 'mock-bm1-aldi',      position: 4, previous_position: 5 },
      { actor_id: 'mock-bm1-dia',       position: 5, previous_position: 4 },
    ],
  },
  recent_news: { items: SUPERS_RECENT_NEWS },
  has_enough_data: true,
};

const BENCHMARK_SUPERS: Benchmark = {
  id: 'mock-bm-supermercados-badalona',
  name: 'Supermercados en Badalona',
  description: 'Cobertura mediática comparada de las grandes cadenas de supermercados con presencia en la ciudad.',
  category: 'marca',
  default_period: '30d',
  is_favorite: true,
  status: 'ready',
  last_viewed_at: hoursAgoISO(3),
  created_at: daysAgoISO(45),
  updated_at: hoursAgoISO(3),
  actors: SUPERS_ACTORS,
  snapshot: SUPERS_SNAPSHOT,
  is_mock: true,
};

// ── Benchmark 2: Energéticas en España ───────────────────────────────────────

const ENERGY_ACTORS: BenchmarkActor[] = [
  { id: 'mock-bm2-iberdrola', display_name: 'Iberdrola', role: 'primary',    color: '#0F172A', position: 0 },
  { id: 'mock-bm2-endesa',    display_name: 'Endesa',    role: 'competitor', color: '#1E3A8A', position: 1 },
  { id: 'mock-bm2-naturgy',   display_name: 'Naturgy',   role: 'competitor', color: '#0891B2', position: 2 },
  { id: 'mock-bm2-repsol',    display_name: 'Repsol',    role: 'competitor', color: '#2563EB', position: 3 },
  { id: 'mock-bm2-edp',       display_name: 'EDP',       role: 'competitor', color: '#0D9488', position: 4 },
];

const ENERGY_METRICS: ActorMetrics[] = [
  { actor_id: 'mock-bm2-iberdrola', mentions: 720, sov_pct: 38, sentiment_positive_pct: 55, sentiment_neutral_pct: 30, sentiment_negative_pct: 15, reach: 10_800_000, delta_mentions_pct: 18, delta_sov_pp: 2,  avg_sentiment_score: 0.40 },
  { actor_id: 'mock-bm2-endesa',    mentions: 450, sov_pct: 24, sentiment_positive_pct: 48, sentiment_neutral_pct: 32, sentiment_negative_pct: 20, reach: 6_700_000,  delta_mentions_pct: 5,  delta_sov_pp: -1, avg_sentiment_score: 0.28 },
  { actor_id: 'mock-bm2-repsol',    mentions: 340, sov_pct: 18, sentiment_positive_pct: 52, sentiment_neutral_pct: 30, sentiment_negative_pct: 18, reach: 5_100_000,  delta_mentions_pct: 25, delta_sov_pp: 4,  avg_sentiment_score: 0.34 },
  { actor_id: 'mock-bm2-naturgy',   mentions: 230, sov_pct: 12, sentiment_positive_pct: 45, sentiment_neutral_pct: 38, sentiment_negative_pct: 17, reach: 3_400_000,  delta_mentions_pct: 2,  delta_sov_pp: -3, avg_sentiment_score: 0.28 },
  { actor_id: 'mock-bm2-edp',       mentions: 150, sov_pct: 8,  sentiment_positive_pct: 58, sentiment_neutral_pct: 32, sentiment_negative_pct: 10, reach: 2_200_000,  delta_mentions_pct: 8,  delta_sov_pp: 0,  avg_sentiment_score: 0.48 },
];

const ENERGY_RECENT_NEWS: RecentNewsItem[] = [
  { id: 'e1',  headline: 'Iberdrola cierra contrato histórico de eólica marina en EEUU',  source: 'Financial Times', published_at: hoursAgoISO(1),  sentiment: 'positivo', actor_id: 'mock-bm2-iberdrola', url: '#' },
  { id: 'e2',  headline: 'Repsol acelera su pivote a biocombustibles',                     source: 'Expansión',       published_at: hoursAgoISO(4),  sentiment: 'positivo', actor_id: 'mock-bm2-repsol',    url: '#' },
  { id: 'e3',  headline: 'Endesa presenta resultados del primer trimestre',                source: 'El Mundo',        published_at: hoursAgoISO(8),  sentiment: 'neutro',   actor_id: 'mock-bm2-endesa',    url: '#' },
  { id: 'e4',  headline: 'Naturgy valora su próximo movimiento tras los cambios en Criteria', source: 'Cinco Días',   published_at: hoursAgoISO(14), sentiment: 'neutro',   actor_id: 'mock-bm2-naturgy',   url: '#' },
  { id: 'e5',  headline: 'Galán (Iberdrola) reafirma apuesta por el hidrógeno verde',      source: 'Cinco Días',      published_at: hoursAgoISO(20), sentiment: 'positivo', actor_id: 'mock-bm2-iberdrola', url: '#' },
  { id: 'e6',  headline: 'EDP Renováveis anuncia nuevo parque eólico en Portugal',         source: 'El Español',      published_at: hoursAgoISO(26), sentiment: 'positivo', actor_id: 'mock-bm2-edp',       url: '#' },
  { id: 'e7',  headline: 'Repsol defiende su estrategia upstream ante accionistas',        source: 'ABC',             published_at: hoursAgoISO(32), sentiment: 'neutro',   actor_id: 'mock-bm2-repsol',    url: '#' },
  { id: 'e8',  headline: 'Endesa explora extender la vida de las nucleares',               source: 'La Vanguardia',   published_at: hoursAgoISO(38), sentiment: 'neutro',   actor_id: 'mock-bm2-endesa',    url: '#' },
  { id: 'e9',  headline: 'Naturgy evalúa una OPV parcial, según fuentes del mercado',      source: 'Cinco Días',      published_at: hoursAgoISO(44), sentiment: 'neutro',   actor_id: 'mock-bm2-naturgy',   url: '#' },
  { id: 'e10', headline: 'Iberdrola y Avangrid refuerzan su red eléctrica en Nueva York',  source: 'Expansión',       published_at: hoursAgoISO(50), sentiment: 'positivo', actor_id: 'mock-bm2-iberdrola', url: '#' },
];

const ENERGY_SNAPSHOT: BenchmarkSnapshot = {
  narrative_text:
    'Iberdrola mantiene el liderazgo mediático del sector energético, con una narrativa dominada por la expansión en renovables y contratos internacionales. Repsol registra el mayor crecimiento de atención por su pivote hacia energías limpias y los resultados del primer trimestre. El debate sobre el precio de la luz y la descarbonización domina transversalmente toda la categoría.',
  narrative_tags: ['renovables', 'descarbonización', 'precio luz', 'hidrógeno verde', 'inversión EEUU', 'resultados Q1'],
  actors_metrics: ENERGY_METRICS,
  timeline_comparison: buildTimeline(
    ENERGY_ACTORS.map((a) => a.id),
    { 'mock-bm2-iberdrola': 38, 'mock-bm2-endesa': 24, 'mock-bm2-repsol': 18, 'mock-bm2-naturgy': 12, 'mock-bm2-edp': 8 },
    30,
    42,
  ),
  media_type_breakdown: {
    digital: [
      { actor_id: 'mock-bm2-iberdrola', pct: 40 },
      { actor_id: 'mock-bm2-endesa',    pct: 22 },
      { actor_id: 'mock-bm2-repsol',    pct: 18 },
      { actor_id: 'mock-bm2-naturgy',   pct: 12 },
      { actor_id: 'mock-bm2-edp',       pct: 8 },
    ],
    escrita: [
      { actor_id: 'mock-bm2-iberdrola', pct: 36 },
      { actor_id: 'mock-bm2-endesa',    pct: 28 },
      { actor_id: 'mock-bm2-repsol',    pct: 18 },
      { actor_id: 'mock-bm2-naturgy',   pct: 11 },
      { actor_id: 'mock-bm2-edp',       pct: 7 },
    ],
    tv: [
      { actor_id: 'mock-bm2-iberdrola', pct: 34 },
      { actor_id: 'mock-bm2-endesa',    pct: 26 },
      { actor_id: 'mock-bm2-repsol',    pct: 20 },
      { actor_id: 'mock-bm2-naturgy',   pct: 14 },
      { actor_id: 'mock-bm2-edp',       pct: 6 },
    ],
    radio: [
      { actor_id: 'mock-bm2-iberdrola', pct: 38 },
      { actor_id: 'mock-bm2-endesa',    pct: 24 },
      { actor_id: 'mock-bm2-repsol',    pct: 18 },
      { actor_id: 'mock-bm2-naturgy',   pct: 12 },
      { actor_id: 'mock-bm2-edp',       pct: 8 },
    ],
  },
  top_sources_per_actor: {
    by_actor: {
      'mock-bm2-iberdrola': [
        { source: 'Expansión',        pct: 22 },
        { source: 'Cinco Días',       pct: 18 },
        { source: 'El País',          pct: 12 },
        { source: 'Financial Times',  pct: 10 },
        { source: 'La Vanguardia',    pct: 8 },
      ],
      'mock-bm2-endesa': [
        { source: 'El Mundo',         pct: 20 },
        { source: 'La Vanguardia',    pct: 16 },
        { source: 'Expansión',        pct: 14 },
        { source: 'ABC',              pct: 10 },
        { source: 'Cinco Días',       pct: 8 },
      ],
      'mock-bm2-naturgy': [
        { source: 'Cinco Días',       pct: 22 },
        { source: 'La Razón',         pct: 16 },
        { source: 'El Confidencial',  pct: 12 },
        { source: 'Expansión',        pct: 10 },
        { source: 'El Mundo',         pct: 8 },
      ],
      'mock-bm2-repsol': [
        { source: 'Expansión',        pct: 24 },
        { source: 'ABC',              pct: 16 },
        { source: 'El Confidencial',  pct: 14 },
        { source: 'Cinco Días',       pct: 10 },
        { source: 'El Mundo',         pct: 8 },
      ],
      'mock-bm2-edp': [
        { source: 'El Español',       pct: 26 },
        { source: 'Expansión',        pct: 14 },
        { source: 'Cinco Días',       pct: 12 },
        { source: 'La Vanguardia',    pct: 8 },
        { source: 'El País',          pct: 6 },
      ],
    },
  },
  keyword_analysis: {
    actors: [
      { actor_id: 'mock-bm2-iberdrola', unique: ['galán', 'avangrid', 'eeuu', 'offshore wind'], shared_count: 26 },
      { actor_id: 'mock-bm2-endesa',    unique: ['enel', 'imaz', 'nucleares'], shared_count: 22 },
      { actor_id: 'mock-bm2-naturgy',   unique: ['reynolds', 'ipo', 'criteria'], shared_count: 18 },
      { actor_id: 'mock-bm2-repsol',    unique: ['brufau', 'biocombustibles', 'upstream'], shared_count: 20 },
      { actor_id: 'mock-bm2-edp',       unique: ['portugal', 'edp renováveis'], shared_count: 14 },
    ],
  },
  ranking: {
    entries: [
      { actor_id: 'mock-bm2-iberdrola', position: 1, previous_position: 1 },
      { actor_id: 'mock-bm2-endesa',    position: 2, previous_position: 2 },
      { actor_id: 'mock-bm2-repsol',    position: 3, previous_position: 4 },
      { actor_id: 'mock-bm2-naturgy',   position: 4, previous_position: 3 },
      { actor_id: 'mock-bm2-edp',       position: 5, previous_position: 5 },
    ],
  },
  recent_news: { items: ENERGY_RECENT_NEWS },
  has_enough_data: true,
};

const BENCHMARK_ENERGY: Benchmark = {
  id: 'mock-bm-energeticas-espana',
  name: 'Energéticas en España',
  description: 'Cobertura mediática de las principales compañías del sector energético nacional.',
  category: 'marca',
  default_period: '30d',
  is_favorite: false,
  status: 'ready',
  last_viewed_at: hoursAgoISO(28),
  created_at: daysAgoISO(60),
  updated_at: hoursAgoISO(28),
  actors: ENERGY_ACTORS,
  snapshot: ENERGY_SNAPSHOT,
  is_mock: true,
};

// ── Exports ───────────────────────────────────────────────────────────────────

export const MOCK_BENCHMARKS: Benchmark[] = [BENCHMARK_SUPERS, BENCHMARK_ENERGY];

export function findMockBenchmark(id: string): Benchmark | null {
  return MOCK_BENCHMARKS.find((b) => b.id === id) ?? null;
}
