export type AvailabilityLevel = 'available' | 'low' | 'soldOut';

/** Rooms left → how to show it: none is sold out, one or two is low. */
export function availabilityLevel(left: number): AvailabilityLevel {
  if (left <= 0) return 'soldOut';
  return left <= 2 ? 'low' : 'available';
}

/** The next `count` days starting today, as day-of-month numbers with a weekday for screen readers. */
export function nextDays(from: Date, count: number): { key: string; day: number; weekday: string; month: string }[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    return {
      key: d.toISOString().slice(0, 10),
      day: d.getDate(),
      weekday: d.toLocaleDateString('en-GB', { weekday: 'long' }),
      month: d.toLocaleDateString('en-GB', { month: 'long' }),
    };
  });
}
