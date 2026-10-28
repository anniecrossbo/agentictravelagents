import type { ActivityStep, AgentId, Customer, TravelPartyMember } from '@/contracts';
import { initialsOf } from '@/lib/format';

const step = (
  stage: string,
  title: string,
  detail: string,
  state: ActivityStep['state'],
  when?: string,
): ActivityStep => ({ stage, title, detail, state, when });

/** Generic team activity for customers without hand-written data. progress: 0 new … 4 booked. */
function buildActivity(first: string, progress: number): Partial<Record<AgentId, ActivityStep[]>> {
  const st = (needed: number): ActivityStep['state'] => (progress > needed ? 'done' : progress === needed ? 'working' : 'not-started');
  return {
    sales: [
      step('New', 'Enquiry read', `I read ${first}'s enquiry and noted what they want.`, st(0), progress > 0 ? 'Done' : undefined),
      step('Qualifying', 'Understand needs', 'Budget, guests and travel dates confirmed.', st(1), progress > 1 ? 'Done' : undefined),
    ],
    designer: [step('Planning', 'Build trip options', 'Itinerary options drafted for review.', st(2), progress > 2 ? 'Done' : undefined)],
    supplier: [step('Planning', 'Check rates and availability', 'Hotel rates requested and compared.', st(2), progress > 2 ? 'Done' : undefined)],
    reservations: [step('Booking', 'Arrange the booking', 'Starts after the proposal is accepted.', st(3), progress > 3 ? 'Done' : undefined)],
    finance: [step('Booking', 'Collect the deposit', 'Starts after the booking is confirmed.', st(4), progress > 4 ? 'Done' : undefined)],
    marketing: [step('After the trip', 'Plan a follow-up', 'A personal message for their next trip.', 'not-started')],
  };
}

const member = (id: string, name: string, tone: TravelPartyMember['tone'], role: string): TravelPartyMember => ({ id, name, initials: initialsOf(name), tone, role });

interface TripSeed {
  id: string;
  title: string;
  dates: string;
  nights: number;
  status: string;
}

interface Seed {
  id: string;
  name: string;
  tone: Customer['tone'];
  location: string;
  stage: string;
  headline: string;
  agentId: AgentId;
  trip: TripSeed;
  progress: number;
  vip?: boolean;
  upcoming?: boolean;
  travellingNow?: boolean;
  needsInput?: boolean;
  history?: string;
  overview?: string;
  itineraryId?: string;
  destination?: string;
  bookingId?: string;
}

function seed(s: Seed): Customer {
  const first = s.name.split(' ')[0] ?? s.name;
  const slug = s.name.toLowerCase().replace(/[^a-z]+/g, '.');
  return {
    id: s.id,
    name: s.name,
    initials: initialsOf(s.name),
    tone: s.tone,
    location: s.location,
    email: `${slug}@example.com`,
    phone: '+44 7700 900 123', // PROTO: placeholder contact details
    stage: s.stage,
    headline: s.headline,
    agentId: s.agentId,
    vip: s.vip ?? false,
    upcoming: s.upcoming ?? true,
    travellingNow: s.travellingNow ?? false,
    needsInput: s.needsInput ?? false,
    history: s.history ?? 'Travelled with us once before',
    enquiries: [
      {
        id: s.trip.id,
        ref: `EQ-2026-${1000 + s.id.length * 17}`,
        title: s.trip.title,
        location: s.destination ?? s.trip.title,
        dates: s.trip.dates,
        nights: s.trip.nights,
        travellers: 'Two adults',
        status: s.trip.status,
        tone: 'brand',
        summary: s.headline.split(' · ')[1] ?? s.stage,
        itineraryId: s.itineraryId,
      },
    ],
    overview: s.overview ?? `${first}'s ${s.trip.title} enquiry is in progress. ${s.headline.split(' · ')[1] ?? 'My team is moving it forward'}.`,
    preferences: [
      { id: `${s.id}-p1`, text: 'Relaxed pace, good hotels', source: 'customer' },
      { id: `${s.id}-p2`, text: 'Budget to be confirmed', source: 'agency' },
    ],
    party: [member(`${s.id}-m1`, s.name, s.tone, 'Lead traveller')],
    notes: [{ id: `${s.id}-n1`, author: 'Hameed', at: '12 Oct', text: `Spoke to ${first} on the phone. Friendly and flexible on dates.` }],
    bookings: s.bookingId
      ? [
          {
            id: `${s.id}-booking1`,
            ref: `BK-${48000 + s.id.length * 37}`,
            title: s.trip.title,
            location: s.destination ?? s.trip.title,
            dates: s.trip.dates,
            nights: s.trip.nights,
            travellers: 'Two adults',
            amount: 'Booked',
            status: 'Confirmed',
            tone: 'positive',
            summary: s.headline.split(' · ')[1] ?? s.stage,
            itineraryId: s.itineraryId,
            financeBookingId: s.bookingId,
          },
        ]
      : [],
    timeline: [
      { id: `${s.id}-t1`, at: 'Today 09:10', text: `Enquiry for ${s.trip.title} came in.`, agentId: 'sales' },
      { id: `${s.id}-t2`, at: 'Today 09:25', text: 'I read it and noted the details.', agentId: 'sales' },
    ],
    documents: [{ id: `${s.id}-d1`, name: `${first} enquiry.pdf`, kind: 'Enquiry', added: 'Today' }],
    activity: buildActivity(first, s.progress),
    itineraryId: s.itineraryId,
  };
}

