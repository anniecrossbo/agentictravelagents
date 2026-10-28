/**
 * Booking statistics for the Bookings workspace. Framework-free and
 * unit-testable in plain Node.
 */

import type { BookingRequest, MonthlyBookingTrend, RoomType } from './types';
import { nightsBetween } from './booking-view';

const NOT_BOOKED: readonly BookingRequest['state'][] = ['Draft', 'Rejected', 'Cancelled'];
const CONFIRMED: readonly BookingRequest['state'][] = ['Confirmed', 'CheckedIn', 'CheckedOut', 'ModificationPending'];

const inMonth = (b: BookingRequest, period: string) => b.createdAt.startsWith(period);

/** Headline counts for bookings made in a month. */
export function monthSummary(
  bookings: readonly BookingRequest[],
  period: string,
): { bookings: number; roomNights: number; guests: number; averageStay: number } {
  const made = bookings.filter((b) => inMonth(b, period) && !NOT_BOOKED.includes(b.state));
  const roomNights = made.reduce((s, b) => s + nightsBetween(b.checkIn, b.checkOut), 0);
  return {
    bookings: made.length,
    roomNights,
    guests: made.reduce((s, b) => s + b.adults + b.children, 0),
    averageStay: made.length > 0 ? Math.round((roomNights / made.length) * 10) / 10 : 0,
  };
}

/** This month's created / confirmed / cancelled counts, in the trend shape. */
export function currentMonthTrend(bookings: readonly BookingRequest[], period: string): MonthlyBookingTrend {
  const made = bookings.filter((b) => inMonth(b, period));
  return {
    month: period,
    created: made.length,
    confirmed: made.filter((b) => CONFIRMED.includes(b.state)).length,
    cancelled: made.filter((b) => b.state === 'Cancelled').length,
  };
}

/** Bookings made this month per room type, largest first, with the tail rolled up. */
export function bookingsByRoomType(
  bookings: readonly BookingRequest[],
  roomTypes: readonly RoomType[],
  period: string,
  limit = 4,
): { total: number; rows: { id: string; name: string; count: number }[]; otherCount: number } {
  const made = bookings.filter((b) => inMonth(b, period) && !NOT_BOOKED.includes(b.state));
  const rows = roomTypes
    .map((rt) => ({ id: rt.id, name: rt.name, count: made.filter((b) => b.roomTypeId === rt.id).length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  return {
    total: made.length,
    rows: rows.slice(0, limit),
    otherCount: rows.slice(limit).reduce((s, r) => s + r.count, 0),
  };
}

export type BookingListFilter = 'all' | 'active' | 'inactive';

const CLOSED_STATES: readonly BookingRequest['state'][] = ['CheckedOut', 'Cancelled', 'Rejected', 'NoShow'];

export const isClosedBooking = (b: BookingRequest) => CLOSED_STATES.includes(b.state);

/**
 * Bookings list for the side panel: newest first, filtered by lifecycle and a
 * free-text query over the searchable fields the caller supplies.
 */
export function filterBookingList(
  bookings: readonly BookingRequest[],
  filter: BookingListFilter,
  query: string,
  searchableText: (b: BookingRequest) => string,
): BookingRequest[] {
  const q = query.trim().toLowerCase();
  return bookings
    .filter((b) => {
      if (filter === 'active' && (isClosedBooking(b) || b.state === 'Draft')) return false;
      if (filter === 'inactive' && !isClosedBooking(b)) return false;
      return !q || searchableText(b).toLowerCase().includes(q);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
