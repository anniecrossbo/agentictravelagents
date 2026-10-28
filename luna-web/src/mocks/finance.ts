import type { Booking, CashflowStep, FinanceRecord, FinanceSnapshot, Invoice, StageCard } from '@/contracts';

const IBAN = 'Bank transfer · Ali Travel & Tours · IBAN AE00 0000 0000 0000 0000 000';

const step = (s: CashflowStep): CashflowStep => s;

const card = (lines: StageCard['lines'], chip: string, chipTone: StageCard['chipTone']): StageCard => ({ lines, chip, chipTone });

export const bookings: Booking[] = [
  {
    id: 'aisha',
    customerId: 'aisha',
    customerName: 'Aisha Nour',
    stay: 'Ritz-Carlton DIFC',
    trip: 'Ritz-Carlton DIFC · 20–26 Oct · 6 nights',
    dates: '20–26 Oct',
    nights: 6,
    value: 6400,
    commission: 768,
    payout: 5632,
    balanceChip: 'Balance due 2 Nov',
    balanceTone: 'warning',
    stages: {
      'pending-customer': card([{ text: 'Ritz-Carlton DIFC', muted: true }, { text: '€4,480 to collect', strong: true }], 'Balance due 2 Nov', 'warning'),
      'pending-hotel': card([{ text: 'Ritz-Carlton DIFC', muted: true }, { text: '€768 commission', strong: true }], 'Paid after the stay', 'warning'),
      'to-pay': card([{ text: 'Ritz-Carlton DIFC', muted: true }, { text: '€5,632 hotel payout', strong: true }], 'After balance is received', 'warning'),
    },
    steps: [
      step({ id: 'aisha-deposit', title: 'Deposit', sub: 'Customer payment · received 24 Sep', amount: 1920, direction: 'in', party: 'customer', status: 'Matched', tone: 'positive', settled: true, invoiceId: 'inv-aisha', invoiceLabel: 'View invoice' }),
      step({ id: 'aisha-balance', title: 'Balance', sub: 'Customer payment · due 2 Nov', amount: 4480, direction: 'in', party: 'customer', status: 'Waiting for customer', tone: 'warning', settled: false, invoiceId: 'inv-aisha', invoiceLabel: 'View invoice' }),
      step({ id: 'aisha-hotel', title: 'Hotel payout · money out', sub: 'Ritz-Carlton DIFC · after the balance is received', amount: -5632, direction: 'out', party: 'hotel', status: 'Scheduled', tone: 'neutral', settled: false, invoiceId: 'hinv-aisha', invoiceLabel: 'View hotel invoice' }),
      step({ id: 'aisha-commission', title: 'Agency commission', sub: 'From the hotel · after the stay', amount: 768, direction: 'in', party: 'hotel', status: 'Expected', tone: 'neutral', settled: false, invoiceId: 'comm-aisha', invoiceLabel: 'View commission statement' }),
    ],
    chat: [
      { id: 'a1', from: 'agent', text: "Aisha's deposit of €1,920 is matched to her booking.", at: 'Today 09:12' },
      { id: 'a2', from: 'agent', text: "Her balance of €4,480 is due on 2 Nov. I'll chase on 30 Oct if it hasn't arrived.", at: 'Today 09:12' },
      { id: 'a3', from: 'user', text: 'When does the hotel get paid?', at: 'Today 09:14' },
      { id: 'a4', from: 'agent', text: "After her balance arrives. I'll then schedule €5,632 to Ritz-Carlton DIFC.", at: 'Today 09:14' },
    ],
    quickReplies: ['Chase the balance', 'View invoice'],
  },
  {
    id: 'sharma',
    customerId: 'sharma',
    customerName: 'Sharma Family',
    stay: 'Dubai hotel stay',
    trip: 'Dubai hotel stay · 10–15 Nov · 5 nights',
    dates: '10–15 Nov',
    nights: 5,
    value: 5200,
    commission: 520,
    payout: 4250,
    balanceChip: 'Balance due 14 Nov',
    balanceTone: 'warning',
    stages: {
      'pending-customer': card([{ text: 'Dubai hotel stay', muted: true }, { text: '€2,600 to collect', strong: true }], 'Balance due 14 Nov', 'warning'),
      'pending-hotel': card([{ text: 'Dubai hotel stay', muted: true }, { text: '€520 commission', strong: true }], 'Paid after the stay', 'warning'),
      'to-pay': card([{ text: 'Dubai hotel stay', muted: true }, { text: '€4,250 hotel invoice', strong: true }], '€250 over agreed rate', 'danger'),
    },
    steps: [
      step({ id: 'sharma-deposit', title: 'Deposit', sub: 'Customer payment · received 2 Oct', amount: 2600, direction: 'in', party: 'customer', status: 'Matched', tone: 'positive', settled: true, invoiceId: 'inv-sharma', invoiceLabel: 'View invoice' }),
      step({ id: 'sharma-balance', title: 'Balance', sub: 'Customer payment · due 14 Nov', amount: 2600, direction: 'in', party: 'customer', status: 'Waiting for customer', tone: 'warning', settled: false, invoiceId: 'inv-sharma', invoiceLabel: 'View invoice' }),
      step({ id: 'sharma-hotel', title: 'Hotel invoice · money out', sub: 'Hotel charged €250 more than the agreed rate', amount: -4250, direction: 'out', party: 'hotel', status: 'Needs review', tone: 'danger', settled: false, invoiceId: 'hinv-sharma', invoiceLabel: 'View hotel invoice' }),
      step({ id: 'sharma-commission', title: 'Agency commission', sub: 'From the hotel · after the stay', amount: 520, direction: 'in', party: 'hotel', status: 'Expected', tone: 'neutral', settled: false, invoiceId: 'comm-sharma', invoiceLabel: 'View commission statement' }),
    ],
    chat: [
      { id: 'sh1', from: 'agent', text: 'The hotel invoice is €250 higher than the rate we agreed. I have not paid it.', at: 'Today 09:02' },
      { id: 'sh2', from: 'agent', text: 'You can accept or dispute it from the Needs your decision list.', at: 'Today 09:02' },
    ],
    quickReplies: ['Why is it higher?', 'View hotel invoice'],
  },
  {
    id: 'kapoor',
    customerId: 'kapoor',
    customerName: 'Kapoor Family',
    stay: 'Japan booking',
    trip: 'Japan booking · 3–12 Dec · 9 nights',
    dates: '3–12 Dec',
    nights: 9,
    value: 8900,
    commission: 1140,
    payout: 7760,
    balanceChip: 'Payment needs matching',
    balanceTone: 'danger',
    stages: {
      'pending-customer': card([{ text: 'Japan booking', muted: true }, { text: '€8,900 to collect', strong: true }], 'Payment needs matching', 'danger'),
      'pending-hotel': card([{ text: 'Japan booking', muted: true }, { text: '€1,140 commission', strong: true }], 'Paid after the stay', 'warning'),
      'to-pay': card([{ text: 'Japan booking', muted: true }, { text: '€7,760 hotel payout', strong: true }], 'After balance is received', 'warning'),
    },
    steps: [
      step({ id: 'kapoor-deposit', title: 'Deposit', sub: 'Customer payment · ₹18,000 received 23 Sep, not matched', amount: 2670, direction: 'in', party: 'customer', status: 'Needs review', tone: 'danger', settled: false, invoiceId: 'inv-kapoor', invoiceLabel: 'View invoice' }),
      step({ id: 'kapoor-balance', title: 'Balance', sub: 'Customer payment · due 20 Nov', amount: 6230, direction: 'in', party: 'customer', status: 'Waiting for customer', tone: 'warning', settled: false, invoiceId: 'inv-kapoor', invoiceLabel: 'View invoice' }),
      step({ id: 'kapoor-hotel', title: 'Hotel payout · money out', sub: 'Tokyo and Kyoto hotels · after the balance is received', amount: -7760, direction: 'out', party: 'hotel', status: 'Scheduled', tone: 'neutral', settled: false, invoiceId: 'hinv-kapoor', invoiceLabel: 'View hotel invoice' }),
      step({ id: 'kapoor-commission', title: 'Agency commission', sub: 'From the hotels · after the stay', amount: 1140, direction: 'in', party: 'hotel', status: 'Awaiting payment', tone: 'neutral', settled: false, invoiceId: 'comm-kapoor', invoiceLabel: 'View commission statement' }),
    ],
    chat: [
      { id: 'k1', from: 'agent', text: '₹18,000 arrived on 23 Sep and could belong to two bookings. I need your call before matching it.', at: 'Today 08:55' },
    ],
    quickReplies: ['Which two bookings?', 'View invoice'],
  },
];

