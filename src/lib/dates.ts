/**
 * Date presentation helpers. Framework-free: no react-native or expo imports,
 * so these stay unit-testable in plain Node.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function ordinal(day: number): string {
  const rem100 = day % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

/** '2026-10-03' → '3rd October' */
export function ordinalDate(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  if (!month || !day) return iso;
  return `${ordinal(day)} ${MONTHS[month - 1] ?? ''}`.trim();
}

export type DayLabel =
  | { kind: 'today' }
  | { kind: 'tomorrow' }
  | { kind: 'date'; text: string };

/** Classifies a date against the property's business date. */
export function relativeDay(iso: string, businessDate: string): DayLabel {
  if (iso === businessDate) return { kind: 'today' };

  const next = new Date(`${businessDate}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  if (iso === next.toISOString().slice(0, 10)) return { kind: 'tomorrow' };

  return { kind: 'date', text: ordinalDate(iso) };
}

/** '2026-01-12' (or a full ISO timestamp) → '12 Jan 2026' */
export function shortDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${MONTHS[month - 1]?.slice(0, 3) ?? ''} ${year}`;
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  const ms =
    new Date(`${to.slice(0, 10)}T00:00:00Z`).getTime() -
    new Date(`${from.slice(0, 10)}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000);
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** '2026-10-05' → 'Mon, 5 Oct 2026' */
export function weekdayDate(iso: string): string {
  const day = new Date(`${iso.slice(0, 10)}T00:00:00Z`).getUTCDay();
  return `${WEEKDAYS[day] ?? ''}, ${shortDate(iso)}`;
}

/**
 * '2026-09-20T14:00:00+04:00' → '20 Sep 2026, 14:00'. Reads the wall-clock
 * time as written, so a property-local timestamp isn't shifted.
 */
export function shortDateTime(iso: string): string {
  const time = iso.slice(11, 16);
  return time ? `${shortDate(iso)}, ${time}` : shortDate(iso);
}

/** '2026-10-05', '2026-10-10' → '5–10 Oct 2026'; spans months and years as needed. */
export function stayRangeWithYear(checkIn: string, checkOut: string): string {
  const [inYear, inMonth, inDay] = checkIn.split('-').map(Number);
  const [outYear, outMonth, outDay] = checkOut.split('-').map(Number);
  if (!inYear || !inMonth || !inDay || !outYear || !outMonth || !outDay) {
    return `${checkIn}–${checkOut}`;
  }
  const mon = (m: number) => MONTHS[m - 1]?.slice(0, 3) ?? '';
  if (inYear !== outYear) return `${shortDate(checkIn)} – ${shortDate(checkOut)}`;
  if (inMonth !== outMonth) return `${inDay} ${mon(inMonth)} – ${outDay} ${mon(outMonth)} ${outYear}`;
  return `${inDay}–${outDay} ${mon(outMonth)} ${outYear}`;
}

/** '2026-09' or '2026-09-21' → 'September' */
export function monthName(iso: string): string {
  const month = Number(iso.slice(5, 7));
  return MONTHS[month - 1] ?? '';
}

/** '2026-09' → '2026-08' */
export function previousPeriod(period: string): string {
  const [year, month] = period.split('-').map(Number);
  if (!year || !month) return period;
  return month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
}

/** '2026-09-25' → '25 Sep' */
export function dayMonth(iso: string): string {
  const [, month, day] = iso.slice(0, 10).split('-').map(Number);
  if (!month || !day) return iso;
  return `${day} ${MONTHS[month - 1]?.slice(0, 3) ?? ''}`;
}

/** ISO-8601 week number and its Monday–Sunday span for a date. */
export function isoWeek(iso: string): { week: number; start: string; end: string } {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  const weekday = (d.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - weekday);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const thursday = new Date(monday);
  thursday.setUTCDate(monday.getUTCDate() + 3);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return { week, start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) };
}

/** '2026-09-22', '2026-09-26' → '22–26 Sep'; across months → '28 Sep–3 Oct'. */
export function dayFirstRange(start: string, end: string): string {
  const [, sMonth, sDay] = start.slice(0, 10).split('-').map(Number);
  const [, eMonth] = end.slice(0, 10).split('-').map(Number);
  if (!sMonth || !sDay || !eMonth) return `${start}–${end}`;
  return sMonth === eMonth ? `${sDay}–${dayMonth(end)}` : `${dayMonth(start)}–${dayMonth(end)}`;
}

/** 'Mon'…'Sun' for a date. */
export function weekdayShort(iso: string): string {
  return WEEKDAYS[new Date(`${iso.slice(0, 10)}T00:00:00Z`).getUTCDay()] ?? '';
}
