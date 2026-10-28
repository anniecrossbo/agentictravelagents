import type { Customer, Tone } from '@/contracts';

export type CustomerFilter = 'all' | 'upcoming' | 'travelling' | 'needs' | 'vip';

export function filterCustomers(list: Customer[], filter: CustomerFilter, query: string): Customer[] {
  const q = query.trim().toLowerCase();
  return list.filter((c) => {
    if (filter === 'upcoming' && !c.upcoming) return false;
    if (filter === 'travelling' && !c.travellingNow) return false;
    if (filter === 'needs' && !c.needsInput) return false;
    if (filter === 'vip' && !c.vip) return false;
    return !q || `${c.name} ${c.headline} ${c.location} ${c.stage}`.toLowerCase().includes(q);
  });
}

export function stageTone(stage: string): Tone {
  if (stage === 'Proposal sent') return 'warning';
  if (stage === 'Planning') return 'brand';
  if (stage === 'Booked') return 'positive';
  return 'neutral';
}

/** Overall teammate state for one customer, derived from their team activity. */
export function activityState(steps: { state: 'done' | 'working' | 'needs-you' | 'not-started' }[] | undefined): 'needs-you' | 'working' | 'caught-up' {
  if (!steps || steps.length === 0) return 'caught-up';
  if (steps.some((s) => s.state === 'needs-you')) return 'needs-you';
  if (steps.some((s) => s.state === 'working')) return 'working';
  return 'caught-up';
}