interface PastSeed {
  id: string;
  customerId: string;
  customerName: string;
  stay: string;
  dates: string;
  nights: number;
  value: number;
  commission: number;
  deposit: number;
  /** Dates the deposit, balance, payout and commission settled. */
  on: [string, string, string, string];
}

const money = (n: number) => `€${n.toLocaleString('en-GB')}`;

/** A finished booking: every step settled, nothing left to do. */
function pastBooking(p: PastSeed): Booking {
  const balance = p.value - p.deposit;
  const payout = p.value - p.commission;
  return {
    id: p.id,
    customerId: p.customerId,
    customerName: p.customerName,
    stay: p.stay,
    trip: `${p.stay} · ${p.dates} · ${p.nights} nights`,
    dates: p.dates,
    nights: p.nights,
    value: p.value,
    commission: p.commission,
    payout,
    balanceChip: 'All settled',
    balanceTone: 'positive',
    closed: true,
    stages: {
      'pending-customer': card([{ text: p.stay, muted: true }, { text: `${money(p.value)} collected`, strong: true }], 'Paid in full', 'positive'),
      'pending-hotel': card([{ text: p.stay, muted: true }, { text: `${money(p.commission)} commission`, strong: true }], 'Received', 'positive'),
      'to-pay': card([{ text: p.stay, muted: true }, { text: `${money(payout)} hotel payout`, strong: true }], 'Paid', 'positive'),
    },
    steps: [
      step({ id: `${p.id}-deposit`, title: 'Deposit', sub: `Customer payment · received ${p.on[0]}`, amount: p.deposit, direction: 'in', party: 'customer', status: 'Matched', tone: 'positive', settled: true }),
      step({ id: `${p.id}-balance`, title: 'Balance', sub: `Customer payment · received ${p.on[1]}`, amount: balance, direction: 'in', party: 'customer', status: 'Matched', tone: 'positive', settled: true }),
      step({ id: `${p.id}-hotel`, title: 'Hotel payout · money out', sub: `${p.stay} · paid ${p.on[2]}`, amount: -payout, direction: 'out', party: 'hotel', status: 'Paid', tone: 'positive', settled: true }),
      step({ id: `${p.id}-commission`, title: 'Agency commission', sub: `From the hotel · received ${p.on[3]}`, amount: p.commission, direction: 'in', party: 'hotel', status: 'Received', tone: 'positive', settled: true }),
    ],
    chat: [{ id: `${p.id}-c1`, from: 'agent', text: `${p.customerName}'s stay is fully settled. Both customer payments matched, the hotel was paid and our ${money(p.commission)} commission arrived.`, at: p.on[3] }],
    quickReplies: ['Show the payments'],
  };
}

