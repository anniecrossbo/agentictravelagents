import type { AgentId, Settings } from '@/contracts';

export const defaultAgentsEnabled: Record<AgentId, boolean> = {
  sales: true,
  designer: true,
  supplier: true,
  reservations: true,
  finance: true,
  marketing: true,
};

export const defaultSettings: Settings = {
  profile: {
    fullName: 'Hameed Ali',
    email: 'hameed@alitravel.example',
    phone: '+971 50 000 0000',
    agency: 'Ali Travel & Tours',
    currency: 'Euro (€)',
    timeZone: 'Dubai (GMT+4)',
    alertOnDecision: true,
  },
  agentsEnabled: defaultAgentsEnabled,
  whatsapp: { connected: false, number: '' },
  email: { connected: true, address: 'hameed@alitravel.example', signature: 'Warm regards,\nHameed Ali\nAli Travel & Tours', readReplies: true },
  invoiceTemplate: {
    agencyName: 'Ali Travel & Tours',
    address: 'Business Bay, Dubai, UAE',
    contact: 'accounts@alitravel.example · +971 4 000 0000',
    bankDetails: 'Bank transfer · Ali Travel & Tours · IBAN AE00 0000 0000 0000 0000 000',
    numbering: 'INV-{year}-{number}',
    footer: 'Thank you for travelling with us. Prices are in euros. This invoice covers the confirmed booking only and does not include agency commission.',
    showCommissionNote: true,
  },
  itineraryTemplate: {
    opening: "Here is the plan I've put together for you. Nothing is booked yet, and I'm happy to change anything.",
    signOff: 'Warm regards, Hameed and the team at Ali Travel & Tours',
    showPictures: true,
    showPrices: true,
    estimateNote: 'Prices are a planning estimate until each supplier confirms.',
  },
  templatesEdited: { invoice: '12 Oct', itinerary: '2 Oct' },
};
