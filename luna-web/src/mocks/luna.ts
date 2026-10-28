import type { AgentId, LunaBlock, LunaMessage, LunaThread } from '@/contracts';
import { routeAsk } from '@/lib/ask';
import { agents } from './agents';
import { replyTo } from './replies';

const text = (t: string): LunaBlock => ({ type: 'text', text: t });

const collectChart: LunaBlock = {
  type: 'chart',
  title: 'Still to collect',
  subtitle: 'From customers, by booking',
  bars: [
    { label: 'Kapoor', value: 8900, display: '€8.9k' },
    { label: 'Aisha', value: 4480, display: '€4.5k' },
    { label: 'Sharma', value: 2600, display: '€2.6k' },
  ],
};

const workloadChart: LunaBlock = {
  type: 'chart',
  title: 'Open work by teammate',
  subtitle: 'Cases waiting or in progress',
  bars: [
    { label: 'Sales', value: 6, display: '6' },
    { label: 'Itinerary', value: 3, display: '3' },
    { label: 'Supplier', value: 2, display: '2' },
    { label: 'Reserv.', value: 2, display: '2' },
    { label: 'Finance', value: 4, display: '4' },
  ],
};

const importResult: LunaBlock = {
  type: 'result',
  title: '54 records updated',
  body: 'The customer import is complete and available across Clients.',
  rows: [
    { label: 'People added', value: '48' },
    { label: 'Records updated', value: '6' },
    { label: 'Duplicates merged', value: '2' },
  ],
  note: 'Saved as one reversible change',
  noteRight: 'Batch #B-2048',
  actions: [{ label: 'Undo batch' }, { label: 'View change history ›', primary: true }],
};

const user = (id: string, t: string): LunaMessage => ({ id, from: 'user', blocks: [text(t)] });
const luna = (id: string, ...blocks: LunaBlock[]): LunaMessage => ({ id, from: 'luna', blocks });

export const lunaSeeds: LunaThread[] = [
  {
    id: 'l-cash', title: 'Cash still to collect', group: 'Today', when: 'just now',
    messages: [
      user('l-cash-1', 'How much is still to collect?'),
      luna('l-cash-2', text('€15,980 is still to collect across three bookings. Kapoor is the largest, and its payment still needs matching.'), collectChart, text("Suggested next step: match Kapoor's ₹18,000 payment first, then chase Aisha on 30 Oct.")),
    ],
  },
  {
    id: 'l-team', title: 'Team workload', group: 'Today', when: '7h ago',
    messages: [user('l-team-1', 'Who is busiest this week?'), luna('l-team-2', text('Sales has the most open enquiries, and Finance has four decisions waiting for you.'), workloadChart)],
  },
  {
    id: 'l-import', title: 'Customer import', group: 'Today', when: '12h ago',
    messages: [user('l-import-1', 'I uploaded the customer list from the old system.'), luna('l-import-2', text('Done. Here is what changed.'), importResult)],
  },
  {
    id: 'l-comm', title: 'Weekly commission summary', group: 'Yesterday', when: '2:15 pm',
    messages: [user('l-comm-1', 'How much commission did we earn this month?'), luna('l-comm-2', text('€1,820 so far this month, and €33,000 this year. Casa Cook is the biggest earner at €14,280.'))],
  },
  {
    id: 'l-follow', title: 'Customer follow-ups', group: 'Yesterday', when: '11:09 am',
    messages: [user('l-follow-1', 'Who should we follow up with?'), luna('l-follow-2', text("Elena Rossi is due a return-trip note, and Liam Chen is still waiting on his passport details. I've drafted the first and asked about the second."))],
  },
  {
    id: 'l-rates', title: 'Supplier rate review', group: '26 Oct', when: '9:12 pm',
    messages: [user('l-rates-1', 'Any hotel rates back?'), luna('l-rates-2', text("Tokyo offers a better rate for earlier payment, and Phuket won't go below €310 a night. Both are in your decisions."))],
  },
  {
    id: 'l-market', title: 'Marketing ideas', group: '26 Oct', when: '7:13 pm',
    messages: [user('l-market-1', 'Ideas for repeat guests?'), luna('l-market-2', text('A personal note a year after each trip works best. Elena Rossi is the next one due.'))],
  },
  {
    id: 'l-aisha', title: "Aisha's transfer options", group: '25 Oct', when: '3 pm',
    messages: [user('l-aisha-1', 'What transfer options does Aisha have?'), luna('l-aisha-2', text('A private car at €55 or a shared shuttle at €20 each. She wants to talk it through, so I flagged it for a call.'))],
  },
];

/** PROTO: canned answers picked by keywords; a real Luna would work this out from live data. */
export function lunaReply(question: string): LunaBlock[] {
  if (/collect|cash|owe|balance|money/i.test(question)) return [text('€15,980 is still to collect across three bookings.'), collectChart];
  if (/busy|workload|team|who is/i.test(question)) return [text('Here is where the team is spending its time.'), workloadChart];
  if (/import|upload|file/i.test(question)) return [text('Done. Here is what changed.'), importResult];
  const agentId: AgentId = routeAsk(question);
  const name = agents.find((a) => a.id === agentId)?.name ?? 'your team';
  return [text(`I asked ${name} about this. ${replyTo(agentId, question)}`)];
}

export const titleFrom = (question: string): string => {
  const clean = question.trim().replace(/\s+/g, ' ');
  return clean.length > 38 ? `${clean.slice(0, 36)}…` : clean;
};
