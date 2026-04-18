// Conceptual data-flow graph between flows.
// Arrows = "the output of this flow conceptually feeds into the next one".
// NOT execution dependencies — flows are modular and communicate via shared tables.
// This map is used purely for visualization.
export const FLOW_GRAPH: Record<string, string[]> = {
  // INGESTA — discovery & capture
  feed_discovery: ['rss_fetch'],
  rss_fetch: ['entity_extraction'],
  scraping_web: ['entity_extraction'],
  tv_recording: ['audio_transcription'],
  radio_recording: ['audio_transcription'],

  // PROCESAMIENTO — normalization & enrichment
  audio_transcription: ['translation'],
  translation: ['entity_extraction'],
  entity_extraction: ['client_matching'],
  client_matching: ['sentiment_analysis'],
  sentiment_analysis: ['daily_clipping', 'client_summaries', 'critical_alerts'],

  // GENERACIÓN — terminal outputs
  daily_clipping: [],
  client_summaries: [],
  critical_alerts: [],
};
