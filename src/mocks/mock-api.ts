import type {
  Agent,
  AgentCase,
  AgentId,
  Booking,
  ChatMessage,
  CommissionSummary,
  Contact,
  Conversation,
  ConversationMessage,
  Customer,
  CustomerSnapshot,
  CustomerBooking,
  Enquiry,
  Itinerary,
  LunaMessage,
  LunaThread,
  Preference,
  TravelPartyMember,
  Decision,
  DecisionScope,
  LunaApi,
  PlanStep,
  Settings,
} from '@/contracts';
import { storage } from '@/adapters/storage';
import { formatStamp } from '@/lib/format';
import { draftDays } from '@/lib/itinerary';
import { completeStep, stepsDone } from '@/lib/plan';
import { agentCases, agentMessages, agents, decisions, pipeline } from './agents';
import { contactList, conversations, seedUnread } from './contacts';
import { lunaReply, lunaSeeds, titleFrom } from './luna';
import { customers } from './customers';
import { bookings, financeRecords, financeSnapshot, invoices } from './finance';
import { itineraries } from './itineraries';
import { replyFromContact, replyTo } from './replies';
import { defaultSettings } from './settings';
import { commissionBars, supplierChipCounts, suppliers } from './suppliers';

interface PersistedState {
  resolved: Record<string, string>;
  casePlans: Record<string, PlanStep[]>;
  threads: Record<string, ChatMessage[]>;
  notes: Record<string, { id: string; author: string; at: string; text: string }[]>;
  customerPrefs: Record<string, Preference[]>;
  addedParty: Record<string, TravelPartyMember[]>;
  addedEnquiries: Record<string, Enquiry[]>;
  addedBookings: Record<string, CustomerBooking[]>;
  bookedEnquiries: string[];
  createdItineraries: Itinerary[];
  lunaCreated: LunaThread[];
  lunaExtra: Record<string, LunaMessage[]>;
  itineraryLinks: Record<string, string>;
  sentInvoices: string[];
  readContacts: string[];
  contactMessages: Record<string, ConversationMessage[]>;
  settings: Settings;
}

const STATE_KEY = 'state.v1';

function loadState(): PersistedState {
  const saved = storage.get<PersistedState>(STATE_KEY);
  return {
    resolved: saved?.resolved ?? {},
    casePlans: saved?.casePlans ?? {},
    threads: saved?.threads ?? {},
    notes: saved?.notes ?? {},
    customerPrefs: saved?.customerPrefs ?? {},
    addedParty: saved?.addedParty ?? {},
    addedEnquiries: saved?.addedEnquiries ?? {},
    addedBookings: saved?.addedBookings ?? {},
    bookedEnquiries: saved?.bookedEnquiries ?? [],
    createdItineraries: saved?.createdItineraries ?? [],
    lunaCreated: saved?.lunaCreated ?? [],
    lunaExtra: saved?.lunaExtra ?? {},
    itineraryLinks: saved?.itineraryLinks ?? {},
    sentInvoices: saved?.sentInvoices ?? [],
    readContacts: saved?.readContacts ?? [],
    contactMessages: saved?.contactMessages ?? {},
    settings: saved?.settings ?? defaultSettings,
  };
}

const delay = <T,>(value: T): Promise<T> => Promise.resolve(value);

function threadSeed(threadId: string): ChatMessage[] {
  const [kind, id] = threadId.split(':');
  if (kind === 'agent') return agentMessages[id as AgentId] ?? [];
  if (kind === 'booking') return bookings.find((b) => b.id === id)?.chat ?? [];
  return [];
}

