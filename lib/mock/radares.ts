import type {
  Radar,
  RadarFolder,
  RadarSnapshot,
  UserSignal,
  VolumePoint,
  SentimentPoint,
  Clause,
} from '@/lib/types/radares';

// ── Mock folders ──────────────────────────────────────────────────────────────

export const MOCK_FOLDERS: RadarFolder[] = [
  {
    id: 'mock-folder-politica',
    name: 'Política',
    icon: 'Flag',
    color: '#3B82F6',
    position: 9001,
    radars: [{ count: 3 }],
    is_mock: true,
  },
  {
    id: 'mock-folder-competencia',
    name: 'Competencia',
    icon: 'Target',
    color: '#8B5CF6',
    position: 9002,
    radars: [{ count: 2 }],
    is_mock: true,
  },
];

// ── Mock signals (referenced by clauses) ─────────────────────────────────────

const S: Record<string, UserSignal> = {
  pp:         { id: 'mock-pp',         name: 'PP',              type: 'partido_politico', status: 'ready' },
  badalona:   { id: 'mock-badalona',   name: 'Badalona',        type: 'zona_geografica',  status: 'ready' },
  albiol:     { id: 'mock-albiol',     name: 'Albiol',          type: 'persona',          status: 'ready' },
  sanchez:    { id: 'mock-sanchez',    name: 'Pedro Sánchez',   type: 'persona',          status: 'ready' },
  economia:   { id: 'mock-economia',   name: 'Economía',        type: 'tema',             status: 'ready' },
  crisis:     { id: 'mock-crisis',     name: 'Crisis',          type: 'tema',             status: 'ready' },
  inflacion:  { id: 'mock-inflacion',  name: 'Inflación',       type: 'tema',             status: 'ready' },
  feijoo:     { id: 'mock-feijoo',     name: 'Feijóo',          type: 'persona',          status: 'ready' },
  bbva:       { id: 'mock-bbva',       name: 'BBVA',            type: 'organizacion',     status: 'ready' },
  santander:  { id: 'mock-santander',  name: 'Santander',       type: 'organizacion',     status: 'ready' },
  caixabank:  { id: 'mock-caixabank',  name: 'CaixaBank',       type: 'organizacion',     status: 'ready' },
  bancaCrisis:{ id: 'mock-banca-crisis', name: 'crisis',        type: 'tema',             status: 'ready' },
  nike:       { id: 'mock-nike',       name: 'Nike',            type: 'marca',            status: 'ready' },
  adidas:     { id: 'mock-adidas',     name: 'Adidas',          type: 'marca',            status: 'ready' },
  puma:       { id: 'mock-puma',       name: 'Puma',            type: 'marca',            status: 'ready' },
  psoe:       { id: 'mock-psoe',       name: 'PSOE',            type: 'partido_politico', status: 'ready' },
  sumar:      { id: 'mock-sumar',      name: 'Sumar',           type: 'partido_politico', status: 'ready' },
  erc:        { id: 'mock-erc',        name: 'ERC',             type: 'partido_politico', status: 'ready' },
  junts:      { id: 'mock-junts',      name: 'Junts',           type: 'partido_politico', status: 'ready' },
};

export const MOCK_SIGNALS: UserSignal[] = Object.values(S);

// ── Helpers ───────────────────────────────────────────────────────────────────

function clause(
  idx: number,
  radarId: string,
  operator: Clause['operator'],
  signals: UserSignal[],
  opts: { is_exclusion?: boolean; min_matches?: number } = {},
): Clause {
  return {
    id: `${radarId}-c${idx}`,
    position: idx,
    operator,
    min_matches: opts.min_matches ?? null,
    is_exclusion: opts.is_exclusion ?? false,
    signals,
  };
}

function buildVolumeTrend(base: number, seed: number): VolumePoint[] {
  const out: VolumePoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const wobble = Math.sin(seed + i * 0.6) * 0.25 + 1;
    const total = Math.round(base * wobble);
    out.push({
      date: iso,
      positive: Math.round(total * 0.35),
      neutral:  Math.round(total * 0.42),
      negative: Math.round(total * 0.23),
    });
  }
  return out;
}

function buildSentimentTrend(basePos: number, seed: number): SentimentPoint[] {
  const out: SentimentPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const wobble = Math.sin(seed + i * 0.22) * 8;
    const positive = Math.max(10, Math.min(90, Math.round(basePos + wobble)));
    const negative = Math.max(5, Math.min(60, Math.round(100 - positive - 35)));
    out.push({ date: iso, positive, negative });
  }
  return out;
}

