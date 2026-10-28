/**
 * Presentation logic for the room type detail view. Framework-free: no
 * react-native or expo imports, so it stays unit-testable in plain Node.
 */

import type {
  Agency,
  Agent,
  OccupancySummary,
  RateAssignment,
  RateCode,
  RoomType,
} from './types';
import { EXTRA_ADULT_RATE, EXTRA_CHILD_RATE } from './rate-quote';

// ── Occupancy ───────────────────────────────────────────────────────────────

export type OccupancyStatus = 'occupied' | 'sellable' | 'onHold';

export type OccupancyBreakdown = {
  total: number;
  segments: readonly { status: OccupancyStatus; count: number }[];
};

/** Falls back to the physical room count when no snapshot exists for the type. */
export function occupancyBreakdown(
  summary: OccupancySummary | undefined,
  physicalRoomCount: number,
): OccupancyBreakdown {
  return {
    total: summary?.totalRooms ?? physicalRoomCount,
    segments: [
      { status: 'occupied', count: summary?.occupied ?? 0 },
      { status: 'sellable', count: summary?.sellable ?? 0 },
      { status: 'onHold', count: summary?.onHold ?? 0 },
    ],
  };
}

// ── Stay dates ──────────────────────────────────────────────────────────────

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** '2026-09-12', '2026-09-16' → 'Sep 12–16'; across months → 'Sep 30–Oct 3'. */
export function formatStayRange(checkIn: string, checkOut: string): string {
  const [, inMonth, inDay] = checkIn.split('-').map(Number);
  const [, outMonth, outDay] = checkOut.split('-').map(Number);
  if (!inMonth || !inDay || !outMonth || !outDay) return `${checkIn}–${checkOut}`;
  const start = `${SHORT_MONTHS[inMonth - 1]} ${inDay}`;
  const end = inMonth === outMonth ? `${outDay}` : `${SHORT_MONTHS[outMonth - 1]} ${outDay}`;
  return `${start}–${end}`;
}

// ── Rate cards ──────────────────────────────────────────────────────────────

export type RateTagTone = 'neutral' | 'danger' | 'info' | 'caution' | 'positive';

export type RateTag = {
  labelKey: string;
  params?: Record<string, string | number>;
  tone: RateTagTone;
};

export type RateCardDetail =
  | { kind: 'occupancy'; baseAdults: number; base: number; extraAdult: number; extraChild: number }
  | { kind: 'assigned'; names: readonly string[] }
  | { kind: 'none' };

export type RateCardView = {
  nightly: number;
  currency: string;
  detail: RateCardDetail;
  tags: readonly RateTag[];
};

/** Adults included in the nightly rate before supplements apply. */
const BASE_ADULTS = 2;

/** Rate codes store 0 when the price varies by room type; the room's base price applies. */
export function nightlyRateFor(rate: RateCode, roomType: RoomType): number {
  return rate.pricePerNight > 0 ? rate.pricePerNight : roomType.basePrice;
}

export function rateTags(rate: RateCode): RateTag[] {
  const tags: RateTag[] = [];
  if (rate.isDynamic) tags.push({ labelKey: 'inventory.rateCode.dynamic', tone: 'info' });
  else if (rate.isStatic) tags.push({ labelKey: 'inventory.rateCode.static', tone: 'neutral' });
  if (rate.isPublic) tags.push({ labelKey: 'inventory.rateCode.public', tone: 'neutral' });
  if (rate.isNet) tags.push({ labelKey: 'inventory.rateCode.net', tone: 'caution' });
  if (rate.isCommissionable && rate.commissionRate != null) {
    tags.push({
      labelKey: 'inventory.rateCode.commissionablePct',
      params: { pct: Math.round(rate.commissionRate * 100) },
      tone: 'positive',
    });
  } else if (!rate.isCommissionable) {
    tags.push({ labelKey: 'inventory.rateCode.nonCommissionable', tone: 'danger' });
  }
  return tags;
}

/** Names of the agencies and agents a rate code is assigned to, in assignment order. */
export function rateAssigneeNames(
  rateCodeId: string,
  assignments: readonly RateAssignment[],
  agencies: readonly Agency[],
  agents: readonly Agent[],
): string[] {
  return assignments
    .filter((a) => a.rateCodeId === rateCodeId)
    .map((a) => {
      if (a.assigneeType === 'agency') return agencies.find((x) => x.id === a.assigneeId)?.name;
      const agent = agents.find((x) => x.id === a.assigneeId);
      return agent ? `${agent.firstName} ${agent.lastName}` : undefined;
    })
    .filter((name): name is string => Boolean(name));
}

/**
 * Public rates advertise their occupancy pricing; private rates show who
 * they're assigned to instead.
 */
export function buildRateCardView(
  rate: RateCode,
  roomType: RoomType,
  assigneeNames: readonly string[],
): RateCardView {
  const nightly = nightlyRateFor(rate, roomType);

  let detail: RateCardDetail;
  if (rate.isPublic) {
    detail = {
      kind: 'occupancy',
      baseAdults: BASE_ADULTS,
      base: nightly,
      extraAdult: nightly * EXTRA_ADULT_RATE,
      extraChild: nightly * EXTRA_CHILD_RATE,
    };
  } else if (assigneeNames.length > 0) {
    detail = { kind: 'assigned', names: assigneeNames };
  } else {
    detail = { kind: 'none' };
  }

  return { nightly, currency: roomType.currency, detail, tags: rateTags(rate) };
}

// ── Search ──────────────────────────────────────────────────────────────────

/** Case-insensitive match of a query against any of the given fields. */
export function matchesQuery(query: string, fields: readonly (string | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => f?.toLowerCase().includes(q));
}