const pastSeeds: PastSeed[] = [
  { id: 'elena', customerId: 'elena', customerName: 'Elena Rossi', stay: 'Hotel Danieli Venice', dates: '12–17 Mar', nights: 5, value: 4800, commission: 576, deposit: 1440, on: ['2 Feb', '1 Mar', '20 Mar', '5 Apr'] },
  { id: 'karim', customerId: 'karim', customerName: 'Karim Adel', stay: 'Villa d’Este, Lake Como', dates: '8–14 Jun', nights: 6, value: 7200, commission: 864, deposit: 2160, on: ['10 Apr', '8 May', '25 Jun', '12 Jul'] },
  { id: 'jonas', customerId: 'jonas', customerName: 'Jonas Weber', stay: 'Zurich lake hotel', dates: '3–7 May', nights: 4, value: 3600, commission: 432, deposit: 1080, on: ['1 Mar', '2 Apr', '14 May', '30 May'] },
  { id: 'hannah', customerId: 'hannah', customerName: 'Hannah Lee', stay: 'Singapore marina hotel', dates: '9–13 Jul', nights: 4, value: 5400, commission: 648, deposit: 1620, on: ['4 May', '6 Jun', '22 Jul', '8 Aug'] },
];

const cancelledTom: Booking = {
  id: 'tom',
  customerId: 'tom',
  customerName: 'Tom Hughes',
  stay: 'Crete villa (cancelled)',
  trip: 'Crete villa · 10–17 Nov · cancelled',
  dates: '10–17 Nov',
  nights: 7,
  value: 0,
  commission: 0,
  payout: 0,
  balanceChip: 'Refund needs your OK',
  balanceTone: 'danger',
  closed: true,
  stages: {
    'pending-customer': card([{ text: 'Crete villa', muted: true }, { text: '€420 to refund', strong: true }], 'Needs your OK', 'danger'),
    'pending-hotel': card([{ text: 'Crete villa', muted: true }, { text: 'No commission', strong: true }], 'Cancelled', 'neutral'),
    'to-pay': card([{ text: 'Crete villa', muted: true }, { text: 'No payout', strong: true }], 'Cancelled', 'neutral'),
  },
  steps: [
    step({ id: 'tom-deposit', title: 'Deposit', sub: 'Customer payment · received 2 Sep', amount: 840, direction: 'in', party: 'customer', status: 'Matched', tone: 'positive', settled: true }),
    step({ id: 'tom-refund', title: 'Refund · money out', sub: 'Cancelled booking · waiting for your OK', amount: -420, direction: 'out', party: 'customer', status: 'Needs review', tone: 'warning', settled: false }),
    step({ id: 'tom-kept', title: 'Cancellation fee kept', sub: 'The other €420 stays with the agency', amount: 420, direction: 'in', party: 'customer', status: 'Kept', tone: 'neutral', settled: true }),
  ],
  chat: [{ id: 'tom-c1', from: 'agent', text: 'Tom cancelled the Crete villa. €420 of his €840 deposit can be refunded, and I need your OK before I send it.', at: 'Today 09:00' }],
  quickReplies: ['Why only €420?'],
};