function news(
  radarId: string,
  i: number,
  headline: string,
  source: string,
  hoursAgo: number,
  sentiment: 'positivo' | 'neutro' | 'negativo',
  frame: string,
): RadarSnapshot['recent_news'][0] {
  return {
    id: `${radarId}-n${i}`,
    headline,
    source,
    published_at: new Date(Date.now() - hoursAgo * 3600_000).toISOString(),
    sentiment,
    frame,
    url: '#',
  };
}

// ── Snapshots ────────────────────────────────────────────────────────────────

function snapshotFor(
  radarId: string,
  kpis: RadarSnapshot['kpis'],
  narrative: string,
  tags: string[],
  seed: number,
  breakdown: RadarSnapshot['signal_breakdown'],
  recent: RadarSnapshot['recent_news'],
): RadarSnapshot {
  return {
    id: `${radarId}-snap`,
    radar_id: radarId,
    kpis,
    narrative_text: narrative,
    narrative_tags: tags,
    volume_trend_14d: buildVolumeTrend(Math.max(5, Math.round(kpis.mentions_today / 14)), seed),
    sentiment_trend_30d: buildSentimentTrend(kpis.sentiment_positive_pct, seed + 1),
    signal_breakdown: breakdown,
    source_type_variation: [
      { label: 'Prensa digital',  value: Math.round(kpis.mentions_today * 0.58), variation_pct: 18 },
      { label: 'TV',              value: Math.round(kpis.mentions_today * 0.22), variation_pct: -4 },
      { label: 'Prensa escrita',  value: Math.round(kpis.mentions_today * 0.20), variation_pct: 9 },
    ],
    keyword_cloud: tags.map((w, i) => ({
      word: w,
      count: 40 - i * 4,
      sentiment: (i % 3 === 0 ? 'positivo' : i % 3 === 1 ? 'neutro' : 'negativo') as 'positivo' | 'neutro' | 'negativo',
    })),
    recent_news: recent,
    has_enough_data: true,
    updated_at: new Date(Date.now() - 12 * 60_000).toISOString(),
  };
}

// ── Radars ────────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

function baseRadar(
  id: string,
  name: string,
  folderId: string | null,
  description: string | null,
  clauses: Clause[],
): Radar {
  return {
    id,
    name,
    description,
    folder_id: folderId,
    top_level_operator: 'and',
    status: 'ready',
    is_favorite: false,
    last_viewed_at: null,
    updated_at: now,
    created_at: now,
    clauses,
    radar_alerts: [{ count: 0 }],
    is_mock: true,
  };
}

const R1_ID = 'mock-crisis-pp-badalona';
const R2_ID = 'mock-politica-economica';
const R3_ID = 'mock-crisis-banca';
const R4_ID = 'mock-nike-organico';
const R5_ID = 'mock-coalicion-gobierno';

export const MOCK_RADARS: Radar[] = [
  {
    ...baseRadar(
      R1_ID,
      'Crisis PP en Badalona',
      'mock-folder-politica',
      'Tensión política en torno al PP y el ámbito de Badalona',
      [
        clause(0, R1_ID, 'signal', [S.pp]),
        clause(1, R1_ID, 'or', [S.badalona, S.albiol]),
      ],
    ),
    is_favorite: true,
    radar_alerts: [{ count: 1 }],
  },
  baseRadar(
    R2_ID,
    'Política económica Gobierno',
    'mock-folder-politica',
    'Cobertura económica del Gobierno excluyendo la voz de Feijóo',
    [
      clause(0, R2_ID, 'signal', [S.sanchez]),
      clause(1, R2_ID, 'or', [S.economia, S.crisis, S.inflacion]),
      clause(2, R2_ID, 'signal', [S.feijoo], { is_exclusion: true }),
    ],
  ),
  baseRadar(
    R3_ID,
    'Crisis sector banca',
    'mock-folder-competencia',
    'OPA BBVA-Sabadell y turbulencias del sector',
    [
      clause(0, R3_ID, 'or', [S.bbva, S.santander, S.caixabank]),
      clause(1, R3_ID, 'signal', [S.bancaCrisis]),
    ],
  ),
  baseRadar(
    R4_ID,
    'Nike orgánico',
    'mock-folder-competencia',
    'Menciones de Nike limpias de competencia directa',
    [
      clause(0, R4_ID, 'signal', [S.nike]),
      clause(1, R4_ID, 'signal', [S.adidas], { is_exclusion: true }),
      clause(2, R4_ID, 'signal', [S.puma],   { is_exclusion: true }),
    ],
  ),
  baseRadar(
    R5_ID,
    'Coalición Gobierno · narrativa conjunta',
    'mock-folder-politica',
    'Al menos 2 partidos de la coalición apareciendo juntos',
    [
      clause(0, R5_ID, 'weighted', [S.psoe, S.sumar, S.erc, S.junts], { min_matches: 2 }),
    ],
  ),
];

