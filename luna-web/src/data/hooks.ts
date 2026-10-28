import type { AgentId, DecisionScope } from '@/contracts';
import { api } from './api';
import { useResource } from './useResource';

export const useAgents = () => useResource(() => api.getAgents());
export const usePipeline = () => useResource(() => api.getPipeline());
export const useAgentCases = (agentId: AgentId) => useResource(() => api.getAgentCases(agentId), [agentId]);
export const useDecisions = (scope: DecisionScope | 'all') => useResource(() => api.getDecisions(scope), [scope]);
export const useThread = (threadId: string) => useResource(() => api.getThread(threadId), [threadId]);
export const useLunaThreads = () => useResource(() => api.getLunaThreads());
export const useLunaThread = (id: string | undefined) => useResource(async () => (id ? api.getLunaThread(id) : undefined), [id]);
export const useContacts = () => useResource(() => api.getContacts());
export const useConversation = (contactId: string) => useResource(() => api.getConversation(contactId), [contactId]);
export const useCustomers = () => useResource(() => api.getCustomers());
export const useCustomer = (id: string) => useResource(() => api.getCustomer(id), [id]);
export const useCustomerSnapshot = () => useResource(() => api.getCustomerSnapshot());
export const useFinanceRecords = () => useResource(() => api.getFinanceRecords());
export const useBookings = () => useResource(() => api.getBookings());
export const useBooking = (id: string) => useResource(() => api.getBooking(id), [id]);
export const useFinanceSnapshot = () => useResource(() => api.getFinanceSnapshot());
export const useInvoice = (id: string) => useResource(() => api.getInvoice(id), [id]);
export const useSuppliers = () => useResource(() => api.getSuppliers());
export const useSupplier = (id: string) => useResource(() => api.getSupplier(id), [id]);
export const useCommissionSummary = () => useResource(() => api.getCommissionSummary());
export const useItinerary = (id: string) => useResource(() => api.getItinerary(id), [id]);
export const useSettings = () => useResource(() => api.getSettings());

export const actions = {
  resolveDecision: api.resolveDecision.bind(api),
  completeCaseStep: api.completeCaseStep.bind(api),
  sendMessage: api.sendMessage.bind(api),
  askLuna: api.askLuna.bind(api),
  sendContactMessage: api.sendContactMessage.bind(api),
  markChatRead: api.markChatRead.bind(api),
  addNote: api.addNote.bind(api),
  addPreference: api.addPreference.bind(api),
  resolvePreference: api.resolvePreference.bind(api),
  addTraveller: api.addTraveller.bind(api),
  addEnquiry: api.addEnquiry.bind(api),
  addBooking: api.addBooking.bind(api),
  convertToBooking: api.convertToBooking.bind(api),
  createItinerary: api.createItinerary.bind(api),
  sendInvoice: api.sendInvoice.bind(api),
  saveSettings: api.saveSettings.bind(api),
  setAgentEnabled: api.setAgentEnabled.bind(api),
};