const omar: Customer = {
  id: 'omar',
  name: 'Omar Ghali',
  initials: 'OG',
  tone: 3,
  location: 'Dubai, United Arab Emirates',
  email: 'omar.ghali@example.com',
  phone: '+971 50 123 4567',
  stage: 'Qualifying',
  headline: 'Maldives Honeymoon · Needs a first reply',
  agentId: 'sales',
  vip: false,
  upcoming: true,
  travellingNow: false,
  needsInput: true,
  history: 'First trip with us',
  enquiries: [
    {
      id: 'omar-maldives', ref: 'EQ-2026-0417', title: 'Maldives Honeymoon', location: 'Maldives', dates: '3–9 Feb', nights: 6, travellers: 'Couple', status: 'New enquiry', tone: 'brand',
      summary: 'Honeymoon on a quiet island, overwater villa preferred. First reply is drafted and waiting for your OK.', itineraryId: 'omar-maldives',
    },
  ],
  overview:
    "Omar's Maldives enquiry came in this morning. I've drafted a first reply and I'm waiting for your OK before I send it. Nothing else is moving yet.",
  preferences: [
    { id: 'omar-p1', text: 'Overwater villa', source: 'customer' },
    { id: 'omar-p2', text: 'Quiet resort, no kids club', source: 'customer' },
    { id: 'omar-p3', text: 'Vegetarian meals', source: 'customer' },
    { id: 'omar-p4', text: 'Prefers private transfers', source: 'noticed', note: 'Noticed from his message · review' },
  ],
  party: [member('omar-m1', 'Omar Ghali', 3, 'Lead traveller'), member('omar-m2', 'Sara Ghali', 6, 'Partner')],
  notes: [
    { id: 'omar-n1', author: 'Hameed', at: 'Today 09:40', text: 'Referred by the Sharma family. Wants it to feel special, no rushing around.' },
    { id: 'omar-n2', author: 'Sales', at: 'Today 09:25', text: 'He mentioned a wedding on 30 Jan, so dates are firm.' },
    { id: 'omar-n3', author: 'Hameed', at: 'Today 09:50', text: 'Offer a welcome gift if the resort allows it.' },
  ],
  bookings: [],
  timeline: [
    { id: 'omar-t1', at: 'Today · 08:38', text: 'Enquiry received on WhatsApp', agentId: 'sales', state: 'received' },
    { id: 'omar-t2', at: 'Today · 08:40', text: 'Enquiry read and summarised', agentId: 'sales' },
    { id: 'omar-t3', at: 'Today · 08:55', text: 'Preferences noted: overwater villa, vegetarian meals', agentId: 'sales' },
    { id: 'omar-t4', at: 'Today · 09:10', text: 'First reply drafted. Waiting for your OK.', agentId: 'sales', state: 'waiting' },
    { id: 'omar-t5', at: 'Today · 09:30', text: 'Two starting ideas drafted', agentId: 'designer' },
  ],
  documents: [
    { id: 'omar-d1', name: 'Enquiry email.pdf', kind: 'Enquiry', added: 'Today 09:05' },
    { id: 'omar-d2', name: 'Maldives Honeymoon · itinerary draft', kind: 'Itinerary', added: 'Today 09:30' },
    { id: 'omar-d3', name: 'Passport copy.jpg', kind: 'Customer document', added: 'Not received yet' },
  ],
  activity: {
    sales: [
      step('New', 'Enquiry read', 'Honeymoon in the Maldives, 3–9 Feb, two guests.', 'done', 'Done · Today'),
      step('New', 'First reply drafted', "I won't send it without your OK.", 'needs-you'),
      step('Qualifying', 'Ask about budget and room type', 'Starts once he has replied.', 'not-started'),
    ],
    designer: [
      step('Planning', 'Build trip options', 'Starts once the budget is known.', 'not-started'),
    ],
    supplier: [step('Planning', 'Check resort availability', 'Starts once the dates and budget are confirmed.', 'not-started')],
    reservations: [step('Booking', 'Arrange airport transfers', 'Starts after the booking is confirmed.', 'not-started')],
    finance: [step('Booking', 'Collect the deposit', 'Starts after the proposal is accepted.', 'not-started')],
    marketing: [step('After the trip', 'Plan an anniversary note', 'A personal message a year from now.', 'not-started')],
  },
  itineraryId: 'omar-maldives',
};

