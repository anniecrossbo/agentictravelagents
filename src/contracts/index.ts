/**
 * Typed contracts for everything Luna reads from a backend.
 * src/mocks implements these today; engineers swap the implementation behind `LunaApi` later.
 */

export type AgentId = 'sales' | 'designer' | 'supplier' | 'reservations' | 'finance' | 'marketing';
export type AgentStatus = 'working' | 'waiting' | 'needs-you' | 'caught-up' | 'paused';
export type Tone = 'neutral' | 'positive' | 'warning' | 'danger' | 'brand' | 'info';

export interface Portrait {
  /** URL of the teammate's illustrated portrait. */
  src: string;
}

export interface ChatMessage {
  id: string;
  from: 'agent' | 'user';
  text: string;
  at: string;
}

export type ContactKind = 'hotel' | 'supplier' | 'customer';
export type Channel = 'whatsapp' | 'email';

/** Someone outside the agency you talk to: a hotel, a supplier or a customer. One conversation each. */
export interface Contact {
  id: string;
  name: string;
  initials: string;
  tone: 1 | 2 | 3 | 4 | 5 | 6;
  kind: ContactKind;
  vip: boolean;
  /** Booking reference and dates, or what the relationship covers. */
  context: string;
  preview: string;
  at: string;
  unread: number;
}

export interface ConversationMessage {
  id: string;
  /** contact: they wrote it; staff: you; luna: one of your AI teammates sent it for you. */
  from: 'contact' | 'staff' | 'luna';
  sender: string;
  agentId?: AgentId;
  text: string;
  /** Emails only. */
  subject?: string;
  /** File names attached to this message. */
  attachments?: string[];
  /** Day label shown in the divider, e.g. "Today". */
  day: string;
  time: string;
  channel: Channel;
}

export interface Conversation {
  contactId: string;
  summary: { text: string; nextStep?: string; generatedAt: string };
  messages: ConversationMessage[];
  /** The channel the contact last used, so replies default to it. */
  replyChannel: Channel;
}

export interface OutgoingMessage {
  channel: Channel;
  text: string;
  /** Required for email. */
  subject?: string;
  /** Set when a teammate sends it instead of you. */
  agentId?: AgentId;
}

export interface Agent {
  id: AgentId;
  name: string;
  tagline: string;
  portrait: Portrait;
  status: AgentStatus;
  overview: string;
  quickReplies: string[];
  /** Whether the teammate is switched on in Settings. */
  enabled: boolean;
}

export interface PlanStep {
  id: string;
  title: string;
  detail: string;
  state: 'done' | 'working' | 'needs-you' | 'not-started';
  when?: string;
}

export interface CaseAction {
  id: string;
  label: string;
  primary: boolean;
  /** Plan step this action completes; the next step becomes the active one. */
  completesStepId?: string;
}

export interface AgentCase {
  id: string;
  agentId: AgentId;
  customerId: string;
  title: string;
  meta: string;
  summary: string;
  status: AgentStatus;
  plan: PlanStep[];
  need?: { heading: string; body: string; next: string; actions: CaseAction[] };
}

export interface PipelineCard {
  id: string;
  agentId: AgentId;
  customerId: string;
  name: string;
  trip: string;
  proposals: string;
  note: string;
  tone: 'ok' | 'waiting' | 'needs';
}

export interface DecisionAction {
  id: string;
  label: string;
  primary: boolean;
  outcome: string;
}

export type DecisionScope = 'general' | 'finance' | 'supplier';

export interface Decision {
  id: string;
  scope: DecisionScope;
  agentId: AgentId;
  title: string;
  body: string;
  severity: 'danger' | 'warning';
  actions: DecisionAction[];
  /** Set once the user has picked an outcome. */
  resolvedWith?: string;
}

