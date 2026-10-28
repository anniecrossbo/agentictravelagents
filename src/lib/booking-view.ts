/**
 * Presentation logic for bookings. Framework-free so it stays unit-testable
 * and can be reused by any surface.
 */

import type { BookingRequest, BookingState, FinanceObligation, Message, MessageChannel } from './types';

type BadgeVariant = 'brand' | 'positive' | 'warning' | 'danger' | 'neutral';

const STATE_BADGE: Record<BookingState, { label: string; variant: BadgeVariant }> = {
  Draft: { label: 'booking.state.draft', variant: 'neutral' },
  Submitted: { label: 'booking.state.approvalNeeded', variant: 'warning' },
  ChangesRequested: { label: 'booking.state.changesRequested', variant: 'warning' },
  Resubmitted: { label: 'booking.state.resubmitted', variant: 'brand' },
  ValidationInProgress: { label: 'booking.state.validationInProgress', variant: 'brand' },
  ApprovalBlocked: { label: 'booking.state.approvalBlocked', variant: 'danger' },
  OperaCreationInProgress: { label: 'booking.state.operaCreationInProgress', variant: 'brand' },
  OperaCreationFailed: { label: 'booking.state.operaCreationFailed', variant: 'danger' },
  Confirmed: { label: 'booking.state.confirmed', variant: 'positive' },
  ModificationPending: { label: 'booking.state.modificationPending', variant: 'warning' },
  CheckedIn: { label: 'booking.state.checkedIn', variant: 'positive' },
  CheckedOut: { label: 'booking.state.checkedOut', variant: 'neutral' },
  Rejected: { label: 'booking.state.rejected', variant: 'danger' },
  Cancelled: { label: 'booking.state.cancelled', variant: 'neutral' },
  NoShow: { label: 'booking.state.noShow', variant: 'danger' },
};

export function bookingStateBadge(state: BookingState): { label: string; variant: BadgeVariant } {
  return STATE_BADGE[state];
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(`${checkOut}T00:00:00Z`).getTime() - new Date(`${checkIn}T00:00:00Z`).getTime();
  return Math.max(Math.round(ms / 86_400_000), 0);
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SGD: 'S$',
  AED: 'AED ',
};

export function formatMoney(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}

// ── Detail view ─────────────────────────────────────────────────────────────

/** States where the booking is waiting on a hotel decision. */
export function needsHotelReview(state: BookingState): boolean {
  return state === 'Submitted' || state === 'Resubmitted';
}

const TERMINAL_STATES: readonly BookingState[] = [
  'Rejected',
  'Cancelled',
  'CheckedOut',
  'NoShow',
];

export type TimelineEntry = {
  key: string;
  /** Completed history, or the step the booking is waiting on. */
  kind: 'done' | 'next';
  titleKey: string;
  /** ISO timestamp for completed entries. */
  at?: string;
  detailKey?: string;
  detailParams?: Record<string, string | number>;
};

/** Status history for a booking, ending with the step it's waiting on (if any). */
export function buildBookingTimeline(booking: BookingRequest): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    { key: 'submitted', kind: 'done', titleKey: 'booking.detail.timelineSubmitted', at: booking.createdAt },
  ];
  if (booking.reviewedAt) {
    entries.push({ key: 'reviewed', kind: 'done', titleKey: 'booking.review', at: booking.reviewedAt });
  }
  entries.push({
    key: 'updated',
    kind: 'done',
    titleKey: 'common.lastUpdated',
    at: booking.updatedAt,
    detailKey: 'booking.detail.timelineVersion',
    detailParams: { version: booking.currentVersion },
  });

  if (needsHotelReview(booking.state)) {
    entries.push({
      key: 'next',
      kind: 'next',
      titleKey: 'booking.detail.nextHotelReview',
      detailKey: 'booking.detail.nextHotelReviewDetail',
    });
  } else if (!booking.operaConfirmationId && !TERMINAL_STATES.includes(booking.state)) {
    entries.push({
      key: 'next',
      kind: 'next',
      titleKey: 'booking.detail.nextOpera',
      detailKey: 'booking.detail.nextOperaDetail',
    });
  }
  return entries;
}

export type BookingNote = {
  id: string;
  author: 'agent' | 'hotel';
  at: string;
  content: string;
  /** Absent for the note filed with the booking request itself. */
  channel?: MessageChannel;
};

/**
 * Agent ↔ hotel notes on a booking: the note filed with the request, then the
 * booking's conversation messages. Guest messages belong to the guest chat.
 */
export function bookingNotesFeed(
  booking: BookingRequest,
  messages: readonly Message[],
): BookingNote[] {
  const feed: BookingNote[] = [];
  if (booking.notes.trim()) {
    feed.push({ id: `${booking.id}-note`, author: 'agent', at: booking.createdAt, content: booking.notes });
  }
  for (const m of messages) {
    if (m.senderType !== 'agent' && m.senderType !== 'user') continue;
    feed.push({
      id: m.id,
      author: m.senderType === 'agent' ? 'agent' : 'hotel',
      at: m.sentAt,
      content: m.content,
      channel: m.channel,
    });
  }
  return feed.sort((a, b) => a.at.localeCompare(b.at));
}

// ── Pipeline cards ──────────────────────────────────────────────────────────

/** 3200 → '$3.2k'; under a thousand stays whole: '$900'. */
export function formatMoneyCompact(amount: number, currency: string): string {
  if (Math.abs(amount) < 1000) return formatMoney(amount, currency);
  const symbol = formatMoney(0, currency).replace(/0$/, '');
  const k = amount / 1000;
  return `${symbol}${k >= 10 ? Math.round(k) : Math.round(k * 10) / 10}k`;
}

export type PipelineChipTone = 'neutral' | 'caution' | 'positive' | 'danger';

/** What a pipeline card flags: payment state once money is owed; nothing before that. */
export function pipelineChip(
  receivable: FinanceObligation | undefined,
): { labelKey: string; tone: PipelineChipTone } | undefined {
  if (receivable) {
    switch (receivable.status) {
      case 'settled':
        return { labelKey: 'pipeline.chip.paid', tone: 'positive' };
      case 'partially_settled':
        return { labelKey: 'pipeline.chip.balanceDue', tone: 'caution' };
      case 'overdue':
        return { labelKey: 'pipeline.chip.overdue', tone: 'danger' };
      default:
        return { labelKey: 'pipeline.chip.due', tone: 'caution' };
    }
  }
  return undefined;
}

// ── Agency filter ───────────────────────────────────────────────────────────

/** 'all', an agency id, or 'independent' for agents with no agency. */
export type AgencyFilter = string;

export const INDEPENDENT = 'independent';

/** Filter values in cycling order: all, each agency, then independent agents. */
export function agencyFilterCycle(agencyIds: readonly string[]): AgencyFilter[] {
  return ['all', ...agencyIds, INDEPENDENT];
}

export function nextAgencyFilter(current: AgencyFilter, cycle: readonly AgencyFilter[]): AgencyFilter {
  return cycle[(cycle.indexOf(current) + 1) % cycle.length] ?? 'all';
}

export function filterByAgency(bookings: readonly BookingRequest[], filter: AgencyFilter): BookingRequest[] {
  if (filter === 'all') return [...bookings];
  if (filter === INDEPENDENT) return bookings.filter((b) => !b.agencyId);
  return bookings.filter((b) => b.agencyId === filter);
}
