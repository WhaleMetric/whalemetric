// ── Benchmark types ───────────────────────────────────────────────────────────

export type BenchmarkCategory =
  | 'marca'
  | 'partido_politico'
  | 'institucion'
  | 'persona'
  | 'producto'
  | 'generic';

export type ActorRole = 'primary' | 'competitor' | 'reference';

export type BenchmarkPeriod = '7d' | '14d' | '30d' | '90d';

export type BenchmarkStatus = 'warming_up' | 'ready' | 'paused' | 'archived';

export type SentimentKey = 'positivo' | 'neutro' | 'negativo';

export type MediaTypeKey = 'digital' | 'escrita' | 'tv' | 'radio';

export interface BenchmarkActor {
  id: string;
  display_name: string;
  role: ActorRole;
  color: string;
  position: number;
}

export interface ActorMetrics {
  actor_id: string;
  mentions: number;
  sov_pct: number;
  sentiment_positive_pct: number;
  sentiment_neutral_pct: number;
  sentiment_negative_pct: number;
  reach: number;
  delta_mentions_pct: number;
  delta_sov_pp: number;
  avg_sentiment_score: number;
}

export interface TimelinePoint {
  date: string;
  values: Record<string, number>; // actor_id -> sov pct for that day
}

export interface TimelineData {
  points: TimelinePoint[];
}

export interface MediaTypeBreakdownEntry {
  actor_id: string;
  pct: number;
}

export interface MediaTypeBreakdown {
  digital: MediaTypeBreakdownEntry[];
  escrita: MediaTypeBreakdownEntry[];
  tv: MediaTypeBreakdownEntry[];
  radio: MediaTypeBreakdownEntry[];
}

export interface TopSourceItem {
  source: string;
  pct: number;
}

export interface TopSourcesData {
  by_actor: Record<string, TopSourceItem[]>;
}

export interface KeywordDiffActor {
  actor_id: string;
  unique: string[];
  shared_count: number;
}

export interface KeywordDiffData {
  actors: KeywordDiffActor[];
}

export interface RankingEntry {
  actor_id: string;
  position: number;
  previous_position: number;
}

export interface RankingData {
  entries: RankingEntry[];
}

export interface RecentNewsItem {
  id: string;
  headline: string;
  source: string;
  published_at: string;
  sentiment: SentimentKey;
  actor_id: string;
  url: string;
}

export interface RecentNewsData {
  items: RecentNewsItem[];
}

export interface BenchmarkSnapshot {
  narrative_text: string;
  narrative_tags: string[];
  actors_metrics: ActorMetrics[];
  timeline_comparison: TimelineData;
  media_type_breakdown: MediaTypeBreakdown;
  top_sources_per_actor: TopSourcesData;
  keyword_analysis: KeywordDiffData;
  ranking: RankingData;
  recent_news: RecentNewsData;
  has_enough_data: boolean;
}

export interface Benchmark {
  id: string;
  name: string;
  description: string | null;
  category: BenchmarkCategory;
  default_period: BenchmarkPeriod;
  is_favorite: boolean;
  status: BenchmarkStatus;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
  actors: BenchmarkActor[];
  snapshot: BenchmarkSnapshot | null;
  is_mock?: boolean;
}

export const PERIOD_LABELS: Record<BenchmarkPeriod, string> = {
  '7d': '7 días',
  '14d': '14 días',
  '30d': '30 días',
  '90d': '90 días',
};

export const PERIOD_DAYS: Record<BenchmarkPeriod, number> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
  '90d': 90,
};

export const CATEGORY_LABELS: Record<BenchmarkCategory, string> = {
  marca: 'Marca',
  partido_politico: 'Partido político',
  institucion: 'Institución',
  persona: 'Persona',
  producto: 'Producto',
  generic: 'Genérico',
};

export const ROLE_LABELS: Record<ActorRole, string> = {
  primary: 'Principal',
  competitor: 'Competidor',
  reference: 'Referencia',
};

// Sober palette for benchmark actors. Order matters: primary uses index 0,
// competitors receive the remaining slots in order of position.
export const ACTOR_COLOR_PALETTE: string[] = [
  '#0F172A', // primary — deep blue-black
  '#1E3A8A', // navy
  '#2563EB', // medium blue
  '#0891B2', // dark cyan
  '#0D9488', // teal
  '#64748B', // blue-gray
  '#334155', // dark gray
  '#475569', // medium gray
];

// Semantic colors (never used as actor colors). Kept separate on purpose.
export const SENTIMENT_COLORS = {
  positive: '#34D399',
  neutral:  '#94A3B8',
  negative: '#F87171',
} as const;