const aisha: Customer = {
  id: 'aisha',
  name: 'Aisha Nour',
  initials: 'AN',
  tone: 2,
  location: 'London, United Kingdom',
  email: 'aisha.nour@example.com',
  phone: '+44 7700 900 456',
  stage: 'Proposal sent',
  headline: 'Egypt Stay · Needs your call about transfers',
  agentId: 'sales',
  vip: true,
  upcoming: true,
  travellingNow: false,
  needsInput: true,
  history: '3 trips with us · Last trip Egypt, 2025',
  enquiries: [
    {
      id: 'aisha-egypt', ref: 'EQ-2026-0388', title: 'Egypt Stay', location: 'Egypt', dates: '14–21 Jan', nights: 7, travellers: 'Two adults', status: 'Proposal sent', tone: 'warning',
      summary: 'Six nights at the hotel with private airport transfers. She wants to talk the transfers through.', itineraryId: 'aisha-egypt',
    },
  ],
  overview:
    "Aisha accepted the Egypt proposal and paid her deposit. She'd like to talk through airport transfers. Her hotel balance is due on 2 Nov.",
  preferences: [
    { id: 'aisha-p1', text: 'Halal meals', source: 'customer' },
    { id: 'aisha-p2', text: 'Private car for airport transfers', source: 'customer' },
    { id: 'aisha-p3', text: 'Prefers calls to email, best after 4 pm', source: 'agency' },
    { id: 'aisha-p4', text: 'Spa day on her next visit', source: 'noticed', note: 'Noticed from her last trip · review' },
  ],
  party: [member('aisha-m1', 'Aisha Nour', 2, 'Lead traveller'), member('aisha-m2', 'Yusuf Nour', 4, 'Partner')],
  notes: [
    { id: 'aisha-n1', author: 'Hameed', at: '18 Oct', text: 'Prefers calls to email. Best after 4 pm.' },
    { id: 'aisha-n2', author: 'Finance', at: '24 Sep', text: 'Deposit of €1,920 received and matched to her booking.' },
  ],
  bookings: [
    { id: 'aisha-b1', ref: 'BK-47990', title: 'Ritz-Carlton DIFC', location: 'Dubai, United Arab Emirates', dates: '20–26 Oct', nights: 6, travellers: 'Two adults', amount: '€6,400', status: 'Balance due 2 Nov', tone: 'warning', summary: 'Deposit of €1,920 received. €4,480 balance still to collect.', itineraryId: 'aisha-egypt', financeBookingId: 'aisha', invoiceIds: ['inv-aisha'] },
  ],
  timeline: [
    { id: 'aisha-t1', at: '12 Sep', text: 'Proposal sent for Egypt, 14–21 Jan.', agentId: 'sales' },
    { id: 'aisha-t2', at: '24 Sep', text: 'Deposit of €1,920 matched to the booking.', agentId: 'finance' },
    { id: 'aisha-t3', at: 'Today 08:55', text: 'She asked to talk through transfers. I flagged it for you.', agentId: 'sales' },
  ],
  documents: [
    { id: 'aisha-d1', name: 'INV-2026-0412.pdf', kind: 'Customer invoice', added: '26 Oct', invoiceId: 'inv-aisha' },
    { id: 'aisha-d2', name: 'Egypt proposal.pdf', kind: 'Proposal', added: '12 Sep' },
  ],
  activity: {
    sales: [
      step('Proposal', 'Proposal sent', 'Egypt Stay sent on 12 Sep and accepted.', 'done', 'Done · 12 Sep'),
      step('Proposal', 'Call about transfers', 'She wants to talk it through.', 'needs-you'),
    ],
    designer: [step('Planning', 'Adjust transfers', 'Update the plan after your call.', 'not-started')],
    supplier: [step('Planning', 'Hotel rates confirmed', 'Ritz-Carlton DIFC confirmed at €1,050 a night.', 'done', 'Done · 5 Sep')],
    reservations: [step('Booking', 'Hotel booking confirmed', 'Confirmation number CB-20261020-002.', 'done', 'Done · 26 Sep')],
    finance: [step('Booking', 'Balance due 2 Nov', 'Deposit matched. €4,480 still to collect.', 'working')],
    marketing: [step('After the trip', 'Plan a follow-up', 'Offer a spa day on her next visit.', 'not-started')],
  },
  itineraryId: 'aisha-egypt',
};