/** A trip the customer asked about. */
export interface Enquiry {
  id: string;
  ref: string;
  title: string;
  location: string;
  dates: string;
  nights: number;
  travellers: string;
  status: string;
  tone: Tone;
  summary: string;
  itineraryId?: string;
}

/** A trip booked for the customer. */
export interface CustomerBooking {
  id: string;
  ref: string;
  title: string;
  location: string;
  dates: string;
  nights: number;
  travellers: string;
  amount: string;
  status: string;
  tone: Tone;
  summary: string;
  itineraryId?: string;
  /** The finance booking behind it, when payments are tracked. */
  financeBookingId?: string;
  invoiceIds?: string[];
}

export interface EnquiryInput {
  title: string;
  location: string;
  dates: string;
  nights: number;
}

export interface BookingInput extends EnquiryInput {
  amount: string;
}

export interface TravellerInput {
  name: string;
  role: string;
}

export interface Preference {
  id: string;
  text: string;
  /** customer: they said so; agency: you noted it; noticed: a teammate spotted it and wants a yes or no. */
  source: 'customer' | 'agency' | 'noticed';
  /** Why it is up for review, when source is "noticed". */
  note?: string;
}

export interface TravelPartyMember {
  id: string;
  name: string;
  initials: string;
  tone: 1 | 2 | 3 | 4 | 5 | 6;
  role: string;
}

export interface ActivityStep {
  stage: string;
  title: string;
  detail: string;
  state: PlanStep['state'];
  when?: string;
}

export interface Customer {
  id: string;
  name: string;
  initials: string;
  tone: 1 | 2 | 3 | 4 | 5 | 6;
  location: string;
  email: string;
  phone: string;
  stage: string;
  headline: string;
  agentId: AgentId;
  vip: boolean;
  upcoming: boolean;
  travellingNow: boolean;
  needsInput: boolean;
  history: string;
  enquiries: Enquiry[];
  overview: string;
  preferences: Preference[];
  party: TravelPartyMember[];
  notes: { id: string; author: string; at: string; text: string }[];
  bookings: CustomerBooking[];
  timeline: { id: string; at: string; text: string; agentId?: AgentId; state?: 'done' | 'waiting' | 'received' }[];
  documents: { id: string; name: string; kind: string; added: string; invoiceId?: string }[];
  activity: Partial<Record<AgentId, ActivityStep[]>>;
  /** Trip this customer's itinerary is built for, if one exists. */
  itineraryId?: string;
}

export interface FinanceRecord {
  id: string;
  title: string;
  sub: string;
  amount: string;
  date: string;
  status: string;
  tone: Tone;
  kind: 'customer' | 'supplier' | 'payout' | 'commission' | 'refund';
  bookingId?: string;
  /** The guest this record belongs to. */
  customerId: string;
}

export interface CashflowStep {
  id: string;
  title: string;
  sub: string;
  amount: number;
  direction: 'in' | 'out';
  /** Who the money moves with: the customer or the hotel/supplier. */
  party: 'customer' | 'hotel';
  status: string;
  tone: Tone;
  /** Settled steps count towards "paid so far". */
  settled: boolean;
  invoiceId?: string;
  invoiceLabel?: string;
}

export type FinanceStage = 'pending-customer' | 'pending-hotel' | 'to-pay';

export interface StageCard {
  lines: { text: string; strong?: boolean; muted?: boolean }[];
  chip: string;
  chipTone: Tone;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  stay: string;
  trip: string;
  dates: string;
  nights: number;
  stages: Record<FinanceStage, StageCard>;
  value: number;
  commission: number;
  payout: number;
  /** Header chip on the cashflow popup. */
  balanceChip: string;
  balanceTone: Tone;
  /** Past booking that no longer needs action. It stays viewable from its records. */
  closed?: boolean;
  steps: CashflowStep[];
  chat: ChatMessage[];
  quickReplies: string[];
}

