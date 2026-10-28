/**
 * Finance presentation and aggregation logic (PRD v6 §12).
 * Framework-free so the same rules can run server-side.
 *
 * Two rules from §12 are enforced here rather than in components:
 *  - §12.3 aggregated values never add unlike currencies without conversion;
 *  - §12.2 "settled" means supported by a completed reconciliation record,
 *    not merely an expected amount.
 */

import type { FinanceObligation, ObligationStatus, SettlementRecord } from './types';

type BadgeVariant = 'brand' | 'positive' | 'warning' | 'danger' | 'neutral';

const STATUS_BADGE: Record<ObligationStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'finance.status.pending', variant: 'warning' },
  approved: { label: 'finance.status.approved', variant: 'positive' },
  partially_settled: { label: 'finance.status.partiallySettled', variant: 'brand' },
  settled: { label: 'finance.status.settled', variant: 'positive' },
  overdue: { label: 'finance.status.overdue', variant: 'danger' },
  disputed: { label: 'finance.status.disputed', variant: 'danger' },
  adjusted: { label: 'finance.status.adjusted', variant: 'warning' },
  written_off: { label: 'finance.status.writtenOff', variant: 'neutral' },
};

export function obligationStatusBadge(status: ObligationStatus) {
  return STATUS_BADGE[status];
}

/**
 * Sums in the reporting currency, skipping records that have no converted
 * amount rather than adding unlike currencies (§12.3). Callers get the count
 * of skipped records so the UI can disclose incomplete totals.
 */
export function sumInReportingCurrency(
  obligations: readonly FinanceObligation[],
  reportingCurrency: string,
  pick: (o: FinanceObligation) => number | undefined,
): { total: number; unconverted: number } {
  let total = 0;
  let unconverted = 0;

  for (const o of obligations) {
    const raw = pick(o);
    if (raw == null) continue;

    if (o.originalCurrency === reportingCurrency) {
      total += raw;
    } else if (o.exchangeRate != null) {
      total += raw * o.exchangeRate;
    } else {
      unconverted += 1;
    }
  }

  return { total, unconverted };
}

export type FinanceStage = {
  key: string;
  labelKey: string;
  count: number;
  amount: number;
};

/**
 * Finance Pipeline stages (§7.14). Pending booking value is forecast and is
 * deliberately kept separate from confirmed obligations (§12.4).
 */
export function buildFinanceStages(
  obligations: readonly FinanceObligation[],
  reportingCurrency: string,
  pendingBookingValue: number,
  pendingBookingCount: number,
): FinanceStage[] {
  const confirmed = obligations.filter((o) => o.status !== 'written_off');
  const outstanding = (o: FinanceObligation) => o.remainingBalance > 0;

  const collect = confirmed.filter((o) => o.type === 'to_collect' && outstanding(o));
  const pay = confirmed.filter((o) => o.type === 'to_pay' && outstanding(o));
  const settled = confirmed.filter((o) => o.status === 'settled');

  const sum = (list: readonly FinanceObligation[], pick: (o: FinanceObligation) => number | undefined) =>
    sumInReportingCurrency(list, reportingCurrency, pick).total;

  return [
    {
      key: 'pending',
      labelKey: 'pipeline.pendingValue',
      count: pendingBookingCount,
      amount: pendingBookingValue,
    },
    {
      key: 'confirmed',
      labelKey: 'pipeline.confirmedRevenue',
      count: confirmed.filter((o) => o.type === 'to_collect').length,
      amount: sum(confirmed.filter((o) => o.type === 'to_collect'), (o) => o.grossAmount),
    },
    {
      key: 'collect',
      labelKey: 'finance.toCollect',
      count: collect.length,
      amount: sum(collect, (o) => o.remainingBalance),
    },
    {
      key: 'pay',
      labelKey: 'finance.toPay',
      count: pay.length,
      amount: sum(pay, (o) => o.remainingBalance),
    },
    {
      key: 'settled',
      labelKey: 'pipeline.settled',
      count: settled.length,
      amount: sum(settled, (o) => o.settledAmount),
    },
  ];
}

/** Days until due; negative when overdue. */
export function daysUntilDue(dueDate: string, businessDate: string): number {
  const ms =
    new Date(`${dueDate}T00:00:00Z`).getTime() - new Date(`${businessDate}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000);
}

/** Outstanding first, then most overdue, then largest balance (§7.14 To Collect ordering). */
export function byDueThenSeverity(businessDate: string) {
  return (a: FinanceObligation, b: FinanceObligation) => {
    const ad = daysUntilDue(a.dueDate, businessDate);
    const bd = daysUntilDue(b.dueDate, businessDate);
    if (ad !== bd) return ad - bd;
    return b.remainingBalance - a.remainingBalance;
  };
}

/**
 * Which settlement actions are permitted for an obligation (§12.1).
 * CrossBo never moves money: these record external evidence only.
 */
export type SettlementAction = 'approve' | 'mark_collected' | 'mark_paid' | 'reverse';

export function availableActions(o: FinanceObligation): SettlementAction[] {
  if (o.status === 'written_off') return [];
  if (o.status === 'settled') return ['reverse'];

  const actions: SettlementAction[] = [];
  if (o.status === 'pending') actions.push('approve');
  if (o.status === 'approved' || o.status === 'partially_settled' || o.status === 'overdue') {
    actions.push(o.type === 'to_collect' ? 'mark_collected' : 'mark_paid');
  }
  if (o.settledAmount > 0) actions.push('reverse');
  return actions;
}

/** Settlement history for one obligation, newest first. */
export function settlementsFor(
  obligationId: string,
  settlements: readonly SettlementRecord[],
): SettlementRecord[] {
  return settlements
    .filter((s) => s.obligationId === obligationId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}
