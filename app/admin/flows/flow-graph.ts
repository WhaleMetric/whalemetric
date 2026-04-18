// Nodes to hide from the diagram completely (still exist in DB)
export const EXCLUDED_SLUGS = new Set(['feed_discovery', 'translation']);

// ── Sub-graphs (exported for reference) ──────────────────────────────────────

export const PRENSA_GRAPH: Record<string, string[]> = {
  rss_fetch:   ['scraping_web'],
  scraping_web: ['entity_extraction'],
};

export const AUDIOVISUAL_GRAPH: Record<string, string[]> = {
  tv_recording:        ['audio_transcription'],
  radio_recording:     ['audio_transcription'],
  audio_transcription: ['entity_extraction'],
};

export const COMMON_GRAPH: Record<string, string[]> = {
  entity_extraction: ['client_matching'],
  client_matching:   ['sentiment_analysis', 'daily_clipping', 'client_summaries', 'critical_alerts'],
  sentiment_analysis: [],
  daily_clipping:     [],
  client_summaries:   [],
  critical_alerts:    [],
};

// ── Merged graph used by the DAG renderer ─────────────────────────────────────

export const FLOW_GRAPH: Record<string, string[]> = {
  ...PRENSA_GRAPH,
  ...AUDIOVISUAL_GRAPH,
  ...COMMON_GRAPH,
};
