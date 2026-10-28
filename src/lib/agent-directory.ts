/**
 * Presentation logic for the Agents workspace. Framework-free: no react-native
 * or expo imports, so it stays unit-testable in plain Node.
 */

import type {
  Agency,
  Agent,
  AgentBookingOverview,
  BookingRequest,
  BookingState,
  PeriodMetric,
} from './types';
import { nightsBetween } from './booking-view';

/** Bookings that are finished or never happened. */
const CLOSED_STATES: readonly BookingState[] = ['CheckedOut', 'Cancelled', 'NoShow', 'Rejected'];
/** Bookings that never produced revenue. */
const NO_REVENUE_STATES: readonly BookingState[] = ['Draft', 'Cancelled', 'Rejected'];

export function isActiveBooking(b: BookingRequest): boolean {
  return b.state !== 'Draft' && !CLOSED_STATES.includes(b.state);
}

// ── Directory rows ──────────────────────────────────────────────────────────

export type DirectoryRow = {
  /** Agency id, or the agent id for an independent agent — both open a profile. */
  id: string;
  kind: 'agency' | 'agent';
  name: string;
  /** Primary contact: the agency's first agent, or blank for independents. */
  contactName?: string;
  activeBookings: number;
  inactiveBookings: number;
  revenue: number;
  /** Every agent name under this row, for search. */
  memberNames: readonly string[];
};

const fullName = (a: Agent) => `${a.firstName} ${a.lastName}`;

/** One row per agency, plus one per independent agent, highest revenue first. */
export function buildDirectoryRows(
  agencies: readonly Agency[],
  agents: readonly Agent[],
  bookings: readonly BookingRequest[],
): DirectoryRow[] {
  const summarise = (agentIds: readonly string[]) => {
    const own = bookings.filter((b) => b.agentId && agentIds.includes(b.agentId));
    return {
      activeBookings: own.filter(isActiveBooking).length,
      inactiveBookings: own.filter((b) => CLOSED_STATES.includes(b.state)).length,
      revenue: own
        .filter((b) => !NO_REVENUE_STATES.includes(b.state))
        .reduce((sum, b) => sum + b.totalAmount, 0),
    };
  };

  const agencyRows: DirectoryRow[] = agencies.map((agency) => {
    const members = agents.filter((a) => a.agencyId === agency.id);
    return {
      id: agency.id,
      kind: 'agency',
      name: agency.name,
      contactName: members[0] ? fullName(members[0]) : undefined,
      memberNames: members.map(fullName),
      ...summarise(members.map((m) => m.id)),
    };
  });

  const independentRows: DirectoryRow[] = agents
    .filter((a) => !a.agencyId)
    .map((a) => ({
      id: a.id,
      kind: 'agent',
      name: fullName(a),
      memberNames: [fullName(a)],
      ...summarise([a.id]),
    }));

  return [...agencyRows, ...independentRows].sort((a, b) => b.revenue - a.revenue);
}

export type DirectoryFilter = 'all' | 'active' | 'inactive';

export function filterDirectoryRows(
  rows: readonly DirectoryRow[],
  filter: DirectoryFilter,
  query: string,
): DirectoryRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((r) => {
    if (filter === 'active' && r.activeBookings === 0) return false;
    if (filter === 'inactive' && r.activeBookings > 0) return false;
    if (!q) return true;
    return [r.name, ...r.memberNames].some((n) => n.toLowerCase().includes(q));
  });
}

// ── Booking overview ────────────────────────────────────────────────────────

/** Figures for the previous period, which the backend supplies from history. */
export type PriorPeriodStats = {
  activeAgents: number;
  averageBookingValue: number;
  averageStayNights: number;
  agentBookings: number;
};

/** Current-period figures from bookings made in `period`, paired with the prior period. */
export function buildAgentBookingOverview(
  period: string,
  currency: string,
  agencies: readonly Agency[],
  agents: readonly Agent[],
  bookings: readonly BookingRequest[],
  prior: PriorPeriodStats,
): AgentBookingOverview {
  const inPeriod = bookings.filter(
    (b) => b.agentId && b.createdAt.startsWith(period) && !NO_REVENUE_STATES.includes(b.state),
  );
  const count = inPeriod.length;
  const average = (pick: (b: BookingRequest) => number) =>
    count > 0 ? inPeriod.reduce((sum, b) => sum + pick(b), 0) / count : 0;

  const bySource = new Map<string, { id: string; name: string; count: number }>();
  for (const b of inPeriod) {
    const agent = agents.find((a) => a.id === b.agentId);
    const agency = agent?.agencyId ? agencies.find((x) => x.id === agent.agencyId) : undefined;
    const id = agency?.id ?? agent?.id ?? 'unknown';
    const name = agency?.name ?? (agent ? fullName(agent) : id);
    const entry = bySource.get(id) ?? { id, name, count: 0 };
    entry.count += 1;
    bySource.set(id, entry);
  }

  const metric = (current: number, previous: number): PeriodMetric => ({ current, previous });

  return {
    period,
    currency,
    activeAgents: metric(new Set(inPeriod.map((b) => b.agentId)).size, prior.activeAgents),
    averageBookingValue: metric(Math.round(average((b) => b.totalAmount)), prior.averageBookingValue),
    averageStayNights: metric(
      Math.round(average((b) => nightsBetween(b.checkIn, b.checkOut)) * 10) / 10,
      prior.averageStayNights,
    ),
    agentBookings: metric(count, prior.agentBookings),
    bookingsBySource: [...bySource.values()].sort((a, b) => b.count - a.count),
  };
}

/**
 * Bar geometry for a current-vs-previous metric: both values on a shared scale
 * with headroom, so neither the fill nor the marker hits the end of the track.
 */
export function comparisonBar(metric: PeriodMetric): { fill: number; marker: number } {
  const scale = Math.max(metric.current, metric.previous, 1) * 1.1;
  return { fill: metric.current / scale, marker: metric.previous / scale };
}

/** Whole-percent change from the previous period; undefined when there's no baseline. */
export function percentChange(metric: PeriodMetric): number | undefined {
  if (metric.previous <= 0) return undefined;
  return Math.round(((metric.current - metric.previous) / metric.previous) * 100);
}

/** The top `limit` sources, with everything else rolled into one count. */
export function topSources(
  sources: AgentBookingOverview['bookingsBySource'],
  limit: number,
): { top: AgentBookingOverview['bookingsBySource']; othersCount: number } {
  return {
    top: sources.slice(0, limit),
    othersCount: sources.slice(limit).reduce((sum, s) => sum + s.count, 0),
  };
}
