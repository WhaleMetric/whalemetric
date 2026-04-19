export type TrendType =
  | 'volume_spike'
  | 'sustained_growth'
  | 'sustained_decline'
  | 'sentiment_shift'
  | 'new_framing'
  | 'source_expansion'
  | 'emerging_topic'
  | 'viral_pattern'
  | 'recurring_pattern';

export type TrendDirection = 'up' | 'down' | 'neutral';

export type TrendSubjectType = 'signal' | 'radar';

export interface TrendMetadata {
  current_value: number;
  baseline: number;
  peak: number;
  related_news_ids?: string[];
  new_keywords: string[];
  top_sources: string[];
}

export interface TrendTimelinePoint {
  date: string;
  value: number;
}

export interface TrendRelatedNews {
  id: string;
  source: string;
  headline: string;
  published_at: string;
  sentiment: 'positivo' | 'neutro' | 'negativo';
  url: string;
}

export interface TrendTopSource {
  source: string;
  pct: number;
  mentions: number;
}

export interface Trend {
  id: string;
  subject_type: TrendSubjectType;
  subject_id: string;
  subject_name: string;
  type: TrendType;
  direction: TrendDirection;
  title: string;
  description: string;
  magnitude: number;   // e.g. 187 for +187%
  confidence: number;  // 0-100
  velocity: number;
  detected_at: string;
  window_start: string;
  window_end: string;
  metadata: TrendMetadata;
  sparkline_data: number[];
  timeline_30d: TrendTimelinePoint[];
  narrative_text: string;
  related_news: TrendRelatedNews[];
  top_sources_breakdown: TrendTopSource[];
  is_highlighted: boolean;
  is_mock?: boolean;
}

export interface EmergingTopic {
  id: string;
  word: string;
  mentions: number;
  sources: number;
  growth_pct: number;
  window_hours: number;
}
