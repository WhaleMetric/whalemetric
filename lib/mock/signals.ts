// ─────────────────────────────────────────────────────────
//  Tipos
// ─────────────────────────────────────────────────────────

export type SignalCategory =
  | 'marca'
  | 'persona'
  | 'zona_geografica'
  | 'tema_sector'
  | 'competidor';

export type Sentiment = 'positivo' | 'neutro' | 'negativo';

export interface VolumeDataPoint {
  date: string; // "2026-04-01"
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentDataPoint {
  date: string;
  positive: number; // 0-100 (%)
  negative: number; // 0-100 (%)
}

export interface TrendIndicator {
  label: string;
  value: string;
  delta: number; // positive = up, negative = down
  unit?: string;
}

export interface NarrativeFrame {
  label: string;
  pct: number; // 0-100
}

export interface SourceDistribution {
  label: string;
  pct: number;
}

export interface MediaVariation {
  label: string;
  value: number;
  variationPct: number; // negative = less coverage (good for crises), positive = more
}

export interface Keyword {
  word: string;
  count: number;
  sentiment: Sentiment;
}

export interface AlertHistoryItem {
  id: string;
  timestamp: string; // ISO
  type: 'spike' | 'new_frame' | 'sentiment_shift' | 'viral';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  publishedAt: string; // ISO
  sentiment: Sentiment;
  frame: string;
  url: string;
}

export interface AINarrative {
  summary: string;
  tags: string[];
}

export interface SignalKpi {
  mentionsToday: number;
  mentionsDelta: number; // vs yesterday (%)
  reach: number; // estimated reach in thousands
  reachDelta: number;
  sentimentScore: number; // 0-100 positive sentiment
  sentimentDelta: number;
  activeSources: number;
  activeSourcesDelta: number;
}

export interface Signal {
  id: string;
  name: string;
  category: SignalCategory;
  isFavorite: boolean;
  hasAlert: boolean;
  mentionsToday: number;
  isInactive: boolean;
  lastUpdated: string; // ISO
  kpis: SignalKpi;
  narrative: AINarrative;
  volumeData: VolumeDataPoint[];
  sentimentData: SentimentDataPoint[];
  trendIndicators: TrendIndicator[];
  narrativeFrames: NarrativeFrame[];
  sourceDistribution: SourceDistribution[];
  mediaVariation: MediaVariation[];
  keywords: Keyword[];
  alertHistory: AlertHistoryItem[];
  recentNews: NewsItem[];
}

// ─────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date('2026-04-16');
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function hoursAgo(n: number): string {
  const d = new Date('2026-04-16T10:00:00Z');
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function genVolume(days: number, base: number): VolumeDataPoint[] {
  return Array.from({ length: days }, (_, i) => ({
    date: daysAgo(days - 1 - i),
    positive: Math.max(0, Math.round(base * 0.45 + (Math.random() - 0.5) * base * 0.3)),
    neutral:  Math.max(0, Math.round(base * 0.35 + (Math.random() - 0.5) * base * 0.2)),
    negative: Math.max(0, Math.round(base * 0.2  + (Math.random() - 0.5) * base * 0.2)),
  }));
}

function genSentiment(days: number, posBase: number, negBase: number): SentimentDataPoint[] {
  return Array.from({ length: days }, (_, i) => ({
    date: daysAgo(days - 1 - i),
    positive: Math.min(100, Math.max(0, Math.round(posBase + (Math.random() - 0.5) * 12))),
    negative: Math.min(100, Math.max(0, Math.round(negBase + (Math.random() - 0.5) * 8))),
  }));
}

// ─────────────────────────────────────────────────────────
//  Mock data
// ─────────────────────────────────────────────────────────

export const SIGNALS: Signal[] = [
  // ── 1. BBVA ────────────────────────────────────────────
  {
    id: 'bbva',
    name: 'BBVA',
    category: 'marca',
    isFavorite: true,
    hasAlert: true,
    mentionsToday: 184,
    isInactive: false,
    lastUpdated: hoursAgo(1),
    kpis: {
      mentionsToday: 184,
      mentionsDelta: 32,
      reach: 4200,
      reachDelta: 18,
      sentimentScore: 62,
      sentimentDelta: -4,
      activeSources: 47,
      activeSourcesDelta: 5,
    },
    narrative: {
      summary:
        'BBVA mantiene una cobertura mediática elevada impulsada por la OPA sobre Sabadell. Los medios económicos destacan la resistencia del Sabadell y el apoyo del Gobierno catalán. La narrativa positiva está liderada por resultados trimestrales récord y expansión en México.',
      tags: ['OPA Sabadell', 'resultados Q1', 'México', 'banca digital', 'regulación'],
    },
    volumeData: genVolume(14, 160),
    sentimentData: genSentiment(30, 62, 18),
    trendIndicators: [
      { label: 'Menciones 7d', value: '1.241', delta: 12 },
      { label: 'Alcance estimado', value: '4,2M', delta: 18, unit: 'personas' },
      { label: 'Índice de sentimiento', value: '62', delta: -4, unit: '/100' },
      { label: 'Fuentes activas', value: '47', delta: 5 },
      { label: 'Artículos en portada', value: '9', delta: 2 },
    ],
    narrativeFrames: [
      { label: 'OPA / M&A', pct: 38 },
      { label: 'Resultados financieros', pct: 27 },
      { label: 'Expansión internacional', pct: 18 },
      { label: 'Banca digital', pct: 11 },
      { label: 'Regulación', pct: 6 },
    ],
    sourceDistribution: [
      { label: 'Prensa digital', pct: 52 },
      { label: 'Televisión', pct: 24 },
      { label: 'Prensa escrita', pct: 16 },
      { label: 'Radio', pct: 8 },
    ],
    mediaVariation: [
      { label: 'Prensa digital', value: 94, variationPct: 28 },
      { label: 'Televisión', value: 41, variationPct: 12 },
      { label: 'Prensa escrita', value: 29, variationPct: -8 },
    ],
    keywords: [
      { word: 'OPA', count: 312, sentiment: 'neutro' },
      { word: 'Sabadell', count: 287, sentiment: 'neutro' },
      { word: 'resultados', count: 198, sentiment: 'positivo' },
      { word: 'México', count: 154, sentiment: 'positivo' },
      { word: 'dividendo', count: 112, sentiment: 'positivo' },
      { word: 'regulación', count: 98, sentiment: 'neutro' },
      { word: 'CNMC', count: 87, sentiment: 'negativo' },
      { word: 'banca digital', count: 76, sentiment: 'positivo' },
      { word: 'beneficio', count: 71, sentiment: 'positivo' },
      { word: 'rechazo', count: 64, sentiment: 'negativo' },
      { word: 'Gobierno', count: 58, sentiment: 'neutro' },
      { word: 'accionistas', count: 52, sentiment: 'neutro' },
    ],
    alertHistory: [
      {
        id: 'a1',
        timestamp: hoursAgo(2),
        type: 'spike',
        message: 'Pico de menciones (+85%) relacionado con declaraciones del CEO en Bloomberg.',
        severity: 'high',
      },
      {
        id: 'a2',
        timestamp: hoursAgo(18),
        type: 'sentiment_shift',
        message: 'Caída del índice de sentimiento positivo del 71% al 62% en 6 horas.',
        severity: 'medium',
      },
      {
        id: 'a3',
        timestamp: hoursAgo(42),
        type: 'new_frame',
        message: 'Nuevo encuadre detectado: "presión regulatoria CNMC" en 12 medios.',
        severity: 'medium',
      },
    ],
    recentNews: [
      {
        id: 'n1',
        headline: 'BBVA eleva su oferta por Sabadell y presiona al consejo a negociar',
        source: 'El País',
        publishedAt: hoursAgo(1),
        sentiment: 'neutro',
        frame: 'OPA / M&A',
        url: '#',
      },
      {
        id: 'n2',
        headline: 'BBVA registra un beneficio récord de 2.200 millones en el primer trimestre',
        source: 'Expansión',
        publishedAt: hoursAgo(3),
        sentiment: 'positivo',
        frame: 'Resultados financieros',
        url: '#',
      },
      {
        id: 'n3',
        headline: 'La CNMC abre expediente por prácticas anticompetitivas en la fusión BBVA-Sabadell',
        source: 'El Confidencial',
        publishedAt: hoursAgo(7),
        sentiment: 'negativo',
        frame: 'Regulación',
        url: '#',
      },
      {
        id: 'n4',
        headline: 'BBVA México crece un 22% en crédito hipotecario durante el primer trimestre',
        source: 'Cinco Días',
        publishedAt: hoursAgo(9),
        sentiment: 'positivo',
        frame: 'Expansión internacional',
        url: '#',
      },
      {
        id: 'n5',
        headline: 'Los analistas mantienen recomendación de compra sobre BBVA pese a la OPA',
        source: 'Bloomberg España',
        publishedAt: hoursAgo(12),
        sentiment: 'positivo',
        frame: 'Resultados financieros',
        url: '#',
      },
    ],
  },

  // ── 2. Repsol ──────────────────────────────────────────
  {
    id: 'repsol',
    name: 'Repsol',
    category: 'marca',
    isFavorite: true,
    hasAlert: false,
    mentionsToday: 97,
    isInactive: false,
    lastUpdated: hoursAgo(2),
    kpis: {
      mentionsToday: 97,
      mentionsDelta: -8,
      reach: 2100,
      reachDelta: -5,
      sentimentScore: 54,
      sentimentDelta: 2,
      activeSources: 31,
      activeSourcesDelta: -2,
    },
    narrative: {
      summary:
        'Repsol concentra cobertura en torno a su plan de transición energética y reducción de emisiones. Los medios especializados destacan la inversión en renovables mientras la prensa generalista menciona el impacto en el precio de la gasolina.',
      tags: ['transición energética', 'renovables', 'emisiones', 'gasolina', 'inversión'],
    },
    volumeData: genVolume(14, 90),
    sentimentData: genSentiment(30, 54, 22),
    trendIndicators: [
      { label: 'Menciones 7d', value: '687', delta: -8 },
      { label: 'Alcance estimado', value: '2,1M', delta: -5, unit: 'personas' },
      { label: 'Índice de sentimiento', value: '54', delta: 2, unit: '/100' },
      { label: 'Fuentes activas', value: '31', delta: -2 },
      { label: 'Artículos en portada', value: '4', delta: -1 },
    ],
    narrativeFrames: [
      { label: 'Transición energética', pct: 41 },
      { label: 'Precio combustible', pct: 29 },
      { label: 'Resultados', pct: 18 },
      { label: 'Renovables', pct: 12 },
    ],
    sourceDistribution: [
      { label: 'Prensa digital', pct: 48 },
      { label: 'Televisión', pct: 28 },
      { label: 'Radio', pct: 14 },
      { label: 'Prensa escrita', pct: 10 },
    ],
    mediaVariation: [
      { label: 'Prensa digital', value: 47, variationPct: -12 },
      { label: 'Televisión', value: 27, variationPct: 5 },
      { label: 'Radio', value: 14, variationPct: -3 },
    ],
    keywords: [
      { word: 'renovables', count: 198, sentiment: 'positivo' },
      { word: 'gasolina', count: 176, sentiment: 'negativo' },
      { word: 'emisiones', count: 143, sentiment: 'neutro' },
      { word: 'transición', count: 121, sentiment: 'positivo' },
      { word: 'precio', count: 98, sentiment: 'negativo' },
      { word: 'inversión', count: 87, sentiment: 'positivo' },
      { word: 'CO2', count: 74, sentiment: 'neutro' },
      { word: 'hidrogeno', count: 62, sentiment: 'positivo' },
    ],
    alertHistory: [
      {
        id: 'b1',
        timestamp: hoursAgo(28),
        type: 'sentiment_shift',
        message: 'Incremento de noticias negativas relacionadas con precios del combustible.',
        severity: 'low',
      },
    ],
    recentNews: [
      {
        id: 'n6',
        headline: 'Repsol invertirá 1.200 millones en parques eólicos marinos en 2026',
        source: 'Energía y Sociedad',
        publishedAt: hoursAgo(4),
        sentiment: 'positivo',
        frame: 'Renovables',
        url: '#',
      },
      {
        id: 'n7',
        headline: 'El precio de la gasolina sube un 3% pese a la bajada del crudo',
        source: 'El Mundo',
        publishedAt: hoursAgo(8),
        sentiment: 'negativo',
        frame: 'Precio combustible',
        url: '#',
      },
      {
        id: 'n8',
        headline: 'Repsol logra reducir un 18% sus emisiones de CO2 en operaciones upstream',
        source: 'Cinco Días',
        publishedAt: hoursAgo(14),
        sentiment: 'positivo',
        frame: 'Transición energética',
        url: '#',
      },
    ],
  },

  // ── 3. Ana Botín ───────────────────────────────────────
  {
    id: 'ana-botin',
    name: 'Ana Botín',
    category: 'persona',
    isFavorite: false,
    hasAlert: true,
    mentionsToday: 143,
    isInactive: false,
    lastUpdated: hoursAgo(1),
    kpis: {
      mentionsToday: 143,
      mentionsDelta: 67,
      reach: 3400,
      reachDelta: 54,
      sentimentScore: 71,
      sentimentDelta: 8,
      activeSources: 39,
      activeSourcesDelta: 11,
    },
    narrative: {
      summary:
        'Ana Botín concentra cobertura excepcional tras su discurso en el Foro Económico de Madrid sobre digitalización bancaria y desigualdad. Los medios destacan su posicionamiento sobre la inteligencia artificial en finanzas.',
      tags: ['Santander', 'banca digital', 'IA en finanzas', 'liderazgo femenino', 'Foro Madrid'],
    },
    volumeData: genVolume(14, 110),
    sentimentData: genSentiment(30, 71, 12),
    trendIndicators: [
      { label: 'Menciones 7d', value: '892', delta: 34 },
      { label: 'Alcance estimado', value: '3,4M', delta: 54, unit: 'personas' },
      { label: 'Índice de sentimiento', value: '71', delta: 8, unit: '/100' },
      { label: 'Fuentes activas', value: '39', delta: 11 },
      { label: 'Artículos en portada', value: '12', delta: 7 },
    ],
    narrativeFrames: [
      { label: 'Liderazgo / visión', pct: 44 },
      { label: 'Banca digital / IA', pct: 32 },
      { label: 'Resultados Santander', pct: 14 },
      { label: 'Responsabilidad social', pct: 10 },
    ],
    sourceDistribution: [
      { label: 'Prensa digital', pct: 55 },
      { label: 'Televisión', pct: 30 },
      { label: 'Prensa escrita', pct: 15 },
    ],
    mediaVariation: [
      { label: 'Prensa digital', value: 78, variationPct: 62 },
      { label: 'Televisión', value: 43, variationPct: 48 },
      { label: 'Prensa escrita', value: 21, variationPct: 15 },
    ],
    keywords: [
      { word: 'digitalización', count: 287, sentiment: 'positivo' },
      { word: 'liderazgo', count: 212, sentiment: 'positivo' },
      { word: 'Santander', count: 198, sentiment: 'neutro' },
      { word: 'inteligencia artificial', count: 176, sentiment: 'positivo' },
      { word: 'Foro', count: 143, sentiment: 'neutro' },
      { word: 'desigualdad', count: 98, sentiment: 'negativo' },
      { word: 'fintech', count: 87, sentiment: 'positivo' },
    ],
    alertHistory: [
      {
        id: 'c1',
        timestamp: hoursAgo(3),
        type: 'viral',
        message: 'Fragmento del discurso en el Foro Económico supera las 50.000 reproducciones.',
        severity: 'high',
      },
      {
        id: 'c2',
        timestamp: hoursAgo(5),
        type: 'spike',
        message: 'Spike de +67% en menciones tras intervención en cadena SER.',
        severity: 'high',
      },
    ],
    recentNews: [
      {
        id: 'n9',
        headline: 'Ana Botín: "La IA transformará la banca más que internet en los próximos cinco años"',
        source: 'Financial Times España',
        publishedAt: hoursAgo(2),
        sentiment: 'positivo',
        frame: 'Banca digital / IA',
        url: '#',
      },
      {
        id: 'n10',
        headline: 'Botín inaugura el Foro Económico de Madrid con un llamamiento a la inclusión financiera',
        source: 'El País',
        publishedAt: hoursAgo(4),
        sentiment: 'positivo',
        frame: 'Liderazgo / visión',
        url: '#',
      },
      {
        id: 'n11',
        headline: 'La presidenta de Santander defiende un marco regulatorio europeo para la IA bancaria',
        source: 'Expansión',
        publishedAt: hoursAgo(6),
        sentiment: 'neutro',
        frame: 'Banca digital / IA',
        url: '#',
      },
    ],
  },

  // ── 4. Carlos Torres (inactivo) ────────────────────────
  {
    id: 'carlos-torres',
    name: 'Carlos Torres',
    category: 'persona',
    isFavorite: false,
    hasAlert: false,
    mentionsToday: 3,
    isInactive: true,
    lastUpdated: hoursAgo(72),
    kpis: {
      mentionsToday: 3,
      mentionsDelta: -78,
      reach: 40,
      reachDelta: -81,
      sentimentScore: 48,
      sentimentDelta: -12,
      activeSources: 2,
      activeSourcesDelta: -9,
    },
    narrative: {
      summary:
        'Carlos Torres presenta actividad mediática mínima esta semana. Las últimas apariciones se relacionan con declaraciones sobre la OPA de BBVA en medios económicos especializados.',
      tags: ['BBVA', 'OPA', 'CEO'],
    },
    volumeData: genVolume(14, 8),
    sentimentData: genSentiment(30, 48, 24),
    trendIndicators: [
      { label: 'Menciones 7d', value: '24', delta: -78 },
      { label: 'Alcance estimado', value: '40K', delta: -81, unit: 'personas' },
      { label: 'Índice de sentimiento', value: '48', delta: -12, unit: '/100' },
      { label: 'Fuentes activas', value: '2', delta: -9 },
      { label: 'Artículos en portada', value: '0', delta: -3 },
    ],
    narrativeFrames: [
      { label: 'OPA BBVA-Sabadell', pct: 74 },
      { label: 'Estrategia corporativa', pct: 26 },
    ],
    sourceDistribution: [
      { label: 'Prensa digital', pct: 70 },
      { label: 'Prensa escrita', pct: 30 },
    ],
    mediaVariation: [
      { label: 'Prensa digital', value: 2, variationPct: -74 },
      { label: 'Prensa escrita', value: 1, variationPct: -82 },
    ],
    keywords: [
      { word: 'BBVA', count: 18, sentiment: 'neutro' },
      { word: 'OPA', count: 14, sentiment: 'neutro' },
      { word: 'CEO', count: 8, sentiment: 'neutro' },
    ],
    alertHistory: [],
    recentNews: [
      {
        id: 'n12',
        headline: 'Carlos Torres defiende la OPA sobre Sabadell ante inversores institucionales',
        source: 'Expansión',
        publishedAt: hoursAgo(70),
        sentiment: 'neutro',
        frame: 'OPA BBVA-Sabadell',
        url: '#',
      },
    ],
  },

  // ── 5. Cataluña ────────────────────────────────────────
  {
    id: 'cataluna',
    name: 'Cataluña',
    category: 'zona_geografica',
    isFavorite: false,
    hasAlert: false,
    mentionsToday: 218,
    isInactive: false,
    lastUpdated: hoursAgo(0),
    kpis: {
      mentionsToday: 218,
      mentionsDelta: 4,
      reach: 5100,
      reachDelta: 7,
      sentimentScore: 41,
      sentimentDelta: -2,
      activeSources: 62,
      activeSourcesDelta: 3,
    },
    narrative: {
      summary:
        'Cataluña recibe cobertura constante y amplia, dominada por el debate político sobre financiación autonómica y el seguimiento de los datos económicos del primer trimestre. El tono general es neutro-negativo.',
      tags: ['financiación', 'política', 'economía', 'turismo', 'infraestructuras'],
    },
    volumeData: genVolume(14, 200),
    sentimentData: genSentiment(30, 41, 31),
    trendIndicators: [
      { label: 'Menciones 7d', value: '1.523', delta: 4 },
      { label: 'Alcance estimado', value: '5,1M', delta: 7, unit: 'personas' },
      { label: 'Índice de sentimiento', value: '41', delta: -2, unit: '/100' },
      { label: 'Fuentes activas', value: '62', delta: 3 },
      { label: 'Artículos en portada', value: '17', delta: 1 },
    ],
    narrativeFrames: [
      { label: 'Política / financiación', pct: 36 },
      { label: 'Economía / PIB', pct: 24 },
      { label: 'Turismo', pct: 18 },
      { label: 'Infraestructuras', pct: 13 },
      { label: 'Cultura', pct: 9 },
    ],
    sourceDistribution: [
      { label: 'Prensa digital', pct: 44 },
      { label: 'Televisión', pct: 32 },
      { label: 'Radio', pct: 16 },
      { label: 'Prensa escrita', pct: 8 },
    ],
    mediaVariation: [
      { label: 'Prensa digital', value: 96, variationPct: 8 },
      { label: 'Televisión', value: 70, variationPct: 4 },
      { label: 'Radio', value: 35, variationPct: -2 },
    ],
    keywords: [
      { word: 'financiación', count: 342, sentiment: 'neutro' },
      { word: 'autonomía', count: 287, sentiment: 'neutro' },
      { word: 'PIB', count: 198, sentiment: 'positivo' },
      { word: 'turismo', count: 176, sentiment: 'positivo' },
      { word: 'inversión', count: 154, sentiment: 'positivo' },
      { word: 'conflicto', count: 132, sentiment: 'negativo' },
      { word: 'infraestructuras', count: 112, sentiment: 'neutro' },
      { word: 'deuda', count: 98, sentiment: 'negativo' },
      { word: 'Barcelona', count: 87, sentiment: 'neutro' },
    ],
    alertHistory: [],
    recentNews: [
      {
        id: 'n13',
        headline: 'La Generalitat reclama 3.000 millones adicionales en el nuevo modelo de financiación',
        source: 'La Vanguardia',
        publishedAt: hoursAgo(2),
        sentiment: 'negativo',
        frame: 'Política / financiación',
        url: '#',
      },
      {
        id: 'n14',
        headline: 'Cataluña lidera el crecimiento del PIB español con un 3,2% en el primer trimestre',
        source: 'El Periódico',
        publishedAt: hoursAgo(5),
        sentiment: 'positivo',
        frame: 'Economía / PIB',
        url: '#',
      },
    ],
  },

  // ── 6. Transición energética ───────────────────────────
  {
    id: 'transicion-energetica',
    name: 'Transición energética',
    category: 'tema_sector',
    isFavorite: true,
    hasAlert: false,
    mentionsToday: 312,
    isInactive: false,
    lastUpdated: hoursAgo(1),
    kpis: {
      mentionsToday: 312,
      mentionsDelta: 21,
      reach: 7200,
      reachDelta: 29,
      sentimentScore: 58,
      sentimentDelta: 3,
      activeSources: 78,
      activeSourcesDelta: 8,
    },
    narrative: {
      summary:
        'La transición energética domina la agenda mediática impulsada por los anuncios del Plan Nacional de Energía y Clima. La narrativa positiva destaca las inversiones en renovables; la negativa se centra en el coste para consumidores y la seguridad de suministro.',
      tags: ['PNEC', 'renovables', 'hidrogeno verde', 'coste energía', 'descarbonización'],
    },
    volumeData: genVolume(14, 280),
    sentimentData: genSentiment(30, 58, 20),
    trendIndicators: [
      { label: 'Menciones 7d', value: '2.187', delta: 21 },
      { label: 'Alcance estimado', value: '7,2M', delta: 29, unit: 'personas' },
      { label: 'Índice de sentimiento', value: '58', delta: 3, unit: '/100' },
      { label: 'Fuentes activas', value: '78', delta: 8 },
      { label: 'Artículos en portada', value: '23', delta: 6 },
    ],
    narrativeFrames: [
      { label: 'Inversión renovables', pct: 33 },
      { label: 'Coste para consumidores', pct: 26 },
      { label: 'Política / regulación', pct: 22 },
      { label: 'Hidrógeno verde', pct: 12 },
      { label: 'Seguridad suministro', pct: 7 },
    ],
    sourceDistribution: [
      { label: 'Prensa digital', pct: 50 },
      { label: 'Televisión', pct: 26 },
      { label: 'Radio', pct: 14 },
      { label: 'Prensa escrita', pct: 10 },
    ],
    mediaVariation: [
      { label: 'Prensa digital', value: 156, variationPct: 34 },
      { label: 'Televisión', value: 81, variationPct: 18 },
      { label: 'Radio', value: 44, variationPct: 11 },
    ],
    keywords: [
      { word: 'renovables', count: 521, sentiment: 'positivo' },
      { word: 'PNEC', count: 387, sentiment: 'neutro' },
      { word: 'hidrógeno', count: 298, sentiment: 'positivo' },
      { word: 'coste', count: 276, sentiment: 'negativo' },
      { word: 'descarbonización', count: 243, sentiment: 'positivo' },
      { word: 'eólica', count: 218, sentiment: 'positivo' },
      { word: 'solar', count: 198, sentiment: 'positivo' },
      { word: 'nuclear', count: 176, sentiment: 'neutro' },
      { word: 'subvención', count: 154, sentiment: 'neutro' },
      { word: 'suministro', count: 132, sentiment: 'negativo' },
      { word: 'CO2', count: 121, sentiment: 'neutro' },
    ],
    alertHistory: [
      {
        id: 'd1',
        timestamp: hoursAgo(6),
        type: 'new_frame',
        message: 'Nuevo encuadre emergente: "seguridad de suministro en verano" en 19 medios.',
        severity: 'medium',
      },
    ],
    recentNews: [
      {
        id: 'n15',
        headline: 'El PNEC prevé 100.000 millones de inversión pública en renovables hasta 2030',
        source: 'El País',
        publishedAt: hoursAgo(1),
        sentiment: 'positivo',
        frame: 'Inversión renovables',
        url: '#',
      },
      {
        id: 'n16',
        headline: 'Las familias pagarán un 8% más en la factura eléctrica por la transición verde',
        source: 'ABC',
        publishedAt: hoursAgo(3),
        sentiment: 'negativo',
        frame: 'Coste para consumidores',
        url: '#',
      },
      {
        id: 'n17',
        headline: 'España instala 4,2 GW de nueva potencia solar en el primer trimestre, récord histórico',
        source: 'Energía y Sociedad',
        publishedAt: hoursAgo(5),
        sentiment: 'positivo',
        frame: 'Inversión renovables',
        url: '#',
      },
    ],
  },

  // ── 7. Santander ───────────────────────────────────────
  {
    id: 'santander',
    name: 'Santander',
    category: 'competidor',
    isFavorite: false,
    hasAlert: false,
    mentionsToday: 121,
    isInactive: false,
    lastUpdated: hoursAgo(2),
    kpis: {
      mentionsToday: 121,
      mentionsDelta: 15,
      reach: 2800,
      reachDelta: 11,
      sentimentScore: 67,
      sentimentDelta: 5,
      activeSources: 34,
      activeSourcesDelta: 4,
    },
    narrative: {
      summary:
        'Santander recibe cobertura positiva impulsada por los resultados del primer trimestre y el discurso de Ana Botín en el Foro Económico. La narrativa de expansión digital gana peso frente a la información de producto.',
      tags: ['resultados Q1', 'banca digital', 'Ana Botín', 'Latinoamérica', 'Openbank'],
    },
    volumeData: genVolume(14, 110),
    sentimentData: genSentiment(30, 67, 14),
    trendIndicators: [
      { label: 'Menciones 7d', value: '847', delta: 15 },
      { label: 'Alcance estimado', value: '2,8M', delta: 11, unit: 'personas' },
      { label: 'Índice de sentimiento', value: '67', delta: 5, unit: '/100' },
      { label: 'Fuentes activas', value: '34', delta: 4 },
      { label: 'Artículos en portada', value: '7', delta: 2 },
    ],
    narrativeFrames: [
      { label: 'Resultados financieros', pct: 38 },
      { label: 'Banca digital', pct: 29 },
      { label: 'Expansión internacional', pct: 22 },
      { label: 'Responsabilidad social', pct: 11 },
    ],
    sourceDistribution: [
      { label: 'Prensa digital', pct: 53 },
      { label: 'Televisión', pct: 27 },
      { label: 'Prensa escrita', pct: 20 },
    ],
    mediaVariation: [
      { label: 'Prensa digital', value: 64, variationPct: 18 },
      { label: 'Televisión', value: 33, variationPct: 12 },
      { label: 'Prensa escrita', value: 24, variationPct: 5 },
    ],
    keywords: [
      { word: 'Openbank', count: 198, sentiment: 'positivo' },
      { word: 'resultados', count: 187, sentiment: 'positivo' },
      { word: 'Brasil', count: 154, sentiment: 'neutro' },
      { word: 'digitalización', count: 143, sentiment: 'positivo' },
      { word: 'Ana Botín', count: 132, sentiment: 'positivo' },
      { word: 'hipotecas', count: 98, sentiment: 'neutro' },
    ],
    alertHistory: [],
    recentNews: [
      {
        id: 'n18',
        headline: 'Santander supera expectativas con un beneficio de 3.100 millones en el primer trimestre',
        source: 'Expansión',
        publishedAt: hoursAgo(5),
        sentiment: 'positivo',
        frame: 'Resultados financieros',
        url: '#',
      },
      {
        id: 'n19',
        headline: 'Openbank alcanza los 2 millones de clientes en Europa y prepara su salto a EE.UU.',
        source: 'El Confidencial',
        publishedAt: hoursAgo(9),
        sentiment: 'positivo',
        frame: 'Banca digital',
        url: '#',
      },
    ],
  },

  // ── 8. Regulación bancaria ─────────────────────────────
  {
    id: 'regulacion-bancaria',
    name: 'Regulación bancaria',
    category: 'tema_sector',
    isFavorite: false,
    hasAlert: false,
    mentionsToday: 76,
    isInactive: false,
    lastUpdated: hoursAgo(3),
    kpis: {
      mentionsToday: 76,
      mentionsDelta: 9,
      reach: 1600,
      reachDelta: 6,
      sentimentScore: 38,
      sentimentDelta: -6,
      activeSources: 22,
      activeSourcesDelta: 1,
    },
    narrative: {
      summary:
        'La regulación bancaria europea centra la atención de la prensa especializada, con foco en la implementación de Basilea IV y los nuevos requerimientos de capital del BCE. El tono es mayoritariamente neutro-negativo para el sector.',
      tags: ['Basilea IV', 'BCE', 'capital', 'cumplimiento', 'fusiones'],
    },
    volumeData: genVolume(14, 65),
    sentimentData: genSentiment(30, 38, 34),
    trendIndicators: [
      { label: 'Menciones 7d', value: '532', delta: 9 },
      { label: 'Alcance estimado', value: '1,6M', delta: 6, unit: 'personas' },
      { label: 'Índice de sentimiento', value: '38', delta: -6, unit: '/100' },
      { label: 'Fuentes activas', value: '22', delta: 1 },
      { label: 'Artículos en portada', value: '3', delta: 0 },
    ],
    narrativeFrames: [
      { label: 'Basilea IV / capital', pct: 42 },
      { label: 'Supervisión BCE', pct: 31 },
      { label: 'Fusiones y OPAs', pct: 18 },
      { label: 'Protección consumidor', pct: 9 },
    ],
    sourceDistribution: [
      { label: 'Prensa digital', pct: 62 },
      { label: 'Prensa escrita', pct: 24 },
      { label: 'Televisión', pct: 14 },
    ],
    mediaVariation: [
      { label: 'Prensa digital', value: 47, variationPct: 11 },
      { label: 'Prensa escrita', value: 18, variationPct: 4 },
      { label: 'Televisión', value: 11, variationPct: -2 },
    ],
    keywords: [
      { word: 'Basilea IV', count: 224, sentiment: 'negativo' },
      { word: 'BCE', count: 198, sentiment: 'neutro' },
      { word: 'capital', count: 176, sentiment: 'neutro' },
      { word: 'cumplimiento', count: 143, sentiment: 'neutro' },
      { word: 'fusiones', count: 121, sentiment: 'neutro' },
      { word: 'supervisión', count: 98, sentiment: 'neutro' },
      { word: 'requisitos', count: 87, sentiment: 'negativo' },
    ],
    alertHistory: [],
    recentNews: [
      {
        id: 'n20',
        headline: 'El BCE endurece los requisitos de capital para la banca europea con Basilea IV',
        source: 'Expansión',
        publishedAt: hoursAgo(6),
        sentiment: 'negativo',
        frame: 'Basilea IV / capital',
        url: '#',
      },
      {
        id: 'n21',
        headline: 'La supervisión del BCE frena el proceso de consolidación bancaria en la eurozona',
        source: 'Financial Times España',
        publishedAt: hoursAgo(11),
        sentiment: 'negativo',
        frame: 'Supervisión BCE',
        url: '#',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────
//  Helpers de categoría
// ─────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<SignalCategory, string> = {
  marca: 'Marca',
  persona: 'Persona',
  zona_geografica: 'Zona geográfica',
  tema_sector: 'Tema / sector',
  competidor: 'Competidor',
};

export const CATEGORY_ORDER: SignalCategory[] = [
  'marca',
  'persona',
  'zona_geografica',
  'tema_sector',
  'competidor',
];

export function getSignalById(id: string): Signal | undefined {
  return SIGNALS.find((s) => s.id === id);
}

export function getSignalsByCategory(category: SignalCategory): Signal[] {
  return SIGNALS.filter((s) => s.category === category);
}