bookings.push(...pastSeeds.map(pastBooking), cancelledTom);

export const financeRecords: FinanceRecord[] = [
  { id: 'r1', title: 'Aisha Nour — Hotel deposit', sub: 'Ritz-Carlton DIFC · Customer payment', amount: '€1,920', date: '24 Sep', status: 'Matched', tone: 'positive', kind: 'customer', bookingId: 'aisha', customerId: 'aisha' },
  { id: 'r2', title: 'Sharma Family — Supplier invoice', sub: 'Hotel invoice · €250 difference detected', amount: '€4,250', date: 'Due 02 Oct', status: 'Needs review', tone: 'warning', kind: 'supplier', bookingId: 'sharma', customerId: 'sharma' },
  { id: 'r3', title: 'Kapoor Family — Incoming payment', sub: 'Booking match unclear · 2 possible bookings', amount: '₹18,000', date: '23 Sep', status: 'Needs review', tone: 'warning', kind: 'customer', bookingId: 'kapoor', customerId: 'kapoor' },
  { id: 'r4', title: 'Japan booking — Agency commission', sub: 'Hotel commission receivable', amount: '€1,140', date: 'Exp. Nov', status: 'Awaiting payment', tone: 'neutral', kind: 'commission', bookingId: 'kapoor', customerId: 'kapoor' },
  { id: 'r5', title: 'Sharma Family — Deposit', sub: 'Dubai hotel stay · Customer payment', amount: '€2,600', date: '02 Oct', status: 'Matched', tone: 'positive', kind: 'customer', bookingId: 'sharma', customerId: 'sharma' },
  { id: 'r6', title: 'Ritz-Carlton DIFC — Hotel payout', sub: 'Scheduled after the balance arrives', amount: '€5,632', date: 'After 2 Nov', status: 'Scheduled', tone: 'neutral', kind: 'payout', bookingId: 'aisha', customerId: 'aisha' },
  { id: 'r7', title: 'Tom Hughes — Refund', sub: 'Cancelled booking · waiting for your OK', amount: '€420', date: '24 Oct', status: 'Needs review', tone: 'warning', kind: 'refund', bookingId: 'tom', customerId: 'tom' },
  { id: 'r8', title: 'Dubai hotel stay — Agency commission', sub: 'Hotel commission receivable', amount: '€520', date: 'Exp. Nov', status: 'Awaiting payment', tone: 'neutral', kind: 'commission', bookingId: 'sharma', customerId: 'sharma' },
  { id: 'r9', title: 'Ritz-Carlton DIFC — Agency commission', sub: 'Hotel commission receivable', amount: '€768', date: 'Exp. Nov', status: 'Awaiting payment', tone: 'neutral', kind: 'commission', bookingId: 'aisha', customerId: 'aisha' },
  { id: 'r10', title: 'Elena Rossi — Balance', sub: 'Hotel Danieli Venice · Customer payment', amount: '€3,360', date: '01 Mar', status: 'Matched', tone: 'positive', kind: 'customer', bookingId: 'elena', customerId: 'elena' },
  { id: 'r11', title: 'Hotel Danieli Venice — Hotel payout', sub: 'Paid after the balance arrived', amount: '€4,224', date: '20 Mar', status: 'Paid', tone: 'positive', kind: 'payout', bookingId: 'elena', customerId: 'elena' },
  { id: 'r12', title: 'Karim Adel — Balance', sub: 'Villa d’Este, Lake Como · Customer payment', amount: '€5,040', date: '08 May', status: 'Matched', tone: 'positive', kind: 'customer', bookingId: 'karim', customerId: 'karim' },
  { id: 'r13', title: 'Villa d’Este — Agency commission', sub: 'Hotel commission received', amount: '€864', date: '12 Jul', status: 'Received', tone: 'positive', kind: 'commission', bookingId: 'karim', customerId: 'karim' },
  { id: 'r14', title: 'Jonas Weber — Balance', sub: 'Zurich lake hotel · Customer payment', amount: '€2,520', date: '02 Apr', status: 'Matched', tone: 'positive', kind: 'customer', bookingId: 'jonas', customerId: 'jonas' },
  { id: 'r15', title: 'Zurich lake hotel — Hotel payout', sub: 'Paid after the balance arrived', amount: '€3,168', date: '14 May', status: 'Paid', tone: 'positive', kind: 'payout', bookingId: 'jonas', customerId: 'jonas' },
  { id: 'r16', title: 'Hannah Lee — Balance', sub: 'Singapore marina hotel · Customer payment', amount: '€3,780', date: '06 Jun', status: 'Matched', tone: 'positive', kind: 'customer', bookingId: 'hannah', customerId: 'hannah' },
  { id: 'r17', title: 'Singapore marina hotel — Agency commission', sub: 'Hotel commission received', amount: '€648', date: '08 Aug', status: 'Received', tone: 'positive', kind: 'commission', bookingId: 'hannah', customerId: 'hannah' },
];

