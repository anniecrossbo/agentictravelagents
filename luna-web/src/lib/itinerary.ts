import type { ItineraryDay, ItineraryItem } from '@/contracts';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const item = (id: string, kind: ItineraryItem['kind'], title: string, detail: string): ItineraryItem => ({
  id,
  kind,
  title,
  detail,
  estimate: 'To be planned',
  price: '—',
  status: 'Not planned yet',
  tone: 'neutral',
});

/** A day-by-day skeleton for a trip, from text like "3–9 Feb". Falls back to numbered days when the dates can't be read. */
export function draftDays(dates: string, nights: number, place: string, idPrefix: string): ItineraryDay[] {
  const count = Math.max(1, nights + 1);
  const match = /(\d{1,2})\s*[–-]\s*(\d{1,2})\s+([A-Za-z]{3})/.exec(dates);
  const monthIndex = match ? MONTHS.indexOf((match[3] ?? '').toLowerCase()) : -1;
  const start = match && monthIndex >= 0 ? new Date(monthIndex <= 2 ? 2027 : 2026, monthIndex, Number(match[1])) : undefined;

  return Array.from({ length: count }, (_, i) => {
    const date = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + i) : undefined;
    const last = i === count - 1;
    const label = i === 0 ? `Day 1 · Arrive in ${place}` : last ? `Day ${i + 1} · Head home` : `Day ${i + 1}`;
    const items: ItineraryItem[] =
      i === 0
        ? [item(`${idPrefix}-arrive`, 'transfer', 'Arrival and transfer to the stay', 'To be arranged')]
        : last
          ? [item(`${idPrefix}-depart`, 'transfer', 'Transfer to the airport', 'To be arranged')]
          : [item(`${idPrefix}-day${i + 1}`, 'experience', 'Open day', 'Add experiences and meals as you decide them')];
    return {
      id: `${idPrefix}-day-${i + 1}`,
      weekday: date ? (WEEKDAYS[date.getDay()] ?? '') : 'DAY',
      day: date ? date.getDate() : i + 1,
      month: date ? (date.toLocaleString('en-GB', { month: 'short' })) : '',
      place,
      label,
      items,
    };
  });
}