// ── Snapshots map ────────────────────────────────────────────────────────────

export const MOCK_SNAPSHOTS: Record<string, RadarSnapshot> = {
  [R1_ID]: snapshotFor(
    R1_ID,
    { mentions_today: 142, mentions_delta: 28, reach_estimated: 3_100_000, reach_delta: 15, sentiment_positive_pct: 38, sentiment_delta: -6, active_sources: 24, active_sources_delta: 3 },
    'Tensión política en Badalona por declaraciones recientes del PP local. Albiol domina la conversación con intervenciones sobre seguridad y vivienda. Los medios autonómicos catalanes dan amplia cobertura mientras los estatales mantienen perfil bajo.',
    ['seguridad', 'Albiol', 'pleno municipal', 'inmigración', 'vivienda'],
    1.3,
    [
      { signal_id: S.pp.id,       signal_name: S.pp.name,       contribution_pct: 62, mentions: 88 },
      { signal_id: S.albiol.id,   signal_name: S.albiol.name,   contribution_pct: 28, mentions: 40 },
      { signal_id: S.badalona.id, signal_name: S.badalona.name, contribution_pct: 10, mentions: 14 },
    ],
    [
      news(R1_ID, 1, 'Albiol reactiva el debate sobre inmigración en Badalona', 'La Vanguardia',   2,  'negativo', 'Político'),
      news(R1_ID, 2, 'El pleno aprueba la nueva ordenanza impulsada por el PP', 'El Periódico',    5,  'neutro',   'Institucional'),
      news(R1_ID, 3, 'Vecinos critican la gestión municipal en vivienda',       'Nació Digital',   8,  'negativo', 'Social'),
      news(R1_ID, 4, 'El PP catalán respalda a Albiol ante las críticas',       'ABC',             14, 'positivo', 'Partidista'),
    ],
  ),
  [R2_ID]: snapshotFor(
    R2_ID,
    { mentions_today: 412, mentions_delta: 22, reach_estimated: 11_200_000, reach_delta: 15, sentiment_positive_pct: 34, sentiment_delta: -8, active_sources: 67, active_sources_delta: 3 },
    'Narrativa económica polarizada. El Gobierno defiende datos de empleo y recaudación; los medios conservadores destacan la inflación persistente. Crece la mención del BCE y las hipotecas variables.',
    ['empleo', 'inflación', 'BCE', 'hipotecas', 'Moncloa', 'salario mínimo'],
    2.1,
    [
      { signal_id: S.sanchez.id,   signal_name: S.sanchez.name,   contribution_pct: 48, mentions: 198 },
      { signal_id: S.economia.id,  signal_name: S.economia.name,  contribution_pct: 26, mentions: 107 },
      { signal_id: S.inflacion.id, signal_name: S.inflacion.name, contribution_pct: 16, mentions: 66  },
      { signal_id: S.crisis.id,    signal_name: S.crisis.name,    contribution_pct: 10, mentions: 41  },
    ],
    [
      news(R2_ID, 1, 'Sánchez defiende los datos de empleo en el Congreso',          'El País',   1,  'positivo', 'Institucional'),
      news(R2_ID, 2, 'La inflación subyacente vuelve a subir en marzo',              'Expansión', 3,  'negativo', 'Económico'),
      news(R2_ID, 3, 'El Gobierno prepara nuevas medidas fiscales',                  'Cinco Días', 6, 'neutro',   'Fiscal'),
      news(R2_ID, 4, 'Hipotecas variables: el BCE mantiene la presión sobre tipos', 'El Mundo',  10, 'negativo', 'Monetario'),
    ],
  ),
  [R3_ID]: snapshotFor(
    R3_ID,
    { mentions_today: 247, mentions_delta: 58, reach_estimated: 5_800_000, reach_delta: 34, sentiment_positive_pct: 48, sentiment_delta: -12, active_sources: 52, active_sources_delta: 8 },
    'Volumen al alza por la OPA BBVA-Sabadell. Santander y CaixaBank aparecen como terceros de comparación. Foco regulatorio desde la CNMV y posicionamiento del Gobierno.',
    ['OPA', 'BBVA', 'Sabadell', 'CNMV', 'fusiones', 'regulación'],
    3.7,
    [
      { signal_id: S.bbva.id,         signal_name: S.bbva.name,       contribution_pct: 54, mentions: 133 },
      { signal_id: S.santander.id,    signal_name: S.santander.name,  contribution_pct: 22, mentions: 54  },
      { signal_id: S.caixabank.id,    signal_name: S.caixabank.name,  contribution_pct: 14, mentions: 35  },
      { signal_id: S.bancaCrisis.id,  signal_name: S.bancaCrisis.name,contribution_pct: 10, mentions: 25  },
    ],
    [
      news(R3_ID, 1, 'BBVA mueve ficha: nueva propuesta a los accionistas del Sabadell', 'El Confidencial', 2,  'neutro',   'Corporativo'),
      news(R3_ID, 2, 'La CNMV revisa los plazos de la operación',                         'Expansión',       4,  'neutro',   'Regulatorio'),
      news(R3_ID, 3, 'Santander rompe récord de beneficios trimestrales',                 'Cinco Días',      6,  'positivo', 'Resultados'),
      news(R3_ID, 4, 'CaixaBank cierra su plan estratégico 2025',                         'El Economista',   11, 'positivo', 'Estratégico'),
    ],
  ),
  [R4_ID]: snapshotFor(
    R4_ID,
    { mentions_today: 89, mentions_delta: 12, reach_estimated: 2_100_000, reach_delta: 8, sentiment_positive_pct: 71, sentiment_delta: 5, active_sources: 34, active_sources_delta: 2 },
    'Cobertura limpia de Nike centrada en sostenibilidad e innovación de producto. Tono mayoritariamente positivo, con picos en moda y deporte femenino.',
    ['sostenibilidad', 'innovación', 'running', 'deporte femenino', 'moda'],
    4.4,
    [
      { signal_id: S.nike.id, signal_name: S.nike.name, contribution_pct: 100, mentions: 89 },
    ],
    [
      news(R4_ID, 1, 'Nike presenta su línea de zapatillas recicladas',       'Marca',       3,  'positivo', 'Producto'),
      news(R4_ID, 2, 'Campaña de Nike con atletas de la selección femenina', 'As',           5,  'positivo', 'Marketing'),
      news(R4_ID, 3, 'Nike invierte en startups de materiales sostenibles',   'Expansión',   9,  'positivo', 'Corporativo'),
      news(R4_ID, 4, 'Ranking de marcas deportivas: Nike mantiene el liderazgo', 'Vogue Business', 16, 'neutro', 'Industria'),
    ],
  ),
  [R5_ID]: snapshotFor(
    R5_ID,
    { mentions_today: 189, mentions_delta: 8, reach_estimated: 4_500_000, reach_delta: 3, sentiment_positive_pct: 42, sentiment_delta: 1, active_sources: 41, active_sources_delta: 4 },
    'La narrativa conjunta de los socios de la coalición se mantiene estable. Sumar y PSOE concentran la mayoría de apariciones compartidas, con ERC y Junts entrando al relato en las negociaciones presupuestarias.',
    ['presupuestos', 'coalición', 'pactos', 'Cataluña', 'investidura'],
    5.8,
    [
      { signal_id: S.psoe.id,  signal_name: S.psoe.name,  contribution_pct: 42, mentions: 79 },
      { signal_id: S.sumar.id, signal_name: S.sumar.name, contribution_pct: 28, mentions: 53 },
      { signal_id: S.erc.id,   signal_name: S.erc.name,   contribution_pct: 18, mentions: 34 },
      { signal_id: S.junts.id, signal_name: S.junts.name, contribution_pct: 12, mentions: 23 },
    ],
    [
      news(R5_ID, 1, 'PSOE y Sumar acuerdan el calendario presupuestario',        'eldiario.es',     2,  'positivo', 'Institucional'),
      news(R5_ID, 2, 'ERC condiciona su apoyo a avances en financiación',          'ARA',             5,  'neutro',   'Negociación'),
      news(R5_ID, 3, 'Junts mantiene la presión sobre el Gobierno',                'La Vanguardia',   7,  'negativo', 'Partidista'),
      news(R5_ID, 4, 'Sumar presenta enmiendas al paquete fiscal',                 'Público',         13, 'positivo', 'Fiscal'),
    ],
  ),
};

// ── Lookups ───────────────────────────────────────────────────────────────────

export function findMockRadar(id: string): Radar | undefined {
  return MOCK_RADARS.find((r) => r.id === id);
}

export function findMockSnapshot(radarId: string): RadarSnapshot | undefined {
  return MOCK_SNAPSHOTS[radarId];
}
