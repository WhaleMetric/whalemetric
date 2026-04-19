export type SignalCategory =
  | 'persona'
  | 'organizacion'
  | 'institucion_publica'
  | 'partido_politico'
  | 'marca'
  | 'producto_servicio'
  | 'campana_iniciativa'
  | 'evento'
  | 'tema'
  | 'normativa'
  | 'zona_geografica';

export type SignalStatus = 'warming_up' | 'ready' | 'error' | 'archived';

export interface SignalRecord {
  id: string;
  name: string;
  type: SignalCategory;
  aliases: string[] | null;
  description: string | null;
  status: SignalStatus;
  is_favorite: boolean;
}

export const SIGNAL_CATEGORY_ORDER: SignalCategory[] = [
  'persona',
  'organizacion',
  'institucion_publica',
  'partido_politico',
  'marca',
  'producto_servicio',
  'campana_iniciativa',
  'evento',
  'tema',
  'normativa',
  'zona_geografica',
];

export const SIGNAL_CATEGORY_LABELS: Record<SignalCategory, string> = {
  persona:             'Personas',
  organizacion:        'Organizaciones',
  institucion_publica: 'Instituciones',
  partido_politico:    'Partidos políticos',
  marca:               'Marcas',
  producto_servicio:   'Productos y servicios',
  campana_iniciativa:  'Campañas',
  evento:              'Eventos',
  tema:                'Temas',
  normativa:           'Normativa',
  zona_geografica:     'Zonas geográficas',
};
