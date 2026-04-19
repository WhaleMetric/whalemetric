'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Newspaper, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  SIGNAL_COUNTRIES, SIGNAL_LANGUAGES, SOURCE_TYPE_LABELS, SOURCE_TYPES,
} from '@/lib/signal-constants';
import type { SignalCategory } from '@/lib/types/signals';
import type { SourceRecord } from '@/lib/hooks/useSourcesForSignal';
import { MultiSelectDropdown, type MultiOption } from './MultiSelectDropdown';

const MAX_SELECTED = 30;

const COUNTRY_FILTER_OPTIONS: MultiOption[] = [
  { value: 'ES', label: 'España' },
  { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CO', label: 'Colombia' },
  { value: 'CL', label: 'Chile' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'GB', label: 'Reino Unido' },
  { value: 'FR', label: 'Francia' },
  { value: 'DE', label: 'Alemania' },
  { value: 'IT', label: 'Italia' },
  { value: 'PT', label: 'Portugal' },
  { value: 'BR', label: 'Brasil' },
  { value: 'INT', label: 'Internacional', prefix: '🌍' },
];

const LANGUAGE_FILTER_OPTIONS: MultiOption[] = [
  { value: 'es', label: 'Español' },
  { value: 'ca', label: 'Catalán' },
  { value: 'gl', label: 'Gallego' },
  { value: 'eu', label: 'Euskera' },
  { value: 'en', label: 'Inglés' },
  { value: 'fr', label: 'Francés' },
  { value: 'de', label: 'Alemán' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Portugués' },
  { value: 'ar', label: 'Árabe' },
];

const TYPE_FILTER_OPTIONS: MultiOption[] = SOURCE_TYPES.map((t) => ({
  value: t,
  label: SOURCE_TYPE_LABELS[t],
}));

const COUNTRY_NAMES: Record<string, string> = SIGNAL_COUNTRIES.reduce(
  (acc, c) => { acc[c.code] = c.name; return acc; },
  {} as Record<string, string>,
);
const LANGUAGE_NAMES: Record<string, string> = SIGNAL_LANGUAGES.reduce(
  (acc, l) => { acc[l.code] = l.name; return acc; },
  {} as Record<string, string>,
);

interface Props {
  sources: SourceRecord[];
  loading: boolean;
  error: string | null;
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;
  signalName: string;
  signalType: SignalCategory | null;
  signalAliases: string[];
  error_noSelection?: boolean;
}

export function SourcesSelector({
  sources, loading, error,
  selectedIds, onSelectedChange,
  signalName, signalType, signalAliases,
  error_noSelection,
}: Props) {
  const [search, setSearch]       = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [countries, setCountries] = useState<string[]>(['ES']);
  const [languages, setLanguages] = useState<string[]>([]);
  const [types, setTypes]         = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const didDefaultsRef = useRef(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  // On first load (once sources arrive), pre-select the top-marked ones.
  useEffect(() => {
    if (loading) return;
    if (didDefaultsRef.current) return;
    if (sources.length === 0) return;
    didDefaultsRef.current = true;
    if (selectedIds.length === 0) {
      const defaults = sources.filter((s) => s.is_top_source).map((s) => s.id);
      if (defaults.length > 0) {
        onSelectedChange(defaults.slice(0, MAX_SELECTED));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, sources.length]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Available list = all sources NOT selected, after filters + search.
  const availableSources = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return sources
      .filter((s) => !selectedSet.has(s.id))
      .filter((s) => {
        if (countries.length > 0) {
          const code = s.country_code ?? '';
          const isIntMatch = countries.includes('INT')
            && (s.scope === 'international' || code === 'INT' || code === '');
          const isCountryMatch = countries.some((c) => c !== 'INT' && c === code);
          if (!isIntMatch && !isCountryMatch) return false;
        }
        if (languages.length > 0) {
          // Marcar "Español" incluye también fuentes en catalán (contexto peninsular).
          const effective = languages.includes('es')
            ? Array.from(new Set([...languages, 'ca']))
            : languages;
          if (!s.language_code || !effective.includes(s.language_code)) return false;
        }
        if (types.length > 0) {
          if (!types.includes(s.type)) return false;
        }
        if (q && !s.name.toLowerCase().includes(q)) return false;
        return true;
      });
  }, [sources, selectedSet, debouncedSearch, countries, languages, types]);

  const selectedSources = useMemo(
    () => sources.filter((s) => selectedSet.has(s.id)),
    [sources, selectedSet],
  );

  const selectedCount = selectedSources.length;
  const limitReached = selectedCount >= MAX_SELECTED;

  const selectOne = (id: string) => {
    if (selectedSet.has(id)) return;
    if (selectedCount >= MAX_SELECTED) {
      toast.info('Máximo 30 fuentes. Quita una de Seleccionadas primero.');
      return;
    }
    onSelectedChange([...selectedIds, id]);
  };

  const deselectOne = (id: string) => {
    if (!selectedSet.has(id)) return;
    onSelectedChange(selectedIds.filter((x) => x !== id));
  };

  const clearSearch = () => setSearch('');

  const handleAIClick = async () => {
    const defaults = sources.filter((s) => s.is_top_source).map((s) => s.id).sort();
    const current = [...selectedIds].sort();
    const differs = defaults.length !== current.length
      || defaults.some((id, i) => id !== current[i]);

    if (differs && current.length > 0) {
      const ok = window.confirm('Esto reemplazará tu selección actual. ¿Continuar?');
      if (!ok) return;
    }

    setLoadingAI(true);
    try {
      const res = await fetch('/api/signals/suggest-sources', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: signalName,
          type: signalType,
          aliases: signalAliases,
        }),
      });
      const data = await res.json() as { source_ids?: string[] };
      const ids = Array.isArray(data.source_ids) ? data.source_ids : [];
      const capped = ids.slice(0, MAX_SELECTED);
      onSelectedChange(capped);
      toast.success(
        capped.length === 1
          ? '1 fuente sugerida según el tipo de señal'
          : `${capped.length} fuentes sugeridas según el tipo de señal`,
      );
    } catch {
      toast.error('No se pudieron obtener sugerencias');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div>
      {/* Header: title + counter */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        marginBottom: 10, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            Fuentes monitorizadas
            <span
              style={{
                fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontWeight: 600,
                color: limitReached ? '#047857' : 'var(--text-secondary)',
              }}
            >
              {selectedCount}/{MAX_SELECTED}
            </span>
          </div>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-tertiary)' }}>
            Solo se monitorizarán noticias de estas fuentes. Máximo {MAX_SELECTED}.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAIClick}
          disabled={loadingAI || loading}
          title="Sugerir fuentes según el tipo de señal"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', fontSize: 12, fontWeight: 500,
            border: '1px solid var(--border)', borderRadius: 7,
            background: 'var(--bg)', color: 'var(--text-secondary)',
            cursor: loadingAI ? 'wait' : 'pointer',
            flexShrink: 0,
            transition: 'background 0.12s',
          }}
          onMouseEnter={(e) => {
            if (!loadingAI) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--bg)';
          }}
        >
          {loadingAI
            ? <Loader2 size={14} style={{ animation: 'aliases-spin 0.8s linear infinite' }} />
            : <Sparkles size={14} />}
          <span>Marcar con IA</span>
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <svg
          width="13" height="13" viewBox="0 0 16 16"
          fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8"
          style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L13 13" strokeLinecap="round" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar fuentes…"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '8px 32px 8px 30px', fontSize: 12,
            border: '1px solid var(--border)', borderRadius: 7,
            background: 'var(--bg-muted)', color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Limpiar búsqueda"
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', padding: 0,
              display: 'flex', alignItems: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 12,
        marginBottom: 12,
      }}>
        <MultiSelectDropdown
          label="País"
          options={COUNTRY_FILTER_OPTIONS}
          value={countries}
          onChange={setCountries}
        />
        <MultiSelectDropdown
          label="Idioma"
          options={LANGUAGE_FILTER_OPTIONS}
          value={languages}
          onChange={setLanguages}
        />
        <MultiSelectDropdown
          label="Tipo de medio"
          options={TYPE_FILTER_OPTIONS}
          value={types}
          onChange={setTypes}
        />
      </div>

      {error_noSelection && (
        <div style={{
          marginBottom: 10, padding: '6px 10px', borderRadius: 6,
          background: 'rgba(239,68,68,0.08)', color: '#991B1B', fontSize: 12,
        }}>
          Selecciona al menos una fuente.
        </div>
      )}

      {/* Two columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 12,
      }}>
        <Column
          title="Disponibles"
          count={availableSources.length}
          emptyMessage={debouncedSearch || countries.length || languages.length || types.length
            ? 'No hay fuentes que coincidan'
            : 'Sin fuentes disponibles'}
          loading={loading}
          error={error}
        >
          {availableSources.map((s) => (
            <SourceRow
              key={s.id}
              source={s}
              onClick={() => selectOne(s.id)}
              variant="available"
            />
          ))}
        </Column>

        <Column
          title="Seleccionadas"
          count={selectedCount}
          emptyMessage="Ninguna fuente seleccionada. Añade al menos una."
        >
          {selectedSources.map((s) => (
            <SourceRow
              key={s.id}
              source={s}
              onClick={() => deselectOne(s.id)}
              onRemove={() => deselectOne(s.id)}
              variant="selected"
            />
          ))}
        </Column>
      </div>
    </div>
  );
}

// ── Column wrapper ───────────────────────────────────────────────────────────

function Column({
  title, count, emptyMessage, children, loading, error,
}: {
  title: string;
  count: number;
  emptyMessage: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}) {
  const isEmpty = Array.isArray(children)
    ? (children as React.ReactNode[]).length === 0
    : !children;

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 8,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      height: 360, overflow: 'hidden',
    }}>
      <div style={{
        padding: '9px 12px',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-subtle)',
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
      }}>
        <span>{title}</span>
        <span style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          color: 'var(--text-tertiary)',
        }}>
          ({count})
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px' }}>
        {loading && isEmpty ? (
          <div style={{ padding: '14px', fontSize: 12, color: 'var(--text-tertiary)' }}>
            Cargando fuentes…
          </div>
        ) : error ? (
          <div style={{ padding: '14px', fontSize: 12, color: '#991B1B' }}>
            Error: {error}
          </div>
        ) : isEmpty ? (
          <div style={{
            padding: '20px 14px', fontSize: 12, color: 'var(--text-tertiary)',
            textAlign: 'center', fontStyle: 'italic',
          }}>
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────

function SourceRow({
  source, onClick, onRemove, variant,
}: {
  source: SourceRecord;
  onClick: () => void;
  onRemove?: () => void;
  variant: 'available' | 'selected';
}) {
  const country = source.country_code
    ? (COUNTRY_NAMES[source.country_code] ?? source.country_code)
    : null;
  const language = source.language_code
    ? (LANGUAGE_NAMES[source.language_code] ?? source.language_code)
    : null;
  const meta = [country, language].filter(Boolean).join(' · ');

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', cursor: 'pointer',
        borderRadius: 6,
        transition: 'background 0.12s, opacity 0.15s',
        animation: 'source-fade 0.15s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)';
        if (onRemove) {
          const x = e.currentTarget.querySelector('[data-remove]') as HTMLElement | null;
          if (x) x.style.opacity = '1';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        if (onRemove) {
          const x = e.currentTarget.querySelector('[data-remove]') as HTMLElement | null;
          if (x) x.style.opacity = '0';
        }
      }}
    >
      <SourceLogo url={source.icon_url} name={source.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          lineHeight: 1.3,
        }}>
          {source.name}
        </div>
        {meta && (
          <div style={{
            fontSize: 11, color: 'var(--text-tertiary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginTop: 1,
          }}>
            {meta}
          </div>
        )}
      </div>
      {variant === 'selected' && onRemove && (
        <button
          type="button"
          data-remove
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label={`Quitar ${source.name}`}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', padding: 2,
            display: 'flex', alignItems: 'center',
            opacity: 0, transition: 'opacity 0.12s',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <style>{`@keyframes source-fade { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

function SourceLogo({ url, name }: { url: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <span style={{
        width: 24, height: 24, borderRadius: 5,
        background: 'var(--bg-muted)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-tertiary)',
        flexShrink: 0,
      }}
      title={name}
      >
        <Newspaper size={13} strokeWidth={1.8} />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      style={{
        width: 24, height: 24, borderRadius: 5,
        objectFit: 'contain', background: 'var(--bg-muted)',
        flexShrink: 0,
      }}
    />
  );
}