export interface InvoiceLine {
  description: string;
  qty: string;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  kind: 'customer' | 'hotel' | 'commission';
  issued: string;
  billTo: { name: string; place: string; email: string };
  bookingRef: { name: string; ref: string; detail: string };
  lines: InvoiceLine[];
  /** Positive numbers that reduce what is owed (e.g. deposit received). */
  credits: { label: string; amount: number }[];
  note: string;
  howToPay: string;
  sent: boolean;
}

/** An extra rate code on a room, besides the best available rate. */
export interface RoomRate {
  id: string;
  name: string;
  /** Short code such as PKG or NR. */
  code: string;
  tone: Tone;
  terms: string;
  netRate: number;
  /** Percent commission the agency earns on this rate. */
  commission: number;
}

export interface RoomType {
  id: string;
  name: string;
  code: string;
  sleeps: string;
  size: string;
  scene: string;
  availability: string;
  amenities: string[];
  blurb: string;
  netRate: number;
  suggested: number;
  /** Other rate codes available for this room. */
  rates: RoomRate[];
  /** Rooms left on each of the next 14 days, starting today. */
  inventory: number[];
}

export interface SupplierItem {
  id: string;
  name: string;
  meta: string;
  blurb: string;
  price: string;
  note: string;
  scene: string;
}

export interface SupplierBooking {
  id: string;
  customer: string;
  detail: string;
  dates: string;
  amount: string;
  status: string;
  tone: Tone;
}

export type SupplierCategory = 'hotel' | 'experience' | 'transfer' | 'flight' | 'cruise' | 'dmc';

export interface Supplier {
  id: string;
  name: string;
  initials: string;
  tone: 1 | 2 | 3 | 4 | 5 | 6;
  category: SupplierCategory;
  place: string;
  status: string;
  statusTone: Tone;
  earned: number | null;
  phone: string;
  email: string;
  rating: number | null;
  badges: { label: string; tone: Tone }[];
  facts: { label: string; value: string }[];
  /** Tab 1 items: rooms for hotels, activities for experiences, vehicles for transfers. */
  catalogue: SupplierItem[];
  rooms: RoomType[];
  /** Tab 2 items: experiences for hotels, departures for experiences, routes for transfers. */
  secondary: SupplierItem[];
  bookings: SupplierBooking[];
  info: { label: string; value: string }[];
}

export interface ItineraryItem {
  id: string;
  kind: 'flight' | 'transfer' | 'stay' | 'experience';
  title: string;
  detail: string;
  estimate: string;
  price: string;
  status: string;
  tone: Tone;
  scene?: string;
}

export interface ItineraryDay {
  id: string;
  weekday: string;
  day: number;
  month: string;
  place: string;
  label: string;
  items: ItineraryItem[];
}

export interface Itinerary {
  id: string;
  customerId: string;
  title: string;
  status: string;
  meta: string;
  scene: string;
  intro: string;
  options: { id: string; label: string; days: ItineraryDay[] }[];
}

export type LunaBlock =
  | { type: 'text'; text: string }
  | {
      type: 'result';
      title: string;
      body: string;
      rows: { label: string; value: string }[];
      note: string;
      noteRight?: string;
      actions: { label: string; primary?: boolean }[];
    }
  | { type: 'chart'; title: string; subtitle: string; bars: { label: string; value: number; display: string }[] };

export interface LunaMessage {
  id: string;
  from: 'user' | 'luna';
  blocks: LunaBlock[];
}

export interface LunaThreadSummary {
  id: string;
  title: string;
  /** Group heading in the history list: Today, Yesterday or a date. */
  group: string;
  when: string;
}

export interface LunaThread extends LunaThreadSummary {
  messages: LunaMessage[];
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  agency: string;
  currency: string;
  timeZone: string;
  alertOnDecision: boolean;
}

export interface InvoiceTemplate {
  agencyName: string;
  address: string;
  contact: string;
  bankDetails: string;
  numbering: string;
  footer: string;
  showCommissionNote: boolean;
}

