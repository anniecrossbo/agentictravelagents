/**
 * Canonical entity routes (PRD v6 §22.2).
 * Framework-free: builds and parses the addressable identity for every entity
 * workspace so a refresh or copied link resolves to the same record.
 *
 * Durable identity lives in the path. View context — tab, filters, source —
 * travels as validated query parameters and is never trusted for authorization.
 */

export type EntityKind = 'booking' | 'agent' | 'agency' | 'obligation' | 'roomType';

const SEGMENT: Record<EntityKind, string> = {
  booking: 'bookings',
  agent: 'agents',
  agency: 'agencies',
  obligation: 'finance',
  roomType: 'rooms',
};

/** Tab a given entity workspace lives under, for return behaviour. */
export const ENTITY_TAB: Record<EntityKind, string> = {
  booking: 'bookings',
  agent: 'agents',
  agency: 'agents',
  obligation: 'finance',
  roomType: 'rooms',
};

export type ViewContext = {
  /** Addressable tab within the workspace (§22.2 "selected tab"). */
  tab?: string;
  /** Widget, signal or notification that opened this destination. */
  from?: string;
};

function encodeContext(context?: ViewContext): string {
  if (!context) return '';
  const parts: string[] = [];
  if (context.tab) parts.push(`tab=${encodeURIComponent(context.tab)}`);
  if (context.from) parts.push(`from=${encodeURIComponent(context.from)}`);
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

/** '/bookings/bkg-0001?tab=documents' */
export function entityPath(
  kind: EntityKind,
  id: string,
  context?: ViewContext,
): string {
  return `/${SEGMENT[kind]}/${encodeURIComponent(id)}${encodeContext(context)}`;
}

export function listPath(kind: EntityKind): string {
  return `/${SEGMENT[kind]}`;
}

/** Validates a tab parameter against the tabs a workspace actually has. */
export function resolveTab(
  requested: string | undefined,
  allowed: readonly string[],
  fallback: string,
): string {
  if (requested && allowed.includes(requested)) return requested;
  return fallback;
}

/**
 * List state that must survive a round trip into a detail view and back
 * (§22.1 "Return or use Back" restores query, filters, sort and position).
 */
export type ListState = {
  query?: string;
  filter?: string;
  sort?: string;
  scrollY?: number;
};

const listStates = new Map<string, ListState>();

export function rememberListState(key: string, state: ListState): void {
  listStates.set(key, { ...listStates.get(key), ...state });
}

export function recallListState(key: string): ListState {
  return listStates.get(key) ?? {};
}

export function clearListState(key: string): void {
  listStates.delete(key);
}
