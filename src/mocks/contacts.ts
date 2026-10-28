import type { AgentId, Channel, Contact, ContactKind, Conversation, ConversationMessage } from '@/contracts';
import { agents } from './agents';

type Extra = { attachments?: string[]; agent?: AgentId };
type Line = [from: ConversationMessage['from'], text: string, day: string, time: string, channel: Channel, extra?: Extra];

interface Seed {
  id: string;
  name: string;
  initials: string;
  tone: Contact['tone'];
  kind: ContactKind;
  vip?: boolean;
  context: string;
  unread?: number;
  summary: string;
  nextStep?: string;
  generatedAt: string;
  lines: Line[];
  /** Subject of the email thread; replies are shown as "Re: …". */
  subject?: string;
}

const STAFF = 'Hameed';

const seeds: Seed[] = [
  {
    id: 'nadia',
    name: 'Nadia Farouk',
    initials: 'NF',
    tone: 3,
    kind: 'customer',
    vip: true,
    context: 'BK-48213 · 28 Sept – 03 Oct 2026',
    subject: 'Booking BK-48213 · early check-in',
    unread: 2,
    summary: "Nadia arrives in 2 days for her anniversary and has requested 11 AM early check-in on WhatsApp; she's sent one passport copy by email.",
    nextStep: 'Chase the second passport and confirm early check-in.',
    generatedAt: '30th Sept 2026, 09:55',
    lines: [
      ['staff', 'Here is your booking confirmation for 28 Sept – 03 Oct.', 'Mon', '11:05', 'email', { attachments: ['Booking confirmation BK-48213.pdf'] }],
      ['contact', 'Hi! We land at 9 and would love to check in at 11 if at all possible. It is our anniversary.', 'Yesterday', '18:20', 'whatsapp'],
      ['staff', "Happy early anniversary! I'm asking the hotel now and will confirm today.", 'Yesterday', '18:32', 'whatsapp'],
      ['contact', 'Attaching my passport copy. My husband will send his shortly.', 'Today', '08:41', 'email', { attachments: ['Nadia Farouk passport.pdf'] }],
      ['luna', 'Early check-in at 11:00 is possible if the room is released. I asked the hotel to confirm by noon.', 'Today', '09:10', 'whatsapp', { agent: 'reservations' }],
      ['contact', 'Wonderful, thank you! Is there a spa slot after check-in?', 'Today', '09:47', 'whatsapp'],
    ],
  },
  {
    id: 'ritz',
    name: 'Ritz-Carlton DIFC',
    initials: 'RD',
    tone: 2,
    kind: 'hotel',
    vip: true,
    context: 'Hotel · Dubai · 2 bookings',
    subject: 'Deposit for Aisha Nour',
    unread: 1,
    summary: "The hotel confirmed Aisha Nour's €1,920 deposit and will send the balance invoice 30 days before arrival. The payout follows the balance within five working days.",
    nextStep: 'Pay the balance invoice when it arrives.',
    generatedAt: '28th Oct 2026, 08:30',
    lines: [
      ['staff', 'Can you confirm you received the €1,920 deposit for Aisha Nour?', 'Yesterday', '16:02', 'email'],
      ['contact', 'Yes, it arrived on 24 Sep and is matched to the booking.', 'Yesterday', '16:40', 'email', { attachments: ['Deposit receipt — Aisha Nour.pdf'] }],
      ['contact', 'We will send the balance invoice 30 days before arrival.', 'Today', '10:42', 'email'],
    ],
  },
  {
    id: 'casacook',
    name: 'Casa Cook El Gouna',
    initials: 'CC',
    tone: 1,
    kind: 'hotel',
    context: 'Hotel · El Gouna, Egypt · 1 booking',
    subject: 'Winter rates 2026–27',
    unread: 1,
    summary: 'Winter rates are now loaded, and garden rooms start at €310 a night. Aisha Nour keeps her contracted rate for 14–21 Jan.',
    generatedAt: '28th Oct 2026, 09:25',
    lines: [
      ['contact', 'Our winter rates are now loaded. Garden rooms start at €310 a night.', 'Today', '09:20', 'email', { attachments: ['Winter rates 2026-27.pdf'] }],
      ['staff', 'Thanks. Is the Aisha Nour stay on the same rate?', 'Today', '09:24', 'email'],
      ['contact', 'Yes, her 14–21 Jan stay keeps the contracted rate.', 'Today', '09:30', 'email'],
    ],
  },
  {
    id: 'marina',
    name: 'Marina Bay Hotel Dubai',
    initials: 'MB',
    tone: 3,
    kind: 'hotel',
    context: 'Hotel · Dubai · 1 booking',
    subject: 'Contract renewal',
    summary: 'The contract ends on 30 Nov and the hotel asked about renewing for a year. Their invoice for the Sharma Family is €250 higher because of the resort fee.',
    nextStep: 'Review the renewal terms and ask for a corrected invoice.',
    generatedAt: '28th Oct 2026, 07:50',
    lines: [
      ['contact', 'Your contract ends on 30 Nov. Shall we renew it for another year?', 'Mon', '14:30', 'email'],
      ['staff', "I'll review the terms and come back to you this week.", 'Mon', '15:02', 'email'],
      ['staff', 'Can you confirm the invoice for the Sharma Family?', 'Fri', '11:00', 'whatsapp'],
      ['contact', 'The invoice is €250 higher because of the resort fee. We can send a corrected copy.', 'Fri', '11:12', 'whatsapp', { attachments: ['Sharma Family invoice.pdf'] }],
    ],
  },
  {
    id: 'shinjuku',
    name: 'Shinjuku Garden Hotel',
    initials: 'SG',
    tone: 4,
    kind: 'hotel',
    context: 'Hotel · Tokyo · 1 booking',
    subject: 'Early payment discount',
    unread: 1,
    summary: 'The hotel offers about 8% off the room rate for the Sharma Family if payment arrives 60 days before arrival.',
    nextStep: 'Decide whether to pay early.',
    generatedAt: '28th Oct 2026, 08:58',
    lines: [
      ['contact', 'We can offer a better rate if payment arrives 60 days before arrival.', 'Today', '08:55', 'email'],
      ['staff', 'How much better?', 'Today', '09:02', 'email'],
      ['contact', 'About 8% on the room rate for the Sharma Family stay.', 'Today', '09:15', 'email'],
    ],
  },
  {
    id: 'phuket',
    name: 'Phuket Beach Resort',
    initials: 'PB',
    tone: 5,
    kind: 'hotel',
    context: 'Hotel · Phuket · 1 booking',
    subject: 'Rate request for January',
    summary: "The hotel won't go below €310 a night in January but offered to add breakfast.",
    nextStep: 'Accept the €310 rate with breakfast or decline.',
    generatedAt: '27th Oct 2026, 17:45',
    lines: [
      ['staff', 'Could you go below €310 a night for the Mei Tanaka group?', 'Tue', '17:30', 'email'],
      ['contact', "We can't go lower than €310 in January, but we can add breakfast.", 'Tue', '17:40', 'email'],
    ],
  },
  {
    id: 'desert',
    name: 'Desert Safari Co.',
    initials: 'DS',
    tone: 6,
    kind: 'supplier',
    vip: true,
    context: 'Experiences · Hurghada, Egypt',
    subject: 'October commission statement',
    unread: 1,
    summary: 'Two seats on the 17 Jan sunset safari are held for Aisha Nour until Friday. The October commission statement shows €410 earned.',
    nextStep: 'Confirm the safari before Friday.',
    generatedAt: '28th Oct 2026, 10:10',
    lines: [
      ['contact', 'Your October statement is ready: €410 earned.', 'Wed', '12:00', 'email', { attachments: ['Commission statement — October.pdf'] }],
      ['staff', 'Do you have space for two on the sunset safari on 17 Jan?', 'Today', '09:58', 'whatsapp'],
      ['contact', 'Yes, two seats are held until Friday.', 'Today', '10:05', 'whatsapp'],
    ],
  },
  {
    id: 'kyoto',
    name: 'Kyoto Private Transfers',
    initials: 'KT',
    tone: 1,
    kind: 'supplier',
    context: 'Transfers · Kyoto, Japan',
    summary: 'A minivan for four from Kansai on 12 Nov is confirmed for the Sharma Family, with a name sign at arrivals.',
    generatedAt: '28th Oct 2026, 07:50',
    lines: [
      ['staff', 'Please confirm a minivan for four from Kansai on 12 Nov.', 'Today', '07:40', 'whatsapp'],
      ['contact', 'Confirmed. The driver will hold a name sign at arrivals.', 'Today', '07:48', 'whatsapp'],
    ],
  },
  {
    id: 'nile',
    name: 'Nile Cruise Operator',
    initials: 'NC',
    tone: 2,
    kind: 'supplier',
    context: 'Cruise and rail · Egypt · pending approval',
    subject: 'Contract and rates for approval',
    unread: 1,
    summary: 'The operator sent a contract and rates for your approval before they can be used for any booking.',
    nextStep: 'Review the contract and approve or decline the supplier.',
    generatedAt: '27th Oct 2026, 15:25',
    lines: [
      ['contact', 'We have sent our contract and rates for your approval.', 'Yesterday', '15:20', 'email', { attachments: ['Nile Cruise contract.pdf'] }],
      ['staff', 'Thanks, I will review them today.', 'Yesterday', '15:40', 'email'],
    ],
  },
  {
    id: 'teahouse',
    name: 'Kyoto Tea House',
    initials: 'KH',
    tone: 3,
    kind: 'supplier',
    context: 'Experiences · Kyoto, Japan',
    subject: 'Private tea ceremony, 14 Nov',
    summary: 'A private tea ceremony on 14 Nov at 11:00 is free, at €64 per guest.',
    generatedAt: '27th Oct 2026, 10:15',
    lines: [
      ['staff', 'Can we book a private ceremony on 14 Nov at 11:00?', 'Tue', '10:02', 'email'],
      ['contact', 'Yes, that slot is free. The price is €64 per guest.', 'Tue', '10:10', 'email'],
    ],
  },
  {
    id: 'omar',
    name: 'Omar Ghali',
    initials: 'OG',
    tone: 4,
    kind: 'customer',
    vip: true,
    context: 'Enquiry · Maldives honeymoon · 3–9 Feb 2027',
    unread: 1,
    summary: 'Omar wants an overwater villa for his honeymoon. Two options are being prepared and his first reply is waiting for your OK.',
    nextStep: 'Approve the first reply to Omar.',
    generatedAt: '28th Oct 2026, 09:50',
    lines: [
      ['contact', 'Hi, we would love an overwater villa. Can you send options?', 'Today', '09:40', 'whatsapp'],
      ['staff', "Of course. I'm preparing two options for you today.", 'Today', '09:44', 'whatsapp'],
      ['contact', 'Wonderful, thank you!', 'Today', '09:48', 'whatsapp'],
    ],
  },
  {
    id: 'aisha',
    name: 'Aisha Nour',
    initials: 'AN',
    tone: 5,
    kind: 'customer',
    context: 'BK-47990 · 14 – 21 Jan 2027',
    subject: 'Balance due 2 Nov',
    unread: 1,
    summary: 'Aisha wants to talk through the transfers before paying the €4,480 balance, due 2 Nov.',
    nextStep: 'Call Aisha about transfers, then chase the balance.',
    generatedAt: '28th Oct 2026, 10:32',
    lines: [
      ['staff', 'A friendly reminder that the balance is due on 2 Nov.', 'Mon', '13:15', 'email', { attachments: ['Invoice INV-2026-0412.pdf'] }],
      ['contact', 'Thank you, I will pay it this week.', 'Mon', '14:00', 'email'],
      ['contact', 'Could we talk through the transfers before I pay the balance?', 'Today', '10:30', 'whatsapp'],
    ],
  },
  {
    id: 'sharma',
    name: 'Sharma Family',
    initials: 'SF',
    tone: 6,
    kind: 'customer',
    context: 'BK-48102 · 12 – 22 Nov 2026',
    summary: 'The family is choosing between two Japan plans. Plan B has the better pace and saves about €600.',
    nextStep: 'Wait for their choice, then confirm with the hotels.',
    generatedAt: '27th Oct 2026, 18:10',
    lines: [
      ['contact', 'Both plans look good. Which one do you recommend?', 'Tue', '18:02', 'whatsapp'],
      ['staff', 'Plan B has the better pace, and it saves about €600.', 'Tue', '18:20', 'whatsapp'],
    ],
  },
  {
    id: 'mei',
    name: 'Mei Tanaka',
    initials: 'MT',
    tone: 1,
    kind: 'customer',
    context: 'BK-47711 · 2 – 10 Jan 2027 · refund request',
    subject: 'Thailand cancellation',
    summary: 'Mei cancelled the Thailand trip and asked for a refund. It is outside the policy window and needs your decision.',
    nextStep: 'Review the refund request or offer credit.',
    generatedAt: '26th Oct 2026, 09:05',
    lines: [
      ['contact', 'I had to cancel the Thailand trip. Is a refund possible?', 'Mon', '09:00', 'email'],
      ['staff', "I'm checking the policy and will come back to you today.", 'Mon', '09:20', 'email'],
    ],
  },
];

