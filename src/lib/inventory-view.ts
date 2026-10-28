/**
 * Presentation logic for the Inventory workspace. Framework-free: no
 * react-native or expo imports, so it stays unit-testable in plain Node.
 */

import type {
  BookingRequest,
  HotelExperience,
  OccupancySummary,
  PhysicalRoom,
  RateCode,
  RoomCategory,
  RoomType,
} from './types';
import type { RateTagTone } from './room-detail';
import { nightlyRateFor } from './room-detail';
import { EXTRA_ADULT_RATE, EXTRA_CHILD_RATE, GROUP_RATE_FACTOR } from './rate-quote';
import { nightsBetween } from './booking-view';

// ── Room type rows ──────────────────────────────────────────────────────────

/** Sellable rooms at or below this count are flagged as nearly gone. */
export const LOW_AVAILABILITY = 1;

export type AvailabilityChip = {
  labelKey: string;
  params?: Record<string, number>;
  tone: RateTagTone | 'brand' | 'muted';
};

export type RoomTypeRow = {
  id: string;
  name: string;
  category: RoomCategory;
  sleeps: number;
  rooms: number;
  sellable: number;
  soldOut: boolean;
  fromPrice: number;
  currency: string;
  chips: AvailabilityChip[];
};

export function availabilityChips(summary: OccupancySummary | undefined): AvailabilityChip[] {
  const sellable = summary?.sellable ?? 0;
  const outOfOrder = (summary?.outOfOrder ?? 0) + (summary?.outOfService ?? 0);
  const chips: AvailabilityChip[] = [];
  if (sellable === 0) chips.push({ labelKey: 'inventory.page.soldOut', tone: 'muted' });
  else if (sellable <= LOW_AVAILABILITY) {
    chips.push({ labelKey: 'inventory.page.left', params: { count: sellable }, tone: 'caution' });
  } else {
    chips.push({ labelKey: 'inventory.page.available', params: { count: sellable }, tone: 'brand' });
  }
  if (outOfOrder > 0) {
    chips.push({ labelKey: 'inventory.page.outOfOrder', params: { count: outOfOrder }, tone: 'muted' });
  }
  return chips;
}

export function buildRoomTypeRows(
  roomTypes: readonly RoomType[],
  summaries: readonly OccupancySummary[],
  physicalRooms: readonly PhysicalRoom[],
): RoomTypeRow[] {
  return roomTypes.map((rt) => {
    const summary = summaries.find((s) => s.roomTypeId === rt.id);
    const sellable = summary?.sellable ?? 0;
    return {
      id: rt.id,
      name: rt.name,
      category: rt.category,
      sleeps: rt.maxOccupancy,
      rooms: summary?.totalRooms ?? physicalRooms.filter((r) => r.roomTypeId === rt.id).length,
      sellable,
      soldOut: sellable === 0,
      fromPrice: rt.basePrice,
      currency: rt.currency,
      chips: availabilityChips(summary),
    };
  });
}

export type InventoryFilter = 'all' | 'available' | 'unavailable';

export function filterRoomTypeRows(
  rows: readonly RoomTypeRow[],
  filter: InventoryFilter,
  query: string,
): RoomTypeRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((r) => {
    if (filter === 'available' && r.soldOut) return false;
    if (filter === 'unavailable' && !r.soldOut) return false;
    return !q || r.name.toLowerCase().includes(q);
  });
}

// ── Occupancy by room type ──────────────────────────────────────────────────

export type OccupancyRow = {
  key: string;
  name: string;
  occupied: number;
  total: number;
  /** 0–1 */
  fraction: number;
};

const fractionOf = (occupied: number, total: number) => (total > 0 ? occupied / total : 0);

/** Tonight's occupancy: overall, the largest room types, and the rest as "Other". */
export function occupancyByRoomType(
  summaries: readonly OccupancySummary[],
  roomTypes: readonly RoomType[],
  limit = 4,
): { occupied: number; total: number; fraction: number; rows: OccupancyRow[]; other?: OccupancyRow } {
  const rows = summaries
    .map((s) => ({
      key: s.roomTypeId,
      name: roomTypes.find((rt) => rt.id === s.roomTypeId)?.name ?? s.roomTypeId,
      occupied: s.occupied,
      total: s.totalRooms,
      fraction: fractionOf(s.occupied, s.totalRooms),
    }))
    .sort((a, b) => b.total - a.total);

  const occupied = rows.reduce((sum, r) => sum + r.occupied, 0);
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  const rest = rows.slice(limit);
  const restOccupied = rest.reduce((sum, r) => sum + r.occupied, 0);
  const restTotal = rest.reduce((sum, r) => sum + r.total, 0);

  return {
    occupied,
    total,
    fraction: fractionOf(occupied, total),
    rows: rows.slice(0, limit),
    other:
      rest.length > 0
        ? { key: 'other', name: '', occupied: restOccupied, total: restTotal, fraction: fractionOf(restOccupied, restTotal) }
        : undefined,
  };
}

