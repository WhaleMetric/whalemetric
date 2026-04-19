import type { SignalCategory } from '@/lib/types/signals';

/**
 * Client-side alias suggestion. Rule-based heuristics — no backend call.
 * Returns up to 4 suggestions, never containing the original name verbatim
 * and never containing duplicates among themselves.
 */
export function suggestAliases(rawName: string, type: SignalCategory): string[] {
  const name = rawName.trim();
  if (!name) return [];

  const raw = computeRawSuggestions(name, type);
  const seen = new Set<string>([norm(name)]);
  const out: string[] = [];
  for (const candidate of raw) {
    const c = candidate.trim();
    if (!c) continue;
    const key = norm(c);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length >= 4) break;
  }
  return out;
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLikelyAcronym(name: string): boolean {
  return name.length <= 4 && /^[A-Z0-9]+$/.test(name);
}

function computeRawSuggestions(name: string, type: SignalCategory): string[] {
  switch (type) {
    case 'persona':                return personaSuggestions(name);
    case 'organizacion':           return organizacionSuggestions(name);
    case 'institucion_publica':    return institucionSuggestions(name);
    case 'partido_politico':       return partidoSuggestions(name);
    case 'marca':                  return marcaSuggestions(name);
    case 'producto_servicio':      return productoSuggestions(name);
    case 'campana_iniciativa':     return campanaSuggestions(name);
    case 'evento':                 return eventoSuggestions(name);
    case 'tema':                   return temaSuggestions(name);
    case 'normativa':              return normativaSuggestions(name);
    case 'zona_geografica':        return zonaSuggestions(name);
    default:                       return [];
  }
}

// ── persona ──────────────────────────────────────────────────────────────────

function personaSuggestions(name: string): string[] {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    // single word — not much to add generically
    return [];
  }
  const first = parts[0];
  const last  = parts.slice(1).join(' ');
  const lastPart = parts[parts.length - 1];
  return [
    lastPart,
    `${first[0]}. ${last}`,
    `señor ${lastPart}`,
    `la persona de ${name}`,
  ];
}

// ── organizacion ─────────────────────────────────────────────────────────────

function organizacionSuggestions(name: string): string[] {
  if (isLikelyAcronym(name)) {
    // Probably an acronym like "BBVA". Offer expansion + definite article.
    return [
      `Grupo ${name}`,
      `el ${name}`,
      `${name} (empresa)`,
      `compañía ${name}`,
    ];
  }
  // Full name — propose acronym from initials + shorter variants.
  const words = name.split(/\s+/).filter(Boolean);
  const initials = words
    .filter((w) => /^[A-ZÁÉÍÓÚÑa-záéíóúñ]/.test(w))
    .map((w) => w[0]!.toUpperCase())
    .join('');
  const short = words.slice(0, 2).join(' ');
  return [
    initials.length >= 2 ? initials : '',
    `Grupo ${name}`,
    `el ${name}`,
    short !== name ? short : '',
  ];
}

// ── institucion_publica ──────────────────────────────────────────────────────

function institucionSuggestions(name: string): string[] {
  if (isLikelyAcronym(name)) {
    return [
      `la ${name}`,
      `${name} (organismo público)`,
      'institución pública',
    ];
  }
  // Pull last content word as short form ("Ministerio de Sanidad" → "Sanidad")
  const last = name.split(/\s+/).filter(Boolean).pop() ?? '';
  const initials = name
    .split(/\s+/)
    .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))
    .map((w) => w[0])
    .join('');
  return [
    last !== name ? last : '',
    `el ${name}`,
    initials.length >= 3 ? initials : '',
    `${name} España`,
  ];
}

// ── partido_politico ─────────────────────────────────────────────────────────

function partidoSuggestions(name: string): string[] {
  if (isLikelyAcronym(name)) {
    return [
      `partido ${name}`,
      `los del ${name}`,
      `${name} (partido)`,
      `militantes del ${name}`,
    ];
  }
  const words = name.split(/\s+/).filter(Boolean);
  const initials = words
    .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))
    .map((w) => w[0])
    .join('');
  return [
    initials.length >= 2 ? initials : '',
    `el partido ${words[words.length - 1] ?? name}`,
    `el ${name}`,
  ];
}

// ── marca ────────────────────────────────────────────────────────────────────

function marcaSuggestions(name: string): string[] {
  const noSpace = name.replace(/[\s-]+/g, '');
  const hyphenated = name.replace(/\s+/g, '-');
  return [
    `la marca ${name}`,
    noSpace !== name ? noSpace : '',
    hyphenated !== name ? hyphenated : '',
    `${name} Inc.`,
  ];
}

// ── producto_servicio ────────────────────────────────────────────────────────

function productoSuggestions(name: string): string[] {
  const words = name.split(/\s+/).filter(Boolean);
  const head = words[0];
  return [
    `el ${name}`,
    `nuevo ${name}`,
    head && head !== name ? head : '',
    `producto ${name}`,
  ];
}

// ── campana_iniciativa ───────────────────────────────────────────────────────

function campanaSuggestions(name: string): string[] {
  const noSpace = name.replace(/\s+/g, '');
  const lower = name.toLowerCase();
  return [
    noSpace !== name ? noSpace : '',
    `campaña ${name}`,
    `iniciativa ${name}`,
    lower !== name ? lower : '',
  ];
}

// ── evento ───────────────────────────────────────────────────────────────────

function eventoSuggestions(name: string): string[] {
  const words = name.split(/\s+/).filter(Boolean);
  const initials = words
    .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))
    .map((w) => w[0])
    .join('');
  return [
    initials.length >= 2 ? initials : '',
    `evento ${name}`,
    words.slice(0, 2).join(' ') !== name ? words.slice(0, 2).join(' ') : '',
    `edición ${name}`,
  ];
}

// ── tema ─────────────────────────────────────────────────────────────────────

function temaSuggestions(name: string): string[] {
  const lower = name.toLowerCase();
  const short = lower.endsWith('a') ? lower.slice(0, -1) + 'o'
    : lower.endsWith('o') ? lower.slice(0, -1) + 'a'
    : lower;
  return [
    lower !== name ? lower : '',
    short !== lower ? short : '',
    `situación ${lower}`,
    `coyuntura ${lower}`,
  ];
}

// ── normativa ────────────────────────────────────────────────────────────────

function normativaSuggestions(name: string): string[] {
  const lower = name.toLowerCase();
  return [
    `nueva ${lower}`,
    `reglamento ${name}`,
    `normativa ${lower}`,
    `regulación ${lower}`,
  ];
}

// ── zona_geografica ──────────────────────────────────────────────────────────

function zonaSuggestions(name: string): string[] {
  return [
    `ciudad de ${name}`,
    `municipio de ${name}`,
    `área de ${name}`,
    `${name} capital`,
  ];
}
