'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SIGNAL_COUNTRIES,
  SIGNAL_LANGUAGES,
  SOURCE_TYPE_LABELS,
  type SourceType,
} from '@/lib/signal-constants';
import type { SourceRecord, SourceScope } from '@/lib/hooks/useSourcesForSignal';

interface Props {
  sources: SourceRecord[];
  loading: boolean;
  error: string | null;

  // filters applied from the advanced section
  countries: string[];
  languages: string[];
  sourceTypes: SourceType[];

  // selection
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;

  /** When true the UI reports an "at least one" error at the top. */
  error_noSelection?: boolean;
}

const SCOPE_ORDER: SourceScope[] = ['international', 'national', 'regional', 'local'];

const SCOPE_LABEL: Record<SourceScope, string> = {
  international: 'Internacional',
  national:      'Nacional',
  regional:      'Regional',
  local:         'Local',
};

export function SourcesSelector({
  sources, loading, error,
  countries, languages, sourceTypes,
  selectedIds, onSelectedChange,
  error_noSelection,
}: Props) {
  const [search, setSearch]       = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const userTouchedRef = useRef(false);

  // Debounce search by 150ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  // Sources that pass the advanced filters (country/language/type). Search
  // does NOT affect filteredSources (only visibleSources) so "all available"
  // math stays consistent.
  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      if (countries.length > 0) {
        const code = s.country_code ?? '';
        const isIntMatch = countries.includes('INT')
          && (s.scope === 'international' || code === 'INT' || code === '');
        const isCountryMatch = countries.some((c) => c !== 'INT' && c === code);
        if (!isIntMatch && !isCountryMatch) return false;
      }
      if (languages.length > 0) {
        if (!s.language_code || !languages.includes(s.language_code)) return false;
      }
      if (sourceTypes.length > 0) {
        if (!sourceTypes.includes(s.type as SourceType)) return false;
      }
      return true;
    });
  }, [sources, countries, languages, sourceTypes]);

  const filteredIds = useMemo(() => filteredSources.map((s) => s.id), [filteredSources]);
  const filteredIdSet = useMemo(() => new Set(filteredIds), [filteredIds]);

  // Pre-select top 30 by news_count on first load (once sources are available).
  useEffect(() => {
    if (loading) return;
    if (userTouchedRef.current) return;
    if (sources.length === 0) return;
    const top30 = filteredSources.slice(0, 30).map((s) => s.id);
    // Only initialize if current selection is empty (first mount).
    if (selectedIds.length === 0 && top30.length > 0) {
      onSelectedChange(top30);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, sources.length]);

  // Whenever filters change and the user has touched the selection, clamp out
  // ids that are no longer in the filtered set.
  useEffect(() => {
    if (!userTouchedRef.current) return;
    const next = selectedIds.filter((id) => filteredIdSet.has(id));
    if (next.length !== selectedIds.length) onSelectedChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIdSet]);

  // Visible sources also apply search
  const visibleSources = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return filteredSources;
    return filteredSources.filter((s) => s.name.toLowerCase().includes(q));
  }, [filteredSources, debouncedSearch]);

  // Group by scope
  const bySource = useMemo(() => {
    const groups: Record<SourceScope, SourceRecord[]> = {
      international: [], national: [], regional: [], local: [],
    };
    for (const s of visibleSources) {
      const scope = ((s.scope ?? '').toLowerCase() as SourceScope);
      if (SCOPE_ORDER.includes(scope)) groups[scope].push(s);
      else groups.national.push(s); // fallback bucket
    }
    return groups;
  }, [visibleSources]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const touch = () => { userTouchedRef.current = true; };

  const toggleOne = (id: string) => {
    touch();
    onSelectedChange(selectedSet.has(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id]);
  };

  const setAll = (select: boolean) => {
    touch();
    if (select) {
      const merged = Array.from(new Set([...selectedIds.filter((id) => filteredIdSet.has(id)), ...filteredIds]));
      onSelectedChange(merged);
    } else {
      onSelectedChange(selectedIds.filter((id) => !filteredIdSet.has(id)));
    }
  };

  const setAllInScope = (scope: SourceScope, select: boolean) => {
    touch();
    const ids = bySource[scope].map((s) => s.id);
    const idSet = new Set(ids);
    if (select) {
      const merged = Array.from(new Set([...selectedIds, ...ids]));
      onSelectedChange(merged);
    } else {
      onSelectedChange(selectedIds.filter((id) => !idSet.has(id)));
    }
  };

  const totalSelected = selectedIds.filter((id) => filteredIdSet.has(id)).length;
  const totalAvailable = filteredIds.length;
  const allSelected = totalSelected > 0 && totalSelected === totalAvailable;

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        marginBottom: 10,
      }}>
        <div
          title="Solo se monitorizarán noticias de estas fuentes."
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}
        >
          Fuentes monitorizadas: {totalSelected}/{totalAvailable}
        </div>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setAll(!allSelected)}
          style={{
            padding: '5px 11px', fontSize: 12, fontWeight: 500,
            border: '1px solid var(--border)', borderRadius: 6,
            background: 'var(--bg)', color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
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
          placeholder="Buscar fuente por nombre…"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '8px 10px 8px 30px', fontSize: 12,
            border: '1px solid var(--border)', borderRadius: 6,
            background: 'var(--bg-muted)', color: 'var(--text-primary)',
            outline: 'none',
          }}
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

      {/* List */}
      <div
        style={{
          maxHeight: 400, overflowY: 'auto',
          border: '1px solid var(--border)', borderRadius: 8,
          background: 'var(--bg)',
          transition: 'opacity 0.15s',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading && sources.length === 0 ? (
          <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--text-tertiary)' }}>
            Cargando fuentes…
          </div>
        ) : error ? (
          <div style={{ padding: '16px 14px', fontSize: 12, color: '#991B1B' }}>
            Error al cargar fuentes: {error}
          </div>
        ) : visibleSources.length === 0 ? (
          <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--text-tertiary)' }}>
            {debouncedSearch
              ? `Sin resultados para "${debouncedSearch}"`
              : 'No hay fuentes que encajen con los filtros actuales.'}
          </div>
        ) : (
          SCOPE_ORDER.map((scope) => {
            const items = bySource[scope];
            if (items.length === 0) return null;
            const scopeIds = items.map((s) => s.id);
            const scopeSelected = scopeIds.filter((id) => selectedSet.has(id)).length;
            const allScopeSelected = scopeSelected === scopeIds.length && scopeIds.length > 0;
            return (
              <div key={scope} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  padding: '10px 14px',
                  background: 'var(--bg-subtle)',
                  position: 'sticky', top: 0, zIndex: 1,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--text-tertiary)', marginRight: 8, flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {SCOPE_LABEL[scope]}
                  </span>
                  <span style={{
                    fontSize: 11, color: 'var(--text-tertiary)',
                    marginLeft: 6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}>
                    {scopeSelected}/{scopeIds.length}
                  </span>
                  <div style={{ flex: 1 }} />
                  <button
                    type="button"
                    onClick={() => setAllInScope(scope, !allScopeSelected)}
                    style={{
                      padding: '3px 8px', fontSize: 11, fontWeight: 500,
                      border: 'none', background: 'transparent',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      borderRadius: 4,
                    }}
                  >
                    {allScopeSelected ? 'Desmarcar todo' : 'Marcar todo'}
                  </button>
                </div>
                {items.map((src) => (
                  <SourceRow
                    key={src.id}
                    source={src}
                    checked={selectedSet.has(src.id)}
                    onToggle={() => toggleOne(src.id)}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────

function SourceRow({
  source, checked, onToggle,
}: { source: SourceRecord; checked: boolean; onToggle: () => void }) {
  const countryLabel = source.country_code
    ? (SIGNAL_COUNTRIES.find((c) => c.code === source.country_code)?.code ?? source.country_code)
    : '—';
  const languageLabel = source.language_code
    ? (SIGNAL_LANGUAGES.find((l) => l.code === source.language_code)?.code ?? source.language_code)
    : '—';
  const typeLabel = SOURCE_TYPE_LABELS[source.type as SourceType] ?? source.type;

  return (
    <div
      onClick={onToggle}
      role="button"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px', cursor: 'pointer',
        fontSize: 13, color: 'var(--text-primary)',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
      />
      <SourceLogo url={source.icon_url} name={source.name} />
      <span style={{
        flex: 1, minWidth: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {source.name}
      </span>
      <span style={{
        fontSize: 11, color: 'var(--text-tertiary)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        flexShrink: 0,
      }}>
        {typeLabel} · {countryLabel} · {languageLabel} ·{' '}
        <span style={{ color: 'var(--text-secondary)' }}>{source.news_count.toLocaleString()}</span>
      </span>
    </div>
  );
}

function SourceLogo({ url, name }: { url: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <span style={{
        width: 20, height: 20, borderRadius: 4,
        background: 'var(--bg-muted)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)',
        flexShrink: 0,
      }}>
        {name.charAt(0).toUpperCase()}
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
        width: 20, height: 20, borderRadius: 4,
        objectFit: 'contain', background: 'var(--bg-muted)',
        flexShrink: 0,
      }}
    />
  );
}