export function createMockApi(): LunaApi {
  let state = loadState();
  const listeners = new Set<() => void>();

  const commit = (next: PersistedState) => {
    state = next;
    storage.set(STATE_KEY, state);
    listeners.forEach((l) => l());
  };

  const nowStamp = () => formatStamp(new Date());

  const viewCase = (c: AgentCase): AgentCase => {
    const plan = state.casePlans[c.id] ?? c.plan;
    const needsYou = plan.some((s) => s.state === 'needs-you');
    const metaHead = c.meta.split(' · ').filter((p) => !/^\d+ of \d+ steps$/.test(p));
    const meta = c.plan.length > 3 || /steps$/.test(c.meta) ? [...metaHead, `${stepsDone(plan)} of ${plan.length} steps`].join(' · ') : c.meta;
    const resolved = c.need && !needsYou;
    return {
      ...c,
      plan,
      meta,
      status: needsYou ? 'needs-you' : c.status === 'needs-you' ? 'working' : c.status,
      need: resolved ? undefined : c.need,
    };
  };

  const decisionView = (d: Decision): Decision => ({ ...d, resolvedWith: state.resolved[d.id] });

  const pushMessage = (threadId: string, message: ChatMessage) => {
    const existing = state.threads[threadId] ?? threadSeed(threadId);
    return { ...state.threads, [threadId]: [...existing, message] };
  };

  const agentThread = (agentId: AgentId) => `agent:${agentId}`;

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    getAgents() {
      const unresolvedFinance = decisions.filter((d) => d.scope === 'finance' && !state.resolved[d.id]).length;
      const list: Agent[] = agents.map((a) => {
        const enabled = state.settings.agentsEnabled[a.id];
        let status = a.status;
        if (a.id === 'finance') status = unresolvedFinance > 0 ? 'needs-you' : 'working';
        return { ...a, enabled, status: enabled ? status : 'paused' };
      });
      return delay(list);
    },

    getPipeline() {
      return delay(pipeline.filter((p) => state.settings.agentsEnabled[p.agentId]));
    },

    getAgentCases(agentId) {
      return delay(agentCases.filter((c) => c.agentId === agentId).map(viewCase));
    },

    async completeCaseStep(caseId, actionId) {
      const c = agentCases.find((x) => x.id === caseId);
      const action = c?.need?.actions.find((a) => a.id === actionId);
      if (!c || !action) return;
      const current = state.casePlans[caseId] ?? c.plan;
      if (action.completesStepId) {
        const casePlans = { ...state.casePlans, [caseId]: completeStep(current, action.completesStepId, `Done · ${nowStamp()}`) };
        const customer = customers.find((x) => x.id === c.customerId);
        const text = `Done: ${action.label.toLowerCase()} for ${customer?.name ?? 'the customer'}. I've moved on to the next step.`;
        commit({
          ...state,
          casePlans,
          threads: pushMessage(agentThread(c.agentId), { id: `m-${Date.now()}`, from: 'agent', text, at: nowStamp() }),
        });
      } else {
        const text = "No problem. I'll hold this until you've made your changes.";
        commit({ ...state, threads: pushMessage(agentThread(c.agentId), { id: `m-${Date.now()}`, from: 'agent', text, at: nowStamp() }) });
      }
    },

    getDecisions(scope: DecisionScope | 'all') {
      const visible = decisions.filter((d) => (scope === 'all' || d.scope === scope) && state.settings.agentsEnabled[d.agentId]);
      return delay(visible.map(decisionView));
    },

    async resolveDecision(decisionId, actionId) {
      const d = decisions.find((x) => x.id === decisionId);
      const action = d?.actions.find((a) => a.id === actionId);
      if (!d || !action) return;
      commit({
        ...state,
        resolved: { ...state.resolved, [decisionId]: action.outcome },
        threads: pushMessage(agentThread(d.agentId), { id: `m-${Date.now()}`, from: 'agent', text: action.outcome, at: nowStamp() }),
      });
    },

    getThread(threadId) {
      return delay(state.threads[threadId] ?? threadSeed(threadId));
    },

    async sendMessage(threadId, agentId, text) {
      const mine: ChatMessage = { id: `u-${Date.now()}`, from: 'user', text, at: nowStamp() };
      const afterUser = pushMessage(threadId, mine);
      commit({ ...state, threads: afterUser });
      // PROTO: the teammate "answers" instantly from canned rules; a real one would reply asynchronously.
      const reply: ChatMessage = { id: `a-${Date.now()}`, from: 'agent', text: replyTo(agentId, text), at: nowStamp() };
      const existing = state.threads[threadId] ?? [];
      commit({ ...state, threads: { ...state.threads, [threadId]: [...existing, reply] } });
    },

    getLunaThreads() {
      const all = [...state.lunaCreated, ...lunaSeeds];
      return delay(all.map(({ id, title, group, when }) => ({ id, title, group, when })));
    },

    getLunaThread(id) {
      const found = [...state.lunaCreated, ...lunaSeeds].find((t) => t.id === id);
      if (!found) return delay(undefined);
      return delay({ ...found, messages: [...found.messages, ...(state.lunaExtra[id] ?? [])] });
    },

    async askLuna(threadId, text) {
      const stamp = Date.now();
      const asked: LunaMessage = { id: `lu-${stamp}`, from: 'user', blocks: [{ type: 'text', text }] };
      const answered: LunaMessage = { id: `ll-${stamp}`, from: 'luna', blocks: lunaReply(text) };
      if (!threadId) {
        const created: LunaThread = { id: `luna-${stamp}`, title: titleFrom(text), group: 'Today', when: 'just now', messages: [asked, answered] };
        commit({ ...state, lunaCreated: [created, ...state.lunaCreated] });
        return created.id;
      }
      commit({ ...state, lunaExtra: { ...state.lunaExtra, [threadId]: [...(state.lunaExtra[threadId] ?? []), asked, answered] } });
      return threadId;
    },

    getContacts() {
      const view: Contact[] = contactList.map((c) => {
        const sent = state.contactMessages[c.id] ?? [];
        const last = sent.at(-1);
        return {
          ...c,
          preview: last?.text ?? c.preview,
          at: last ? `${last.day} ${last.time}` : c.at,
          unread: state.readContacts.includes(c.id) ? 0 : (seedUnread[c.id] ?? 0),
        };
      });
      return delay(view);
    },

    getConversation(contactId) {
      const base = conversations[contactId];
      if (!base) return delay(undefined);
      const view: Conversation = { ...base, messages: [...base.messages, ...(state.contactMessages[contactId] ?? [])] };
      return delay(view);
    },

    async sendContactMessage(contactId, outgoing) {
      const contact = contactList.find((c) => c.id === contactId);
      if (!contact) return;
      const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const stamp = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = state.contactMessages[contactId] ?? [];
      const subject = outgoing.channel === 'email' ? outgoing.subject?.trim() : undefined;
      const agent = outgoing.agentId ? agents.find((a) => a.id === outgoing.agentId) : undefined;
      const sent: ConversationMessage = {
        id: `out-${stamp()}`,
        from: agent ? 'luna' : 'staff',
        sender: agent?.name ?? 'Hameed',
        agentId: outgoing.agentId,
        text: outgoing.text,
        subject,
        day: 'Today',
        time,
        channel: outgoing.channel,
      };
      // PROTO: the contact "answers" instantly on the same channel with a canned line; a real one would reply in their own time.
      const reply: ConversationMessage = {
        id: `in-${stamp()}`,
        from: 'contact',
        sender: contact.name,
        text: replyFromContact(contact.kind, outgoing.text),
        subject: subject ? (subject.startsWith('Re:') ? subject : `Re: ${subject}`) : undefined,
        day: 'Today',
        time,
        channel: outgoing.channel,
      };
      commit({ ...state, contactMessages: { ...state.contactMessages, [contactId]: [...existing, sent, reply] } });
    },

    async markChatRead(contactId) {
      if (state.readContacts.includes(contactId)) return;
      commit({ ...state, readContacts: [...state.readContacts, contactId] });
    },

    getCustomers() {
      return delay(customers);
    },

    getCustomer(id) {
      const customer = customers.find((c) => c.id === id);
      if (!customer) return delay(undefined);
      const extra = state.notes[id] ?? [];
      const enquiries: Enquiry[] = [...customer.enquiries, ...(state.addedEnquiries[id] ?? [])].map((e) => ({ ...(state.bookedEnquiries.includes(e.id) ? { ...e, status: 'Booked', tone: 'positive' as const } : e), itineraryId: state.itineraryLinks[e.id] ?? e.itineraryId }));
      const merged: Customer = {
        ...customer,
        notes: [...extra, ...customer.notes],
        preferences: state.customerPrefs[id] ?? customer.preferences,
        party: [...customer.party, ...(state.addedParty[id] ?? [])],
        enquiries,
        bookings: [...customer.bookings, ...(state.addedBookings[id] ?? [])].map((b) => ({ ...b, itineraryId: state.itineraryLinks[b.id] ?? b.itineraryId })),
        itineraryId: enquiries[0]?.itineraryId ?? customer.itineraryId,
      };
      return delay(merged);
    },

    getCustomerSnapshot() {
      const snapshot: CustomerSnapshot = {
        repeatGuests: '46%',
        chipCounts: { all: 1345, upcoming: 31, travelling: 4, needs: 6, vip: 48 },
      };
      return delay(snapshot);
    },

    async addPreference(customerId, text) {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) return;
      const list = state.customerPrefs[customerId] ?? customer.preferences;
      const pref: Preference = { id: `${customerId}-p-${Date.now()}`, text, source: 'agency' };
      commit({ ...state, customerPrefs: { ...state.customerPrefs, [customerId]: [...list, pref] } });
    },

    async resolvePreference(customerId, preferenceId, decision) {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) return;
      const list = state.customerPrefs[customerId] ?? customer.preferences;
      const next = decision === 'dismiss' ? list.filter((p) => p.id !== preferenceId) : list.map((p) => (p.id === preferenceId ? { ...p, source: 'agency' as const, note: undefined } : p));
      commit({ ...state, customerPrefs: { ...state.customerPrefs, [customerId]: next } });
    },

    async addTraveller(customerId, input) {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) return;
      const initials = input.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
      const tone = ((((state.addedParty[customerId]?.length ?? 0) + customer.party.length) % 6) + 1) as TravelPartyMember['tone'];
      const member: TravelPartyMember = { id: `${customerId}-m-${Date.now()}`, name: input.name, initials, tone, role: input.role };
      commit({ ...state, addedParty: { ...state.addedParty, [customerId]: [...(state.addedParty[customerId] ?? []), member] } });
    },

    async addEnquiry(customerId, input) {
      const digits = String(Math.floor(1000 + Math.random() * 9000));
      const enquiry: Enquiry = {
        id: `${customerId}-enq-${Date.now()}`,
        ref: `EQ-2026-${digits}`,
        title: input.title,
        location: input.location,
        dates: input.dates,
        nights: input.nights,
        travellers: customers.find((c) => c.id === customerId)?.party.length === 1 ? 'One traveller' : 'Two or more travellers',
        status: 'New enquiry',
        tone: 'brand',
        summary: 'Added by Hameed.',
      };
      commit({ ...state, addedEnquiries: { ...state.addedEnquiries, [customerId]: [...(state.addedEnquiries[customerId] ?? []), enquiry] } });
    },

    async addBooking(customerId, input) {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) return;
      const digits = String(Math.floor(1000 + Math.random() * 9000));
      const booking: CustomerBooking = {
        id: `${customerId}-book-${Date.now()}`,
        ref: `BK-${digits}0`,
        title: input.title,
        location: input.location,
        dates: input.dates,
        nights: input.nights,
        travellers: `${customer.party.length} ${customer.party.length === 1 ? 'traveller' : 'travellers'}`,
        amount: input.amount,
        status: 'Confirmed',
        tone: 'positive',
        summary: 'Added by Hameed.',
      };
      commit({ ...state, addedBookings: { ...state.addedBookings, [customerId]: [...(state.addedBookings[customerId] ?? []), booking] } });
    },

    async convertToBooking(customerId, enquiryId) {
      const customer = customers.find((c) => c.id === customerId);
      const enquiry = [...(customer?.enquiries ?? []), ...(state.addedEnquiries[customerId] ?? [])].find((e) => e.id === enquiryId);
      if (!customer || !enquiry || state.bookedEnquiries.includes(enquiryId)) return;
      const digits = String(Math.floor(1000 + Math.random() * 9000));
      const booking: CustomerBooking = {
        id: `${customerId}-book-${Date.now()}`,
        ref: `BK-${digits}0`,
        title: enquiry.title,
        location: enquiry.location,
        dates: enquiry.dates,
        nights: enquiry.nights,
        travellers: enquiry.travellers,
        amount: 'To be confirmed',
        status: 'Confirmed',
        tone: 'positive',
        summary: `Booked from ${enquiry.ref}.`,
        itineraryId: enquiry.itineraryId,
      };
      commit({ ...state, bookedEnquiries: [...state.bookedEnquiries, enquiryId], addedBookings: { ...state.addedBookings, [customerId]: [...(state.addedBookings[customerId] ?? []), booking] } });
    },

    async createItinerary(customerId, source) {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) return undefined;
      const existing = state.itineraryLinks[source.id];
      if (existing) return existing;
      const subject =
        source.kind === 'enquiry'
          ? [...customer.enquiries, ...(state.addedEnquiries[customerId] ?? [])].find((e) => e.id === source.id)
          : [...customer.bookings, ...(state.addedBookings[customerId] ?? [])].find((b) => b.id === source.id);
      if (!subject) return undefined;
      const id = `${customerId}-itin-${Date.now()}`;
      const place = subject.location.split(',')[0]?.trim() || subject.title;
      const itinerary: Itinerary = {
        id,
        customerId,
        title: `${subject.title} · Itinerary`,
        status: 'Draft',
        meta: `${customer.name} · ${subject.dates || 'Dates to be set'} · ${subject.nights} nights`,
        scene: 'room',
        intro: `I've started a blank plan for ${subject.title}. Flights, stays and experiences will appear here as you decide them. Nothing is booked.`,
        options: [{ id: 'a', label: 'Draft plan', days: draftDays(subject.dates, subject.nights, place, id) }],
      };
      commit({ ...state, createdItineraries: [...state.createdItineraries, itinerary], itineraryLinks: { ...state.itineraryLinks, [source.id]: id } });
      return id;
    },

    async addNote(customerId, text) {
      const note = { id: `note-${Date.now()}`, author: 'Hameed', at: nowStamp(), text };
      commit({ ...state, notes: { ...state.notes, [customerId]: [note, ...(state.notes[customerId] ?? [])] } });
    },

    getFinanceRecords() {
      return delay(financeRecords);
    },

    getBookings() {
      return delay(bookings);
    },

    getBooking(id) {
      const found = bookings.find((b) => b.id === id);
      const view: Booking | undefined = found ? { ...found } : undefined;
      return delay(view);
    },

    getFinanceSnapshot() {
      return delay(financeSnapshot);
    },

    getInvoice(id) {
      const invoice = invoices.find((i) => i.id === id);
      return delay(invoice ? { ...invoice, sent: invoice.sent || state.sentInvoices.includes(id) } : undefined);
    },

    async sendInvoice(id) {
      if (state.sentInvoices.includes(id)) return;
      commit({ ...state, sentInvoices: [...state.sentInvoices, id] });
    },

    getSuppliers() {
      return delay(suppliers);
    },

    getSupplier(id) {
      return delay(suppliers.find((s) => s.id === id));
    },

    getCommissionSummary() {
      const summary: CommissionSummary = { total: 33000, thisMonth: 1820, bars: commissionBars, chipCounts: supplierChipCounts };
      return delay(summary);
    },

    getItinerary(id) {
      return delay(itineraries.find((i) => i.id === id) ?? state.createdItineraries.find((i) => i.id === id));
    },

    getSettings() {
      return delay(state.settings);
    },

    async saveSettings(patch) {
      commit({ ...state, settings: { ...state.settings, ...patch } });
    },

    async setAgentEnabled(agentId, enabled) {
      commit({ ...state, settings: { ...state.settings, agentsEnabled: { ...state.settings.agentsEnabled, [agentId]: enabled } } });
    },
  };
}