const sharma: Customer = {
  id: 'sharma',
  name: 'Sharma Family',
  initials: 'SF',
  tone: 1,
  location: 'Mumbai, India',
  email: 'sharma.family@example.com',
  phone: '+91 98200 12345',
  stage: 'Planning',
  headline: 'Japan Holiday · Waiting for hotel rates',
  agentId: 'supplier',
  vip: true,
  upcoming: true,
  travellingNow: false,
  needsInput: true,
  history: '5 trips with us · Last trip Dubai, 2026',
  enquiries: [
    {
      id: 'sharma-japan', ref: 'EQ-2026-0401', title: 'Japan Holiday', location: 'Tokyo, Hakone, Kyoto', dates: '12–22 Nov', nights: 10, travellers: 'Family of four', status: 'Planning', tone: 'brand',
      summary: 'Two plans are with the family. Waiting for Tokyo hotel rates before they choose.', itineraryId: 'sharma-japan',
    },
  ],
  overview:
    'Two proposals are out for the Japan holiday. I am waiting for Tokyo hotel rates before the family chooses. Their Dubai hotel invoice also needs a decision from you.',
  preferences: [
    { id: 'sharma-p1', text: 'Vegetarian meals', source: 'customer' },
    { id: 'sharma-p2', text: 'Fixed itinerary, with free afternoons', source: 'agency' },
    { id: 'sharma-p3', text: 'Budget €14,000 to €16,000', source: 'customer' },
    { id: 'sharma-p4', text: 'Interested in trains and temples', source: 'noticed', note: 'Noticed from their messages · review' },
  ],
  party: [member('sharma-m1', 'Rohan Sharma', 1, 'Lead traveller'), member('sharma-m2', 'Meera Sharma', 5, 'Partner'), member('sharma-m3', 'Arjun Sharma', 3, 'Child'), member('sharma-m4', 'Anika Sharma', 6, 'Child')],
  notes: [
    { id: 'sharma-n1', author: 'Hameed', at: '20 Oct', text: 'Mr Sharma likes a fixed itinerary. Mrs Sharma wants free afternoons.' },
    { id: 'sharma-n2', author: 'Supplier', at: 'Today 08:30', text: 'Tokyo hotel offers better rates for earlier payment. Needs your decision.' },
  ],
  bookings: [
    { id: 'sharma-b1', ref: 'BK-47802', title: 'Dubai hotel stay', location: 'Dubai, United Arab Emirates', dates: '10–15 Nov', nights: 5, travellers: 'Family of four', amount: '€5,200', status: 'Balance due 14 Nov', tone: 'warning', summary: 'Deposit of €2,600 received. The hotel invoice is €250 over the agreed rate.', financeBookingId: 'sharma', invoiceIds: ['inv-sharma'] },
  ],
  timeline: [
    { id: 'sharma-t1', at: '3 Oct', text: 'Enquiry for Japan, 12–22 Nov.', agentId: 'sales' },
    { id: 'sharma-t2', at: '10 Oct', text: 'Two plans drafted and sent.', agentId: 'designer' },
    { id: 'sharma-t3', at: 'Today 08:30', text: 'I asked the Tokyo hotel for rates. Still waiting.', agentId: 'supplier' },
  ],
  documents: [
    { id: 'sharma-d1', name: 'INV-2026-0413.pdf', kind: 'Customer invoice', added: '26 Oct', invoiceId: 'inv-sharma' },
    { id: 'sharma-d2', name: 'Japan plans A and B.pdf', kind: 'Proposal', added: '10 Oct' },
  ],
  activity: {
    sales: [step('Proposal', 'Two proposals sent', 'Plan A and Plan B are with the family.', 'done', 'Done · 10 Oct')],
    designer: [step('Planning', 'Plans drafted', 'Two plans built and sent.', 'done', 'Done · 10 Oct')],
    supplier: [step('Planning', 'Tokyo hotel rates', 'Waiting for the hotel to reply.', 'working')],
    reservations: [step('Booking', 'Arrange the booking', 'Starts after they choose a plan.', 'not-started')],
    finance: [step('Booking', 'Hotel invoice check', '€250 more than the agreed rate. Needs you.', 'needs-you')],
    marketing: [step('After the trip', 'Plan a follow-up', 'A thank-you note after Japan.', 'not-started')],
  },
  itineraryId: 'sharma-japan',
};