const financeChipCounts: FinanceSnapshot['chipCounts'] = {
  all: 48,
  customer: 21,
  supplier: 12,
  payout: 6,
  commission: 5,
  refund: 2,
};

export const financeSnapshot: FinanceSnapshot = {
  chipCounts: financeChipCounts,
  paidSoFar: 4520,
  booked: 20500,
};

interface InvoiceSeed {
  id: string;
  number: string;
  kind: Invoice['kind'];
  issued: string;
  billTo: Invoice['billTo'];
  bookingRef: Invoice['bookingRef'];
  lines: Invoice['lines'];
  credits?: Invoice['credits'];
  note: string;
  howToPay: string;
  sent?: boolean;
}

const mkInvoice = (s: InvoiceSeed): Invoice => ({ ...s, credits: s.credits ?? [], sent: s.sent ?? false });

export const invoices: Invoice[] = [
  mkInvoice({
    id: 'inv-aisha',
    number: 'INV-2026-0412',
    kind: 'customer',
    issued: '26 Oct 2026',
    billTo: { name: 'Aisha Nour', place: 'London, United Kingdom', email: 'aisha.nour@example.com' },
    bookingRef: { name: 'Ritz-Carlton DIFC', ref: 'CB-20261020-002', detail: '20–26 Oct · 6 nights' },
    lines: [{ description: 'Ritz-Carlton DIFC · Deluxe room, bed and breakfast', qty: '6 nights', amount: 6400 }],
    credits: [{ label: 'Deposit received 24 Sep', amount: 1920 }],
    note: 'Balance of €4,480 due by 2 Nov 2026',
    howToPay: `${IBAN}\nPlease use INV-2026-0412 as the payment reference.`,
    sent: true,
  }),
  mkInvoice({
    id: 'inv-sharma',
    number: 'INV-2026-0413',
    kind: 'customer',
    issued: '26 Oct 2026',
    billTo: { name: 'Sharma Family', place: 'Mumbai, India', email: 'sharma.family@example.com' },
    bookingRef: { name: 'Dubai hotel stay', ref: 'CB-20261110-004', detail: '10–15 Nov · 5 nights' },
    lines: [{ description: 'Dubai hotel stay · Family suite, half board', qty: '5 nights', amount: 5200 }],
    credits: [{ label: 'Deposit received 2 Oct', amount: 2600 }],
    note: 'Balance of €2,600 due by 14 Nov 2026',
    howToPay: `${IBAN}\nPlease use INV-2026-0413 as the payment reference.`,
    sent: true,
  }),
  mkInvoice({
    id: 'inv-kapoor',
    number: 'INV-2026-0414',
    kind: 'customer',
    issued: '26 Oct 2026',
    billTo: { name: 'Kapoor Family', place: 'Delhi, India', email: 'kapoor.family@example.com' },
    bookingRef: { name: 'Japan booking', ref: 'CB-20261203-006', detail: '3–12 Dec · 9 nights' },
    lines: [
      { description: 'Tokyo · 4 nights, superior twin, breakfast', qty: '4 nights', amount: 3600 },
      { description: 'Kyoto · 5 nights, machiya stay, breakfast', qty: '5 nights', amount: 5300 },
    ],
    note: 'Deposit of ₹18,000 received on 23 Sep is waiting to be matched to this booking.',
    howToPay: `${IBAN}\nPlease use INV-2026-0414 as the payment reference.`,
  }),
  mkInvoice({
    id: 'hinv-aisha',
    number: 'RC-88231',
    kind: 'hotel',
    issued: '27 Oct 2026',
    billTo: { name: 'Ali Travel & Tours', place: 'Business Bay, Dubai, UAE', email: 'accounts@alitravel.example' },
    bookingRef: { name: 'Ritz-Carlton DIFC', ref: 'CB-20261020-002', detail: '20–26 Oct · 6 nights' },
    lines: [{ description: 'Deluxe room · 6 nights at the net rate', qty: '6 nights', amount: 5632 }],
    note: 'Net rate after commission. Payable after the guest balance is received.',
    howToPay: 'Hotel remittance details are on file. Payment is scheduled by Finance.',
  }),
  mkInvoice({
    id: 'hinv-sharma',
    number: 'DH-40517',
    kind: 'hotel',
    issued: '25 Oct 2026',
    billTo: { name: 'Ali Travel & Tours', place: 'Business Bay, Dubai, UAE', email: 'accounts@alitravel.example' },
    bookingRef: { name: 'Dubai hotel stay', ref: 'CB-20261110-004', detail: '10–15 Nov · 5 nights' },
    lines: [
      { description: 'Family suite · 5 nights at the agreed rate (€800)', qty: '5 nights', amount: 4000 },
      { description: 'Rate difference charged by the hotel', qty: '1', amount: 250 },
    ],
    note: 'The hotel charged €250 more than the agreed rate. Payment is on hold until you decide.',
    howToPay: 'Hotel remittance details are on file. Payment is on hold.',
  }),
  mkInvoice({
    id: 'hinv-kapoor',
    number: 'JP-20931',
    kind: 'hotel',
    issued: '27 Oct 2026',
    billTo: { name: 'Ali Travel & Tours', place: 'Business Bay, Dubai, UAE', email: 'accounts@alitravel.example' },
    bookingRef: { name: 'Japan booking', ref: 'CB-20261203-006', detail: '3–12 Dec · 9 nights' },
    lines: [{ description: 'Tokyo and Kyoto hotels · 9 nights at net rates', qty: '9 nights', amount: 7760 }],
    note: 'Payable after the guest balance is received.',
    howToPay: 'Hotel remittance details are on file.',
  }),
  mkInvoice({
    id: 'comm-aisha',
    number: 'COM-0412',
    kind: 'commission',
    issued: 'Expected after the stay',
    billTo: { name: 'Ritz-Carlton DIFC', place: 'Dubai International Financial Centre', email: 'sales@ritz.example' },
    bookingRef: { name: 'Aisha Nour', ref: 'CB-20261020-002', detail: '20–26 Oct · 6 nights' },
    lines: [{ description: 'Agency commission · 12% of €6,400', qty: '1', amount: 768 }],
    note: 'Paid by the hotel after the guest checks out. Not part of the customer balance.',
    howToPay: 'Commission is received by bank transfer from the hotel.',
  }),
  mkInvoice({
    id: 'comm-sharma',
    number: 'COM-0413',
    kind: 'commission',
    issued: 'Expected after the stay',
    billTo: { name: 'Dubai hotel', place: 'Dubai, UAE', email: 'sales@dubaihotel.example' },
    bookingRef: { name: 'Sharma Family', ref: 'CB-20261110-004', detail: '10–15 Nov · 5 nights' },
    lines: [{ description: 'Agency commission · 10% of €5,200', qty: '1', amount: 520 }],
    note: 'Paid by the hotel after the guest checks out. Not part of the customer balance.',
    howToPay: 'Commission is received by bank transfer from the hotel.',
  }),
  mkInvoice({
    id: 'comm-kapoor',
    number: 'COM-0414',
    kind: 'commission',
    issued: 'Expected November',
    billTo: { name: 'Japan hotels', place: 'Tokyo and Kyoto', email: 'agents@japanhotels.example' },
    bookingRef: { name: 'Kapoor Family', ref: 'CB-20261203-006', detail: '3–12 Dec · 9 nights' },
    lines: [{ description: 'Agency commission · 13% of €8,900', qty: '1', amount: 1140 }],
    note: 'Paid by the hotels after the guests check out. Not part of the customer balance.',
    howToPay: 'Commission is received by bank transfer from the hotels.',
  }),
];
