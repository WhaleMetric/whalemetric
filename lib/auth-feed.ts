export type FeedItem = {
  id: string;
  time: string;   // "HH:MM" formato 24h
  source: string; // máx 10 chars
  headline: string; // máx 70 chars
};

export const feed: FeedItem[] = [
  { id: '1',  time: '23:42', source: 'TV3',        headline: "L'Ajuntament de Badalona aprova els pressupostos per 2026" },
  { id: '2',  time: '23:41', source: 'ABC News',   headline: 'Economic forecast suggests slowdown in Q2 growth projections' },
  { id: '3',  time: '23:40', source: 'Sky News',   headline: 'Breaking: EU Commission unveils new digital regulation package' },
  { id: '4',  time: '23:39', source: 'El País',    headline: 'El gobierno anuncia nuevas medidas contra la inflación energética' },
  { id: '5',  time: '23:38', source: 'SER',        headline: 'Entrevista con el ministro de Industria en Hoy por Hoy' },
  { id: '6',  time: '23:37', source: 'La Sexta',   headline: 'Análisis en directo: los datos de paro de abril sorprenden' },
  { id: '7',  time: '23:36', source: 'CNBC',       headline: 'Tech stocks rally as investors anticipate Fed rate decision' },
  { id: '8',  time: '23:35', source: 'Euronews',   headline: 'Cumbre europea: los líderes debaten el nuevo marco fiscal' },
  { id: '9',  time: '23:34', source: 'COPE',       headline: 'La cadena SER lidera la EGM con crecimiento interanual del 4%' },
  { id: '10', time: '23:33', source: 'Bloomberg',  headline: 'Spanish banks outperform European peers in Q1 earnings season' },
  { id: '11', time: '23:32', source: 'EITB',       headline: 'Eusko Jaurlaritzak aurrekontu berriak onartu ditu 2026rako' },
  { id: '12', time: '23:31', source: 'RNE',        headline: 'Informe Semanal: monográfico sobre la transición energética' },
  { id: '13', time: '23:30', source: '20min',      headline: 'Los alquileres en Barcelona suben un 8,4% respecto al año pasado' },
  { id: '14', time: '23:29', source: 'DW',         headline: 'Germany signals support for EU-wide defense investment plan' },
  { id: '15', time: '23:28', source: 'À Punt',     headline: 'Les Corts Valencianes aproven la reforma del finançament autonòmic' },
];
