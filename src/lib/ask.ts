import type { AgentId } from '@/contracts';

const RULES: [RegExp, AgentId][] = [
  [/invoice|pay|refund|commission|money|deposit|balance/i, 'finance'],
  [/hotel|rate|supplier|contract|resort|price/i, 'supplier'],
  [/itinerary|plan|trip|route|option/i, 'designer'],
  [/book|confirm|voucher|transfer|cancel|change/i, 'reservations'],
  [/repeat|message|outreach|follow|return/i, 'marketing'],
];

/** Picks which teammate should take a free-text request. */
export function routeAsk(text: string): AgentId {
  return RULES.find(([re]) => re.test(text))?.[1] ?? 'sales';
}