const kapoor: Customer = seed({
  id: 'kapoor',
  name: 'Kapoor Family',
  tone: 5,
  location: 'Delhi, India',
  stage: 'Booked',
  headline: 'Japan booking · Payment match unclear',
  agentId: 'finance',
  trip: { id: 'kapoor-japan', title: 'Japan booking', dates: '3–12 Dec', nights: 9, status: 'Booked' },
  progress: 4,
  history: '2 trips with us',
  destination: 'Tokyo and Kyoto, Japan',
  bookingId: 'kapoor',
  overview: '₹18,000 arrived and could belong to two bookings. I need your call before matching it.',
});

export const customers: Customer[] = [
  sharma,
  aisha,
  seed({
    id: 'nadia',
    name: 'Nadia Farouk',
    tone: 3,
    location: 'Cairo, Egypt',
    stage: 'Planning',
    headline: 'Italy Honeymoon · Checking hotel confirmation',
    agentId: 'reservations',
    trip: { id: 'nadia-italy', title: 'Italy Honeymoon', dates: '8–17 Dec', nights: 9, status: 'Proposal ready' },
    progress: 3,
    vip: false,
    needsInput: true,
    history: 'First trip with us',
    overview: 'Rome and Florence honeymoon. She asked for a discount on the proposal, which needs your decision.',
  }),
  seed({
    id: 'liamchen',
    name: 'Liam Chen',
    tone: 4,
    location: 'Singapore',
    stage: 'Qualifying',
    headline: 'Vietnam Adventure · Waiting for passport details',
    agentId: 'sales',
    trip: { id: 'liam-vietnam', title: 'Vietnam Adventure', dates: '5–14 Dec', nights: 9, status: 'Waiting for passport details' },
    progress: 1,
  }),
  omar,
  seed({
    id: 'clara',
    name: 'Clara Bennett',
    tone: 5,
    location: 'Manchester, United Kingdom',
    stage: 'Qualifying',
    headline: 'Greece · Reply drafted',
    agentId: 'sales',
    trip: { id: 'clara-greece', title: 'Greece', dates: '20–27 Mar', nights: 7, status: 'Reply drafted' },
    progress: 1,
  }),
  seed({
    id: 'liambecker',
    name: 'Liam Becker',
    tone: 6,
    location: 'Berlin, Germany',
    stage: 'New',
    headline: 'Turkey · New enquiry',
    agentId: 'sales',
    trip: { id: 'becker-turkey', title: 'Turkey', dates: '14–19 Apr', nights: 5, status: 'New enquiry' },
    progress: 0,
  }),
  seed({
    id: 'sara',
    name: 'Sara Mansour',
    tone: 2,
    location: 'Dubai, United Arab Emirates',
    stage: 'New',
    headline: 'Dubai · Guest details',
    agentId: 'sales',
    trip: { id: 'sara-dubai', title: 'Dubai', dates: '3–7 Mar', nights: 4, status: 'Guest details' },
    progress: 0,
  }),
  seed({
    id: 'jonas',
    name: 'Jonas Weber',
    tone: 1,
    location: 'Zurich, Switzerland',
    stage: 'Planning',
    headline: 'Switzerland · Clarifying budget',
    agentId: 'designer',
    trip: { id: 'jonas-swiss', title: 'Switzerland rail trip', dates: '9–15 Dec', nights: 6, status: 'Clarifying budget' },
    progress: 2,
    itineraryId: 'jonas-swiss',
  }),
  seed({
    id: 'hannah',
    name: 'Hannah Lee',
    tone: 4,
    location: 'Singapore',
    stage: 'Planning',
    headline: 'Singapore · Drafting options',
    agentId: 'designer',
    trip: { id: 'hannah-sg', title: 'Singapore, two options', dates: '2–8 Feb', nights: 6, status: '1 proposal drafted' },
    progress: 2,
    itineraryId: 'hannah-sg',
  }),
  seed({
    id: 'karim',
    name: 'Karim Adel',
    tone: 6,
    location: 'Alexandria, Egypt',
    stage: 'Booked',
    headline: 'Italy · Awaiting hotel confirmation',
    agentId: 'reservations',
    trip: { id: 'karim-italy', title: 'Italy', dates: '8–17 Dec', nights: 9, status: 'Proposal accepted' },
    progress: 3,
  }),
  seed({
    id: 'mei',
    name: 'Mei Tanaka',
    tone: 2,
    location: 'Tokyo, Japan',
    stage: 'Booked',
    headline: 'Thailand Getaway · Refund needs your OK',
    agentId: 'finance',
    trip: { id: 'mei-thailand', title: 'Thailand Getaway', dates: '2–10 Jan', nights: 8, status: 'Refund request' },
    progress: 4,
    needsInput: true,
    overview: 'Mei cancelled the Thailand Getaway outside the refund window and asked for her money back.',
  }),
  seed({
    id: 'elena',
    name: 'Elena Rossi',
    tone: 5,
    location: 'Milan, Italy',
    stage: 'Repeat guest',
    headline: 'Italy · Message drafted',
    agentId: 'marketing',
    trip: { id: 'elena-italy', title: 'Italy repeat trip', dates: '1–6 Jan', nights: 5, status: 'Repeat trip' },
    progress: 1,
    vip: true,
    needsInput: true,
    history: '4 trips with us · Last trip Capri, 2025',
    overview: 'Elena travelled with us last January. I drafted a personal message about a repeat trip and need your sign-off.',
  }),
  kapoor,
  seed({
    id: 'tom',
    name: 'Tom Hughes',
    tone: 4,
    location: 'Bristol, United Kingdom',
    stage: 'Booked',
    headline: 'Cancelled booking · €420 refund waiting',
    agentId: 'finance',
    trip: { id: 'tom-crete', title: 'Crete (cancelled)', dates: '10–17 Nov', nights: 7, status: 'Refund waiting' },
    progress: 4,
    travellingNow: false,
    upcoming: false,
  }),
];
