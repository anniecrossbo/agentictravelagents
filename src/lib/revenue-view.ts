/**
 * Presentation logic for the Revenue Manager dashboard. Framework-free: no
 * react-native or expo imports, so it stays unit-testable in plain Node.
 */

import type { BookingRequest, FinanceObligation, PeriodMetric, SettlementRecord } from './types';
import { daysBetween } from './dates';
import { daysUntilDue, sumInReportingCurrency } from './finance-view';

const CLOSED: readonly FinanceObligation['status'][] = ['settled', 'written_off'];

const isOpen = (o: FinanceObligation) => !CLOSED.includes(o.status) && o.remainingBalance > 0;

// ── Payout / collect lists ──────────────────────────────────────────────────

/** Open obligations of one direction, soonest due first. */
export function openObligations(
  obligations: readonly FinanceObligation[],
  type: FinanceObligation['type'],
): FinanceObligation[] {
  return obligations
    .filter((o) => o.type === type && isOpen(o))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

// ── Due chips ───────────────────────────────────────────────────────────────

export type DueChip = {
  labelKey: string;
  params?: Record<string, number>;
  tone: 'neutral' | 'caution' | 'danger';
};

/** Days ahead at which a due date turns amber. */
const DUE_SOON_DAYS = 3;

export function dueChip(dueDate: string, businessDate: string): DueChip {
  const days = daysUntilDue(dueDate, businessDate);
  if (days < 0) return { labelKey: 'revenue.chip.overdue', tone: 'danger' };
  if (days === 0) return { labelKey: 'revenue.chip.today', tone: 'caution' };
  if (days === 1) return { labelKey: 'revenue.chip.tomorrow', tone: 'caution' };
  if (days <= DUE_SOON_DAYS) return { labelKey: 'revenue.chip.dueIn', params: { count: days }, tone: 'caution' };
  return { labelKey: 'revenue.chip.inDays', params: { count: days }, tone: 'neutral' };
}

// ── Revenue pipeline ────────────────────────────────────────────────────────

export type RevenueStageKey = 'quoted' | 'depositDue' | 'balanceDue' | 'refundDue';

export type RevenueCard = {
  id: string;
  /** Booking the card opens. */
  bookingId: string;
  amount: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  chip?: DueChip;
};

export type RevenueStage = {
  key: RevenueStageKey;
  total: number;
  cards: RevenueCard[];
  /** Stage-specific callout, e.g. the overdue share of deposits. */
  note?: { labelKey: string; amount?: number; tone: 'neutral' | 'caution' | 'danger' };
};

/** Bookings still at quote stage: nothing owed yet, waiting on the guest or agent. */
const QUOTED_STATES: readonly BookingRequest['state'][] = ['Draft', 'Submitted', 'Resubmitted', 'ChangesRequested'];

/**
 * Money moving through the booking lifecycle: quotes, deposits and balances
 * to collect, and refunds owed back. Totals are in the reporting currency.
 */
export function buildRevenuePipeline(
  bookings: readonly BookingRequest[],
  obligations: readonly FinanceObligation[],
  businessDate: string,
  reportingCurrency: string,
): RevenueStage[] {
  const bookingOf = (id: string) => bookings.find((b) => b.id === id);
  const sum = (list: readonly FinanceObligation[], pick: (o: FinanceObligation) => number) =>
    sumInReportingCurrency(list, reportingCurrency, pick).total;
  const card = (o: FinanceObligation, withChip: boolean): RevenueCard | undefined => {
    const b = bookingOf(o.bookingId);
    if (!b) return undefined;
    return {
      id: o.id,
      bookingId: b.id,
      amount: o.remainingBalance,
      currency: o.originalCurrency,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      chip: withChip ? dueChip(o.dueDate, businessDate) : { labelKey: 'revenue.chip.pending', tone: 'neutral' },
    };
  };
  const cards = (list: readonly FinanceObligation[], withChip = true) =>
    list.map((o) => card(o, withChip)).filter((c): c is RevenueCard => Boolean(c));

  const owedToHotel = obligations.filter((o) => o.type === 'to_collect' && isOpen(o) && o.status !== 'disputed');
  const deposits = owedToHotel.filter((o) => o.settledAmount === 0);
  const balances = owedToHotel.filter((o) => o.settledAmount > 0);
  const refunds = obligations.filter((o) => o.type === 'to_pay' && o.counterpartyType === 'guest' && isOpen(o));
  const withObligation = new Set(obligations.map((o) => o.bookingId));
  const quotes = bookings.filter((b) => QUOTED_STATES.includes(b.state) && !withObligation.has(b.id));

  const overdueDeposits = deposits.filter((o) => daysUntilDue(o.dueDate, businessDate) < 0);
  const balancesThisWeek = balances.filter((o) => {
    const d = daysUntilDue(o.dueDate, businessDate);
    return d >= 0 && d <= 7;
  });

  return [
    {
      key: 'quoted',
      total: quotes.reduce((s, b) => s + b.totalAmount, 0),
      cards: quotes.map((b) => ({
        id: b.id,
        bookingId: b.id,
        amount: b.totalAmount,
        currency: b.currency,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
      })),
      note: { labelKey: 'revenue.note.awaitingReply', tone: 'neutral' },
    },
    {
      key: 'depositDue',
      total: sum(deposits, (o) => o.remainingBalance),
      cards: cards(deposits),
      note:
        overdueDeposits.length > 0
          ? { labelKey: 'revenue.note.overdue', amount: sum(overdueDeposits, (o) => o.remainingBalance), tone: 'danger' }
          : undefined,
    },
    {
      key: 'balanceDue',
      total: sum(balances, (o) => o.remainingBalance),
      cards: cards(balances),
      note:
        balancesThisWeek.length > 0
          ? { labelKey: 'revenue.note.dueThisWeek', amount: sum(balancesThisWeek, (o) => o.remainingBalance), tone: 'caution' }
          : undefined,
    },
    {
      key: 'refundDue',
      total: sum(refunds, (o) => o.remainingBalance),
      cards: cards(refunds, false),
      note: { labelKey: 'revenue.note.owedToGuests', tone: 'neutral' },
    },
  ];
}

/** Headline collection figures across all open receivables. */
export function collectionSummary(
  obligations: readonly FinanceObligation[],
  businessDate: string,
  reportingCurrency: string,
): { toCollect: number; dueThisWeek: { amount: number; count: number }; overdue: { amount: number; count: number } } {
  const open = obligations.filter((o) => o.type === 'to_collect' && isOpen(o));
  const sum = (list: readonly FinanceObligation[]) =>
    sumInReportingCurrency(list, reportingCurrency, (o) => o.remainingBalance).total;
  const dueWeek = open.filter((o) => {
    const d = daysUntilDue(o.dueDate, businessDate);
    return d >= 0 && d <= 7;
  });
  const overdue = open.filter((o) => daysUntilDue(o.dueDate, businessDate) < 0);
  return {
    toCollect: sum(open),
    dueThisWeek: { amount: sum(dueWeek), count: dueWeek.length },
    overdue: { amount: sum(overdue), count: overdue.length },
  };
}

// ── Recent payments ─────────────────────────────────────────────────────────

export type RecentPayment = {
  settlement: SettlementRecord;
  obligation: FinanceObligation;
  /** First money on an obligation is the deposit; anything after is balance. */
  kind: 'deposit' | 'balance';
};

/** Days in the rolling "recent" window. */
export const RECENT_WINDOW_DAYS = 7;

/** Collections received in the last week, newest first, with the week before for comparison. */
export function recentPayments(
  settlements: readonly SettlementRecord[],
  obligations: readonly FinanceObligation[],
  businessDate: string,
): { payments: RecentPayment[]; total: number; previousTotal: number } {
  const collections = settlements.filter((s) => s.type === 'collection');
  const age = (s: SettlementRecord) => daysBetween(s.date, businessDate);
  const inWindow = (s: SettlementRecord, from: number) => age(s) >= from && age(s) < from + RECENT_WINDOW_DAYS;

  const payments = collections
    .filter((s) => inWindow(s, 0))
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    .map((s) => {
      const obligation = obligations.find((o) => o.id === s.obligationId);
      if (!obligation) return undefined;
      const earlier = collections.some((x) => x.obligationId === s.obligationId && x.recordedAt < s.recordedAt);
      return { settlement: s, obligation, kind: earlier ? 'balance' : 'deposit' } as RecentPayment;
    })
    .filter((p): p is RecentPayment => Boolean(p));

  return {
    payments,
    total: payments.reduce((sum, p) => sum + p.settlement.amount, 0),
    previousTotal: collections.filter((s) => inWindow(s, RECENT_WINDOW_DAYS)).reduce((sum, s) => sum + s.amount, 0),
  };
}

// ── Agent revenue & commission ──────────────────────────────────────────────

const byAgent = (b: BookingRequest) => Boolean(b.agentId) && !['Draft', 'Rejected', 'Cancelled'].includes(b.state);

/** Revenue from agent bookings made this month, and the commission booked against it. */
export function agentRevenueThisMonth(
  bookings: readonly BookingRequest[],
  obligations: readonly FinanceObligation[],
  businessDate: string,
): { revenue: number; commission: number; dailyRevenue: number[]; dailyCommission: number[] } {
  const period = businessDate.slice(0, 7);
  const days = Number(businessDate.slice(8, 10));
  const revenue = Array.from({ length: days }, () => 0);
  const commission = Array.from({ length: days }, () => 0);

  for (const b of bookings) {
    if (!byAgent(b) || !b.createdAt.startsWith(period)) continue;
    const day = Number(b.createdAt.slice(8, 10));
    if (day < 1 || day > days) continue;
    revenue[day - 1]! += b.totalAmount;
    commission[day - 1]! += obligations
      .filter((o) => o.bookingId === b.id)
      .reduce((s, o) => s + (o.commissionAmount ?? 0), 0);
  }

  let r = 0;
  let c = 0;
  const dailyRevenue = revenue.map((v) => (r += v));
  const dailyCommission = commission.map((v) => (c += v));
  return { revenue: r, commission: c, dailyRevenue, dailyCommission };
}

/** Current month against the one before, from the monthly history. */
export function lastTwoMonths(history: readonly { month: string; revenue: number }[]): PeriodMetric {
  return {
    current: history[history.length - 1]?.revenue ?? 0,
    previous: history[history.length - 2]?.revenue ?? 0,
  };
}