const lastOf = (s: Seed) => s.lines[s.lines.length - 1] as Line;

/** What the conversation looks like before anything is sent. */
export const conversations: Record<string, Conversation> = {};

export const seedUnread: Record<string, number> = {};

const list: Omit<Contact, 'unread'>[] = [];
const agentName = (id: AgentId) => agents.find((a) => a.id === id)?.name ?? 'Luna';
const defaultAgent: Record<ContactKind, AgentId> = { customer: 'sales', hotel: 'reservations', supplier: 'supplier' };

seeds.forEach((s) => {
  const name = s.name;
  let emails = 0;
  const messages: ConversationMessage[] = s.lines.map(([from, text, day, time, channel, extra], i) => {
    const agentId = from === 'luna' ? (extra?.agent ?? defaultAgent[s.kind]) : undefined;
    const subject = channel === 'email' && s.subject ? (emails++ === 0 ? s.subject : `Re: ${s.subject}`) : undefined;
    return {
      id: `${s.id}-${i}`,
      from,
      sender: from === 'contact' ? name : from === 'staff' ? STAFF : agentName(agentId as AgentId),
      agentId,
      text,
      subject,
      attachments: extra?.attachments,
      day,
      time,
      channel,
    };
  });
  const lastIncoming = [...s.lines].reverse().find((l) => l[0] === 'contact');
  conversations[s.id] = {
    contactId: s.id,
    summary: { text: s.summary, nextStep: s.nextStep, generatedAt: s.generatedAt },
    messages,
    replyChannel: lastIncoming?.[4] ?? lastOf(s)[4],
  };
  seedUnread[s.id] = s.unread ?? 0;
  const last = lastOf(s);
  list.push({ id: s.id, name, initials: s.initials, tone: s.tone, kind: s.kind, vip: s.vip ?? false, context: s.context, preview: last[1], at: `${last[2]} ${last[3]}` });
});

export const contactList = list;