export interface ItineraryTemplate {
  opening: string;
  signOff: string;
  showPictures: boolean;
  showPrices: boolean;
  estimateNote: string;
}

export interface Settings {
  profile: UserProfile;
  agentsEnabled: Record<AgentId, boolean>;
  whatsapp: { connected: boolean; number: string };
  email: { connected: boolean; address: string; signature: string; readReplies: boolean };
  invoiceTemplate: InvoiceTemplate;
  itineraryTemplate: ItineraryTemplate;
  templatesEdited: { invoice: string; itinerary: string };
}

export interface SnapshotMetric {
  label: string;
  value: string;
  tone?: Tone;
  note?: string;
}

export interface CustomerSnapshot {
  /** Share of guests who have booked before, as shown (e.g. "46%"). */
  repeatGuests: string;
  chipCounts: Record<'all' | 'upcoming' | 'travelling' | 'needs' | 'vip', number>;
}

export interface FinanceSnapshot {
  paidSoFar: number;
  booked: number;
  chipCounts: Record<'all' | FinanceRecord['kind'], number>;
}

export interface CommissionBar {
  label: string;
  value: number;
}

export interface CommissionSummary {
  total: number;
  thisMonth: number;
  bars: CommissionBar[];
  chipCounts: Record<'all' | SupplierCategory, number>;
}

/** The single seam between UI and backend. */
export interface LunaApi {
  subscribe(listener: () => void): () => void;

  getAgents(): Promise<Agent[]>;
  getPipeline(): Promise<PipelineCard[]>;
  getAgentCases(agentId: AgentId): Promise<AgentCase[]>;
  completeCaseStep(caseId: string, actionId: string): Promise<void>;

  getDecisions(scope: DecisionScope | 'all'): Promise<Decision[]>;
  resolveDecision(decisionId: string, actionId: string): Promise<void>;

  getThread(threadId: string): Promise<ChatMessage[]>;
  sendMessage(threadId: string, agentId: AgentId, text: string): Promise<void>;
  getLunaThreads(): Promise<LunaThreadSummary[]>;
  getLunaThread(id: string): Promise<LunaThread | undefined>;
  /** Sends a question to Luna. Starts a new chat when threadId is empty. Returns the chat's id. */
  askLuna(threadId: string | undefined, text: string): Promise<string>;
  getContacts(): Promise<Contact[]>;
  getConversation(contactId: string): Promise<Conversation | undefined>;
  sendContactMessage(contactId: string, message: OutgoingMessage): Promise<void>;
  markChatRead(contactId: string): Promise<void>;

  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerSnapshot(): Promise<CustomerSnapshot>;
  addNote(customerId: string, text: string): Promise<void>;
  addPreference(customerId: string, text: string): Promise<void>;
  resolvePreference(customerId: string, preferenceId: string, decision: 'confirm' | 'dismiss'): Promise<void>;
  addTraveller(customerId: string, input: TravellerInput): Promise<void>;
  addEnquiry(customerId: string, input: EnquiryInput): Promise<void>;
  addBooking(customerId: string, input: BookingInput): Promise<void>;
  convertToBooking(customerId: string, enquiryId: string): Promise<void>;
  /** Starts a draft itinerary for an enquiry or booking and returns its id. */
  createItinerary(customerId: string, source: { kind: 'enquiry' | 'booking'; id: string }): Promise<string | undefined>;

  getFinanceRecords(): Promise<FinanceRecord[]>;
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getFinanceSnapshot(): Promise<FinanceSnapshot>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  sendInvoice(id: string): Promise<void>;

  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  getCommissionSummary(): Promise<CommissionSummary>;

  getItinerary(id: string): Promise<Itinerary | undefined>;

  getSettings(): Promise<Settings>;
  saveSettings(patch: Partial<Settings>): Promise<void>;
  setAgentEnabled(agentId: AgentId, enabled: boolean): Promise<void>;
}
