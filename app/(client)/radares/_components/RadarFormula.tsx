'use client';

import { Fragment } from 'react';
import type { Clause, TopLevelOperator } from '@/lib/types/radares';
import { formulaToText } from '@/lib/radar-formula';
import { OperatorBadge } from './OperatorBadge';
import { SignalChip } from './SignalChip';

interface Props {
  clauses: Clause[];
  top_level_operator: TopLevelOperator;
  compact?: boolean;
  nonLink?: boolean;
}

export function RadarFormula({
  clauses,
  top_level_operator,
  compact,
  nonLink,
}: Props) {
  if (compact) {
    return (
      <span
        title={formulaToText(clauses, top_level_operator)}
        style={{
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 10.5,
          color: 'var(--text-tertiary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
        }}
      >
        {formulaToText(clauses, top_level_operator)}
      </span>
    );
  }

  const inclusions = clauses.filter((c) => !c.is_exclusion);
  const exclusions = clauses.filter((c) => c.is_exclusion);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 5,
        rowGap: 6,
      }}
    >
      {inclusions.map((clause, idx) => (
        <Fragment key={clause.id}>
          {idx > 0 && <OperatorBadge kind={top_level_operator} />}
          {renderClause(clause, nonLink)}
        </Fragment>
      ))}
      {exclusions.map((clause) => (
        <Fragment key={clause.id}>
          <OperatorBadge kind="not" />
          {renderClause(clause, nonLink)}
        </Fragment>
      ))}
    </div>
  );
}

function renderClause(clause: Clause, nonLink?: boolean) {
  if (clause.signals.length === 0) return null;

  if (clause.operator === 'signal') {
    return <SignalChip signal={clause.signals[0]} nonLink={nonLink} />;
  }

  if (clause.operator === 'weighted') {
    return (
      <>
        <OperatorBadge
          kind="min"
          label={`≥${clause.min_matches ?? 2} DE`}
        />
        <Group>
          {clause.signals.map((s, i) => (
            <Fragment key={s.id}>
              {i > 0 && <OperatorBadge kind="or" />}
              <SignalChip signal={s} nonLink={nonLink} />
            </Fragment>
          ))}
        </Group>
      </>
    );
  }

  // and / or
  return (
    <Group>
      {clause.signals.map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 && <OperatorBadge kind={clause.operator as 'and' | 'or'} />}
          <SignalChip signal={s} nonLink={nonLink} />
        </Fragment>
      ))}
    </Group>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 5,
        rowGap: 6,
        padding: '5px 8px',
        border: '1px dashed var(--border)',
        borderRadius: 7,
        background: 'rgba(0,0,0,0.012)',
      }}
    >
      {children}
    </span>
  );
}
