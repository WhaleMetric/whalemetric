// ── Shared primitives ─────────────────────────────────────────────────────────

export type RadarStatus = 'warming_up' | 'ready' | 'error' | 'archived';

export type ClauseOperator = 'signal' | 'and' | 'or' | 'weighted';

export type TopLevelOperator = 'and' | 'or';

export interface UserSignal {
  id: string;
  name: string;
  type: string;
  status?: string;
}

// ── Folders ───────────────────────────────────────────────────────────────────

export interface RadarFolder {
  id: string;
  user_id?: string;
  name: string;
  icon: string | null;
  color: string | null;
  position: number;
  created_at?: string;
  radars?: { count: number }[];
  is_mock?: boolean;
}

// ── Radar (UI shape — hooks return this after transformation) ────────────────

export interface Clause {
  id: string;
  position: number;
  operator: ClauseOperator;
  min_matches: number | null;
  is_exclusion: boolean;
  signals: UserSignal[];
}

export interface Radar {
  id: string;
  user_id?: string;
  name: string;
  description: string | null;
  top_level_operator: TopLevelOperator;
  status: RadarStatus;
  is_favorite: boolean;
  folder_id: string | null;
  last_viewed_at: string | null;
  updated_at: string;
  created_at: string;
  clauses: Clause[];
  radar_alerts: { count: number }[];
  is_mock?: boolean;
}

// ── Raw row shapes (what Supabase returns before we transform) ───────────────

export interface RawClauseSignalRow {
  signal_id: string;
  position: number;
  signals: UserSignal;
}

export interface RawClauseRow {
  id: string;
  position: number;
  operator: ClauseOperator;
  min_matches: number | null;
  is_exclusion: boolean;
  radar_clause_signals: RawClauseSignalRow[];
}

export interface RawRadarRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  top_level_operator: TopLevelOperator;
  status: RadarStatus;
  is_favorite: boolean;
  folder_id: string | null;
  last_viewed_at: string | null;
  updated_at: string;
  created_at: string;
  radar_clauses: RawClauseRow[];
  radar_alerts: { count: number }[];
}

// ── Snapshot ──────────────────────────────────────────────────────────────────

export interface SnapshotKpis {
  mentions_today: number;
  mentions_delta: number;
  reach_estimated: number;
  reach_delta: number;
  sentiment_positive_pct: number;
  sentiment_delta: number;
  active_sources: number;
  active_sources_delta: number;
}

export interface VolumePoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentPoint {
  date: string;
  positive: number;
  negative: number;
}

export interface SignalBreakdownItem {
  signal_id: string;
  signal_name: string;
  contribution_pct: number;
  mentions: number;
}

export interface SourceTypeVariation {
  label: string;
  value: number;
  variation_pct: number;
}

export interface KeywordItem {
  word: string;
  count: number;
  sentiment: 'positivo' | 'neutro' | 'negativo';
}

export interface RecentNewsItem {
  id: string;
  headline: string;
  source: string;
  published_at: string;
  sentiment: 'positivo' | 'neutro' | 'negativo';
  frame: string;
  url: string;
}

export interface RadarSnapshot {
  id: string;
  radar_id: string;
  kpis: SnapshotKpis;
  narrative_text: string;
  narrative_tags: string[];
  volume_trend_14d: VolumePoint[];
  sentiment_trend_30d: SentimentPoint[];
  signal_breakdown: SignalBreakdownItem[];
  source_type_variation: SourceTypeVariation[];
  keyword_cloud: KeywordItem[];
  recent_news: RecentNewsItem[];
  has_enough_data: boolean;
  updated_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function isMockId(id: string): boolean {
  return id.startsWith('mock-');
}