// ── Rate matrix ─────────────────────────────────────────────────────────────

export type RateMatrixRow = {
  roomTypeId: string;
  name: string;
  twoAdults: number;
  extraAdult: number;
  extraChild: number;
  group: number;
};

/** One rate code priced for every room type, most expensive first. */
export function buildRateMatrix(rate: RateCode, roomTypes: readonly RoomType[]): RateMatrixRow[] {
  return roomTypes
    .map((rt) => {
      const base = nightlyRateFor(rate, rt);
      return {
        roomTypeId: rt.id,
        name: rt.name,
        twoAdults: base,
        extraAdult: base * EXTRA_ADULT_RATE,
        extraChild: base * EXTRA_CHILD_RATE,
        group: base * GROUP_RATE_FACTOR,
      };
    })
    .sort((a, b) => b.twoAdults - a.twoAdults);
}

// ── Experiences ─────────────────────────────────────────────────────────────

/** '07:00' slots and '12:00–23:00' ranges, joined for display: '07:00 & 08:00'. */
export function formatExperienceHours(schedule: HotelExperience['schedule']): string {
  return schedule.slots
    .map((s) => (s.closes ? `${s.opens}–${s.closes}` : s.opens))
    .join(' & ');
}

// ── Portfolio snapshot & breakdown ──────────────────────────────────────────

export type RoomStatusCounts = { occupied: number; available: number; outOfOrder: number; total: number };

const countsOf = (s: OccupancySummary): RoomStatusCounts => ({
  occupied: s.occupied,
  available: s.sellable,
  outOfOrder: s.outOfOrder + s.outOfService,
  total: s.totalRooms,
});

/** Property-wide room status tonight, summed across room types. */
export function portfolioSnapshot(summaries: readonly OccupancySummary[]): RoomStatusCounts {
  return summaries.map(countsOf).reduce(
    (acc, c) => ({
      occupied: acc.occupied + c.occupied,
      available: acc.available + c.available,
      outOfOrder: acc.outOfOrder + c.outOfOrder,
      total: acc.total + c.total,
    }),
    { occupied: 0, available: 0, outOfOrder: 0, total: 0 },
  );
}

/** Per-room-type status, largest inventory first. */
export function roomTypeBreakdown(
  summaries: readonly OccupancySummary[],
  roomTypes: readonly RoomType[],
): (RoomStatusCounts & { roomTypeId: string; name: string })[] {
  return summaries
    .map((s) => ({
      roomTypeId: s.roomTypeId,
      name: roomTypes.find((rt) => rt.id === s.roomTypeId)?.name ?? s.roomTypeId,
      ...countsOf(s),
    }))
    .sort((a, b) => b.total - a.total);
}

// ── Tonight's KPIs ──────────────────────────────────────────────────────────

/** Bookings that don't hold a room tonight whatever their dates say. */
const NOT_IN_HOUSE: readonly BookingRequest['state'][] = ['Draft', 'Rejected', 'Cancelled', 'NoShow'];

export type TonightKpis = {
  /** Average daily rate across stays in house tonight. */
  adr: number;
  /** Revenue per available room: ADR × occupancy. */
  revpar: number;
  arrivals: number;
  departures: number;
};

export function tonightKpis(
  bookings: readonly BookingRequest[],
  date: string,
  occupancyFraction: number,
): TonightKpis {
  const live = bookings.filter((b) => !NOT_IN_HOUSE.includes(b.state));
  const inHouse = live.filter((b) => b.checkIn <= date && date < b.checkOut);
  const nightly = inHouse.map((b) => b.totalAmount / Math.max(nightsBetween(b.checkIn, b.checkOut), 1));
  const adr = nightly.length > 0 ? nightly.reduce((s, n) => s + n, 0) / nightly.length : 0;
  return {
    adr,
    revpar: adr * occupancyFraction,
    arrivals: live.filter((b) => b.checkIn === date).length,
    departures: live.filter((b) => b.checkOut === date).length,
  };
}
