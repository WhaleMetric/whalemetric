export type CrisisSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CrisisStatus = 'active' | 'monitoring' | 'resolved' | 'archived';

export type CrisisSubjectType = 'signal' | 'radar';

export type StakeholderSide = 'attacker' | 'defender' | 'neutral';

export type VelocityLabel = 'viral' | 'sostenido' | 'contained';

export type CrisisEventKind =
  | 'start'
  | 'escalation'
  | 'new_framing'
  | 'peak_volume'
  | 'stakeholder_enters'
  | 'response_published'
  | 'user_note'
  | 'de_escalation'
  | 'resolution';

export type NewsSentiment = 'positivo' | 'neutro' | 'negativo';

export interface CrisisVitalSigns {
  mentions_per_hour: number;
  mentions_delta_pct: number;
  reach_estimated: number;
  sentiment_negative_pct: number;
  duration_hours: number;
  velocity: VelocityLabel;
  peak_mentions: number;
  threshold_critical: boolean;
}

export interface CrisisEvent {
  id: string;
  kind: CrisisEventKind;
  title: string;
  description?: string;
  at: string;
  is_user_note?: boolean;
}

export interface StakeholderQuote {
  source: string;
  text: string;
  at: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  side: StakeholderSide;
  mentions: number;
  quotes: StakeholderQuote[];
}

export interface Framing {
  id: string;
  label: string;
  pct: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AIRecommendation {
  number: number;
  action: string;
  marco_sugerido: string;
  impacto_esperado: string;
  done?: boolean;
}

export interface CrisisNewsItem {
  id: string;
  source: string;
  headline: string;
  published_at: string;
  sentiment: NewsSentiment;
  url: string;
}

export interface Amplifier {
  source: string;
  pct: number;
  mentions: number;
}

export interface Crisis {
  id: string;
  title: string;
  severity: CrisisSeverity;
  status: CrisisStatus;
  subject_type: CrisisSubjectType;
  subject_id: string;
  subject_name: string;
  started_at: string;
  escalated_at?: string;
  resolved_at?: string;
  archived_at?: string;
  last_updated_at: string;
  narrative_summary: string;
  narrative_text: string;
  vital_signs: CrisisVitalSigns;
  timeline: CrisisEvent[];
  stakeholders: Stakeholder[];
  dominant_framings: Framing[];
  ai_recommendations: AIRecommendation[];
  critical_news: CrisisNewsItem[];
  top_amplifiers: Amplifier[];
  sparkline_data: number[];
  is_mock?: boolean;
}
