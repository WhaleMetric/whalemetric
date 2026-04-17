-- ─────────────────────────────────────────────────────────────────────────────
--  WhaleMetric — Flujos en local
--  Migración: tablas flows_config, flow_logs, tv_channels, tv_channel_schedule
--  + seed inicial de canales y flujos
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. flows_config ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS flows_config (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 text UNIQUE NOT NULL,
  name                 text NOT NULL,
  description          text,
  category             text NOT NULL CHECK (category IN ('ingesta', 'procesamiento', 'generacion')),
  enabled              boolean NOT NULL DEFAULT false,
  schedule_cron        text,
  interval_seconds     int,
  last_run_at          timestamptz,
  last_status          text NOT NULL DEFAULT 'idle' CHECK (last_status IN ('ok', 'error', 'running', 'idle')),
  items_processed_today int NOT NULL DEFAULT 0,
  params               jsonb NOT NULL DEFAULT '{}',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- RLS: solo admin puede leer/escribir
ALTER TABLE flows_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY flows_config_admin ON flows_config
  USING (true)   -- ajustar con auth.role() = 'service_role' en producción
  WITH CHECK (true);

-- ── 2. flow_logs ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS flow_logs (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id   uuid NOT NULL REFERENCES flows_config(id) ON DELETE CASCADE,
  level     text NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  message   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE flow_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY flow_logs_admin ON flow_logs
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS flow_logs_flow_id_idx ON flow_logs (flow_id, created_at DESC);

-- ── 3. tv_channels ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tv_channels (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text UNIQUE NOT NULL,
  name       text NOT NULL,
  type       text NOT NULL CHECK (type IN ('tv', 'radio')),
  stream_url text,
  enabled    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tv_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY tv_channels_admin ON tv_channels
  USING (true)
  WITH CHECK (true);

-- ── 4. tv_channel_schedule ────────────────────────────────────────────────────
--  half_hour_slots: jsonb boolean[] de 48 elementos (una fila por día/canal)

CREATE TABLE IF NOT EXISTS tv_channel_schedule (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id     uuid NOT NULL REFERENCES tv_channels(id) ON DELETE CASCADE,
  day_of_week    int  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Lunes … 6=Domingo
  half_hour_slots jsonb NOT NULL DEFAULT '[]',   -- boolean[48]
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (channel_id, day_of_week)
);

ALTER TABLE tv_channel_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY tv_channel_schedule_admin ON tv_channel_schedule
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS tv_channel_schedule_channel_idx ON tv_channel_schedule (channel_id);

-- ── 5. Seed: flows_config ─────────────────────────────────────────────────────

INSERT INTO flows_config (slug, name, description, category, interval_seconds, schedule_cron)
VALUES
  -- INGESTA
  ('scraping_web',       'Scraping web de medios',                     'Descarga y parsea artículos de portadas de medios digitales seleccionados',               'ingesta',       1800, NULL),
  ('rss_medios',         'RSS de medios digitales',                    'Monitoriza feeds RSS y encola noticias nuevas para procesamiento',                         'ingesta',        300, NULL),
  ('tv_recording',       'Grabación TV en directo',                    'Captura stream de canales de TV configurados según franja horaria',                        'ingesta',        NULL, NULL),
  ('radio_recording',    'Grabación radio en directo',                  'Captura audio de emisoras de radio según franja horaria configurada',                      'ingesta',        NULL, NULL),
  -- PROCESAMIENTO
  ('whisper_transcription','Transcripción de audio (Whisper local)',   'Transcribe grabaciones de TV y radio usando Whisper en local',                             'procesamiento',   600, NULL),
  ('translation',        'Traducción a español',                       'Traduce contenido en otros idiomas al español (Argos Translate)',                          'procesamiento',   600, NULL),
  ('sentiment_analysis', 'Análisis de sentimiento (Ollama)',            'Clasifica tono (positivo/neutro/negativo) usando un modelo LLM local',                    'procesamiento',   900, NULL),
  ('entity_extraction',  'Extracción de entidades y keywords',          'Detecta personas, organizaciones, lugares y keywords relevantes',                         'procesamiento',   900, NULL),
  ('news_linking',       'Vinculación noticia ↔ cliente',              'Asocia noticias procesadas con las señales de cada cliente',                               'procesamiento',   300, NULL),
  -- GENERACION
  ('client_summaries',   'Resúmenes por cliente',                      'Genera un resumen narrativo diario de cobertura por cliente',                              'generacion',      NULL, '0 7 * * *'),
  ('daily_clipping',     'Notas / clipping diario por cliente',        'Prepara el clipping de prensa con las noticias más relevantes del día',                   'generacion',      NULL, '30 7 * * *'),
  ('mention_alerts',     'Alertas de menciones críticas',               'Envía alertas inmediatas cuando se detecta una mención de alto impacto',                  'generacion',       300, NULL)
ON CONFLICT (slug) DO NOTHING;

-- ── 6. Seed: tv_channels — TV ─────────────────────────────────────────────────

INSERT INTO tv_channels (slug, name, type) VALUES
  ('tv3',       'TV3',       'tv'),
  ('3_24',      '3/24',      'tv'),
  ('la_1',      'La 1',      'tv'),
  ('la_2',      'La 2',      'tv'),
  ('rtve_24h',  'RTVE 24h',  'tv'),
  ('telecinco', 'Telecinco', 'tv'),
  ('antena_3',  'Antena 3',  'tv'),
  ('lasexta',   'laSexta',   'tv'),
  ('cuatro',    'Cuatro',    'tv'),
  ('8tv',       '8TV',       'tv'),
  ('beteve',    'Betevé',    'tv')
ON CONFLICT (slug) DO NOTHING;

-- ── 7. Seed: tv_channels — Radio ─────────────────────────────────────────────

INSERT INTO tv_channels (slug, name, type) VALUES
  ('rac1',             'RAC1',             'radio'),
  ('catalunya_radio',  'Catalunya Ràdio',  'radio'),
  ('ser',              'SER',              'radio'),
  ('cope',             'COPE',             'radio'),
  ('onda_cero',        'Onda Cero',        'radio'),
  ('rne',              'RNE',              'radio')
ON CONFLICT (slug) DO NOTHING;

-- ── 8. Función updated_at automático ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flows_config_updated_at
  BEFORE UPDATE ON flows_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tv_channel_schedule_updated_at
  BEFORE UPDATE ON tv_channel_schedule
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
