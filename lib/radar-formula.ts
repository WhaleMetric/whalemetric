import type { Clause, TopLevelOperator } from '@/lib/types/radares';

export function clauseToText(clause: Clause): string {
  const names = clause.signals.map((s) => s.name);
  if (clause.operator === 'signal') return names[0] ?? '';
  if (clause.operator === 'weighted') {
    return `≥${clause.min_matches ?? 2} DE (${names.join(' OR ')})`;
  }
  const op = clause.operator.toUpperCase();
  const joined = names.join(` ${op} `);
  return names.length > 1 ? `(${joined})` : joined;
}

export function formulaToText(
  clauses: Clause[],
  topOp: TopLevelOperator,
): string {
  const inclusions = clauses.filter((c) => !c.is_exclusion);
  const exclusions = clauses.filter((c) => c.is_exclusion);

  const inclusionParts = inclusions.map(clauseToText);
  const exclusionParts = exclusions.map((c) => `NOT ${clauseToText(c)}`);

  const inclusion = inclusionParts.join(` ${topOp.toUpperCase()} `);
  return [inclusion, ...exclusionParts].filter(Boolean).join(' ');
}
