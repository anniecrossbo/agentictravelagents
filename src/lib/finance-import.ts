/**
 * Reconciliation import validation (PRD v6 §7.15.3).
 * Framework-free. Nothing here commits anything: it classifies rows so the
 * preview can separate valid, invalid and duplicate before confirmation.
 */

import type { FinanceObligation, SettlementRecord } from './types';

export type ImportRow = {
  lineNumber: number;
  /** Obligation reference as written in the file. */
  reference: string;
  amount: number;
  currency: string;
  date: string;
  counterparty: string;
};

export type RowVerdict = 'valid' | 'invalid' | 'duplicate';

export type ClassifiedRow = ImportRow & {
  verdict: RowVerdict;
  /** i18n key explaining an invalid or duplicate verdict. */
  reasonKey?: string;
  obligationId?: string;
};

export type ImportSummary = {
  rows: ClassifiedRow[];
  valid: number;
  invalid: number;
  duplicate: number;
  /** Totals per currency — unlike currencies are never combined (§12.3). */
  totalsByCurrency: { currency: string; amount: number; count: number }[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function classifyImport(
  rows: readonly ImportRow[],
  obligations: readonly FinanceObligation[],
  settlements: readonly SettlementRecord[],
): ImportSummary {
  const byRef = new Map(obligations.map((o) => [o.humanId.toUpperCase(), o]));

  const classified: ClassifiedRow[] = rows.map((row) => {
    const obligation = byRef.get(row.reference.trim().toUpperCase());

    if (!obligation) {
      return { ...row, verdict: 'invalid', reasonKey: 'finance.import.unknownReference' };
    }
    if (!Number.isFinite(row.amount) || row.amount <= 0) {
      return { ...row, verdict: 'invalid', reasonKey: 'finance.import.badAmount', obligationId: obligation.id };
    }
    if (!ISO_DATE.test(row.date)) {
      return { ...row, verdict: 'invalid', reasonKey: 'finance.import.badDate', obligationId: obligation.id };
    }
    if (row.currency !== obligation.originalCurrency) {
      return { ...row, verdict: 'invalid', reasonKey: 'finance.import.currencyMismatch', obligationId: obligation.id };
    }
    if (row.amount > obligation.remainingBalance) {
      return { ...row, verdict: 'invalid', reasonKey: 'finance.import.exceedsBalance', obligationId: obligation.id };
    }

    const alreadyRecorded = settlements.some(
      (s) => s.obligationId === obligation.id && s.amount === row.amount && s.date === row.date,
    );
    if (alreadyRecorded) {
      return { ...row, verdict: 'duplicate', reasonKey: 'finance.import.alreadyRecorded', obligationId: obligation.id };
    }

    return { ...row, verdict: 'valid', obligationId: obligation.id };
  });

  const totals = new Map<string, { amount: number; count: number }>();
  for (const r of classified) {
    if (r.verdict !== 'valid') continue;
    const entry = totals.get(r.currency) ?? { amount: 0, count: 0 };
    entry.amount += r.amount;
    entry.count += 1;
    totals.set(r.currency, entry);
  }

  return {
    rows: classified,
    valid: classified.filter((r) => r.verdict === 'valid').length,
    invalid: classified.filter((r) => r.verdict === 'invalid').length,
    duplicate: classified.filter((r) => r.verdict === 'duplicate').length,
    totalsByCurrency: [...totals.entries()]
      .map(([currency, v]) => ({ currency, ...v }))
      .sort((a, b) => b.amount - a.amount),
  };
}

// ── Export scope (§7.14 Export Builder) ─────────────────────────────────────

export type ExportField =
  | 'humanId'
  | 'counterparty'
  | 'type'
  | 'status'
  | 'grossAmount'
  | 'commissionAmount'
  | 'remainingBalance'
  | 'dueDate'
  | 'currency';

export const EXPORT_FIELDS: { key: ExportField; labelKey: string }[] = [
  { key: 'humanId', labelKey: 'finance.obligationId' },
  { key: 'counterparty', labelKey: 'finance.counterparty' },
  { key: 'type', labelKey: 'finance.typeLabel' },
  { key: 'status', labelKey: 'common.status' },
  { key: 'grossAmount', labelKey: 'finance.grossValue' },
  { key: 'commissionAmount', labelKey: 'finance.commission' },
  { key: 'remainingBalance', labelKey: 'finance.remainingBalance' },
  { key: 'dueDate', labelKey: 'finance.dueDate' },
  { key: 'currency', labelKey: 'common.currency' },
];

export type CurrencyRepresentation = 'original' | 'reporting';
export type ExportFormat = 'csv' | 'xlsx';
