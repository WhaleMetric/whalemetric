import type { SignalCategory } from '@/lib/types/signals';

// ── Countries (ISO-2 + special "INT" for pan-international media) ────────────

export interface SignalCountry {
  code: string;   // ISO-2 or "INT"
  name: string;
}

export const SIGNAL_COUNTRIES: SignalCountry[] = [
  { code: 'INT', name: 'Internacional' },

  { code: 'ES', name: 'España' },
  { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Perú' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PA', name: 'Panamá' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'CU', name: 'Cuba' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'NI', name: 'Nicaragua' },

  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canadá' },

  { code: 'GB', name: 'Reino Unido' },
  { code: 'FR', name: 'Francia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'IT', name: 'Italia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'CH', name: 'Suiza' },
  { code: 'AT', name: 'Austria' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'SE', name: 'Suecia' },
  { code: 'NO', name: 'Noruega' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'FI', name: 'Finlandia' },
  { code: 'PL', name: 'Polonia' },

  { code: 'BR', name: 'Brasil' },
];

// ── Languages ────────────────────────────────────────────────────────────────

export interface SignalLanguage {
  code: string;
  name: string;
}

export const SIGNAL_LANGUAGES: SignalLanguage[] = [
  { code: 'es', name: 'Español' },
  { code: 'ca', name: 'Catalán' },
  { code: 'gl', name: 'Gallego' },
  { code: 'eu', name: 'Euskera' },
  { code: 'en', name: 'Inglés' },
  { code: 'fr', name: 'Francés' },
  { code: 'de', name: 'Alemán' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Portugués' },
  { code: 'nl', name: 'Neerlandés' },
  { code: 'ar', name: 'Árabe' },
];

// ── Source (media) types ─────────────────────────────────────────────────────

export const SOURCE_TYPES = [
  'prensa_digital',
  'prensa_escrita',
  'television',
  'radio',
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  prensa_digital: 'Prensa digital',
  prensa_escrita: 'Prensa escrita',
  television:     'Televisión',
  radio:          'Radio',
};

// ── Signal types (mapped to Lucide icon names + labels) ──────────────────────

export interface SignalTypeOption {
  value: SignalCategory;
  label: string;
  icon:  LucideIconName;
}

export type LucideIconName =
  | 'User'
  | 'Building2'
  | 'Landmark'
  | 'Flag'
  | 'Sparkles'
  | 'Package'
  | 'Megaphone'
  | 'Calendar'
  | 'Hash'
  | 'Scale'
  | 'MapPin';

export const SIGNAL_TYPE_OPTIONS: SignalTypeOption[] = [
  { value: 'persona',             label: 'Persona',             icon: 'User'       },
  { value: 'organizacion',        label: 'Organización',        icon: 'Building2'  },
  { value: 'institucion_publica', label: 'Institución pública', icon: 'Landmark'   },
  { value: 'partido_politico',    label: 'Partido político',    icon: 'Flag'       },
  { value: 'marca',               label: 'Marca',               icon: 'Sparkles'   },
  { value: 'producto_servicio',   label: 'Producto o servicio', icon: 'Package'    },
  { value: 'campana_iniciativa',  label: 'Campaña o iniciativa',icon: 'Megaphone'  },
  { value: 'evento',              label: 'Evento',              icon: 'Calendar'   },
  { value: 'tema',                label: 'Tema',                icon: 'Hash'       },
  { value: 'normativa',           label: 'Normativa',           icon: 'Scale'      },
  { value: 'zona_geografica',     label: 'Zona geográfica',     icon: 'MapPin'     },
];

// Convenience lookup.
export const SIGNAL_TYPE_LABELS: Record<SignalCategory, string> =
  SIGNAL_TYPE_OPTIONS.reduce((acc, opt) => {
    acc[opt.value] = opt.label;
    return acc;
  }, {} as Record<SignalCategory, string>);
