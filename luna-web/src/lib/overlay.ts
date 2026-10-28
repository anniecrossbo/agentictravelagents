export type ProfileTab = 'team' | 'travel' | 'notes' | 'enquiries' | 'timeline' | 'documents';

export type Overlay =
  | { kind: 'agent'; agentId: string; itemId?: string }
  | { kind: 'profile'; customerId: string; tab: ProfileTab }
  | { kind: 'itinerary'; id: string }
  | { kind: 'supplier'; id: string; tab: string }
  | { kind: 'invoice'; id: string }
  | { kind: 'all'; what: 'customers' | 'suppliers' | 'finance' }
  | { kind: 'template'; which: 'invoice' | 'itinerary' }
  | { kind: 'whatsapp' }
  | { kind: 'email' }
  | { kind: 'ask' };

const PROFILE_TABS: ProfileTab[] = ['team', 'travel', 'notes', 'enquiries', 'timeline', 'documents'];

export function formatOverlay(o: Overlay): string {
  switch (o.kind) {
    case 'agent':
      return o.itemId ? `agent:${o.agentId}:${o.itemId}` : `agent:${o.agentId}`;
    case 'profile':
      return `profile:${o.customerId}:${o.tab}`;
    case 'itinerary':
      return `itinerary:${o.id}`;
    case 'supplier':
      return `supplier:${o.id}:${o.tab}`;
    case 'invoice':
      return `invoice:${o.id}`;
    case 'all':
      return `all:${o.what}`;
    case 'template':
      return `template:${o.which}`;
    default:
      return o.kind;
  }
}

export function parseOverlay(raw: string | null): Overlay | null {
  if (!raw) return null;
  const [kind, a, b] = raw.split(':');
  switch (kind) {
    case 'agent':
      return a ? { kind, agentId: a, itemId: b } : null;
    case 'profile':
      return a ? { kind, customerId: a, tab: PROFILE_TABS.includes(b as ProfileTab) ? (b as ProfileTab) : 'team' } : null;
    case 'itinerary':
      return a ? { kind, id: a } : null;
    case 'supplier':
      return a ? { kind, id: a, tab: b ?? 'first' } : null;
    case 'invoice':
      return a ? { kind, id: a } : null;
    case 'all':
      return a === 'customers' || a === 'suppliers' || a === 'finance' ? { kind, what: a } : null;
    case 'template':
      return a === 'invoice' || a === 'itinerary' ? { kind, which: a } : null;
    case 'whatsapp':
    case 'email':
    case 'ask':
      return { kind };
    default:
      return null;
  }
}
