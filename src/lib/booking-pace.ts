/**
 * Booking pace: how many bookings have been made so far this month versus
 * the same point last month. Framework-free and unit-testable in plain Node.
 */

import type { BookingPace, BookingRequest, PeriodMetric } from './types';

/** Running totals of bookings created on each day 1…`days` of `period`. */
function cumulativeByDay(bookings: readonly BookingRequest[], period: string, days: number): number[] {
  const perDay = Array.from({ length: days }, () => 0);
  for (const b of bookings) {
    if (!b.createdAt.startsWith(period)) continue;
    const day = Number(b.createdAt.slice(8, 10));
    if (day >= 1 && day <= days) perDay[day - 1]! += 1;
  }
  return runningTotal(perDay);
}

function runningTotal(values: readonly number[]): number[] {
  let sum = 0;
  return values.map((v) => (sum += v));
}

/**
 * This month's pace through the business date, with the previous month's
 * daily counts (from the reporting backend) summed over the same days.
 */
export function buildBookingPace(
  bookings: readonly BookingRequest[],
  businessDate: string,
  previousMonthDaily: readonly number[],
): BookingPace {
  const period = businessDate.slice(0, 7);
  const days = Number(businessDate.slice(8, 10));
  return {
    period,
    current: cumulativeByDay(bookings, period, days),
    previous: runningTotal(previousMonthDaily.slice(0, days)),
  };
}

/** Totals at the latest day, for the headline figures and change badge. */
export function paceTotals(pace: BookingPace): PeriodMetric {
  return {
    current: pace.current[pace.current.length - 1] ?? 0,
    previous: pace.previous[pace.previous.length - 1] ?? 0,
  };
}
