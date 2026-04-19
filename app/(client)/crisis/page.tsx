'use client';

import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MOCK_CRISES } from '@/lib/mock/crises';
import { CrisisCard } from './_components/CrisisCard';
import { CrisisFilters } from './_components/CrisisFilters';
import type { CrisisStatus } from '@/lib/types/crisis';

const VALID_STATUSES: CrisisStatus[] = ['active', 'monitoring', 'resolved', 'archived'];

function CrisisPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = (() => {
    const raw = searchParams.get('status');
    return VALID_STATUSES.includes(raw as CrisisStatus) ? (raw as CrisisStatus) : 'active';
  })();

  const changeStatus = (next: CrisisStatus) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('status', next);
    router.push(`/crisis?${p.toString()}`);
  };

  const counts = useMemo<Record<CrisisStatus, number>>(() => ({
    active:     MOCK_CRISES.filter((c) => c.status === 'active').length,
    monitoring: MOCK_CRISES.filter((c) => c.status === 'monitoring').length,
    resolved:   MOCK_CRISES.filter((c) => c.status === 'resolved').length,
    archived:   MOCK_CRISES.filter((c) => c.status === 'archived').length,
  }), []);

  const filtered = useMemo(
    () => MOCK_CRISES
      .filter((c) => c.status === status)
      .sort((a, b) => {
        // Critical first, then by recency
        const rank = (sev: string) =>
          sev === 'CRITICAL' ? 0 : sev === 'HIGH' ? 1 : sev === 'MEDIUM' ? 2 : 3;
        const sevDiff = rank(a.severity) - rank(b.severity);
        if (sevDiff !== 0) return sevDiff;
        return new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime();
      }),
    [status],
  );

  const activeCount = counts.active;

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-subtle)' }}>
      {/* Header */}
      <div style={{
        padding: '18px 28px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
          Crisis
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '3px 0 14px' }}>
          Situaciones que requieren atención
          {activeCount > 0 && ` · ${activeCount} activa${activeCount > 1 ? 's' : ''}`}
        </p>
        <CrisisFilters value={status} onChange={changeStatus} counts={counts} />
      </div>

      {/* Body */}
      <div style={{ padding: 28 }}>
        {filtered.length === 0 ? (
          <EmptyState status={status} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((c) => <CrisisCard key={c.id} crisis={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CrisisPage() {
  return (
    <Suspense>
      <CrisisPageInner />
    </Suspense>
  );
}

// ── Empty state (sereno, sin alarmismo) ──────────────────────────────────────

function EmptyState({ status }: { status: CrisisStatus }) {
  if (status === 'active') {
    return (
      <div style={{
        maxWidth: 480, margin: '24px auto 0',
        padding: '36px 28px', textAlign: 'center',
        background: 'var(--bg)',
        border: '1px solid var(--border)', borderRadius: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(16,185,129,0.12)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#047857" strokeWidth="2.2">
            <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          No hay crisis activas
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Todo en orden. Las crisis se detectan automáticamente sobre tus señales y radares cuando el sistema identifique volumen crítico sostenido y sentimiento adverso.
        </p>
      </div>
    );
  }

  const label = status === 'monitoring' ? 'en monitorización'
    : status === 'resolved' ? 'resueltas'
    : 'archivadas';

  return (
    <div style={{
      maxWidth: 440, margin: '24px auto 0',
      padding: '28px 24px', textAlign: 'center',
      background: 'var(--bg)',
      border: '1px dashed var(--border)', borderRadius: 12,
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
        Sin crisis {label}
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
        Aquí aparecerán las crisis con este estado cuando las haya.
      </p>
    </div>
  );
}
