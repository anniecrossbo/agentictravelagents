/**
 * AI briefing assembly (PRD v6 §9.2). Framework-free.
 *
 * The constraints this module enforces are the point of it:
 *  - role, permission and responsibility filters run BEFORE summarization;
 *  - a statement may never reference a fact the user cannot open in the
 *    owning module, so unopenable signals are dropped and merely counted;
 *  - every statement carries its source signal ids and deep link;
 *  - when generation fails the caller still gets the structured priority
 *    list, so the workspace stays usable without AI.
 *
 * Nothing here creates a signal, changes a state or approves anything —
 * it only groups and orders deterministic rule output.
 */

import type { Capability, NeedsYouSignal, NeedsYouSeverity, UserRole } from './types';

const SEVERITY_ORDER: Record<NeedsYouSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Capability required to open each entity type. A signal the user cannot
 * open is never summarized (§9.2 "must not expose a finance amount, guest
 * detail or document fact that the user cannot open in the owning module").
 */
const ENTITY_CAPABILITY: Record<string, Capability> = {
  finance_obligation: 'view_finance_detail',
  obligation: 'view_finance_detail',
  document: 'review_documents',
  guest: 'view_guest_stay_details',
  reservation: 'view_guest_stay_details',
  booking: 'view_operational_home',
  agent: 'view_agent_commercial_terms',
  agency: 'view_agent_commercial_terms',
  conversation: 'view_operational_home',
  inventory: 'view_operational_home',
};

export function canOpenEntity(entityType: string, capabilities: ReadonlySet<Capability>): boolean {
  const required = ENTITY_CAPABILITY[entityType];
  // Unmapped entity types fall back to the baseline workspace capability.
  return capabilities.has(required ?? 'view_operational_home');
}

export type BriefingStatement = {
  id: string;
  /** i18n key resolved by the presentation layer. */
  labelKey: string;
  params: Record<string, string | number>;
  severity: NeedsYouSeverity;
  recommendedAction: string;
  source: {
    entityType: string;
    entityId: string;
    deepLink: string;
    signalIds: string[];
  };
};

export type Briefing = {
  businessDate: string;
  /** false when summarization failed — render the priority list instead. */
  generated: boolean;
  statements: BriefingStatement[];
  /** Deterministic counts, always populated so the fallback works. */
  priority: { severity: NeedsYouSeverity; count: number }[];
  /** Signals withheld because the user cannot open them. */
  withheld: number;
  total: number;
};

export type BriefingInput = {
  signals: readonly NeedsYouSignal[];
  role: UserRole;
  capabilities: ReadonlySet<Capability>;
  businessDate: string;
  /** Simulates a summarization failure so the degraded path is reachable. */
  generationFailed?: boolean;
};

/** Signals this user may act on and may open. Runs before any grouping. */
function permitted(input: BriefingInput): NeedsYouSignal[] {
  return input.signals.filter(
    (s) =>
      s.state === 'open' &&
      s.ownerRole === input.role &&
      canOpenEntity(s.entityType, input.capabilities),
  );
}

export function buildBriefing(input: BriefingInput): Briefing {
  const mine = input.signals.filter((s) => s.state === 'open' && s.ownerRole === input.role);
  const openable = permitted(input);
  const withheld = mine.length - openable.length;

  const priority = (['critical', 'high', 'medium', 'low'] as NeedsYouSeverity[])
    .map((severity) => ({
      severity,
      count: openable.filter((s) => s.severity === severity).length,
    }))
    .filter((p) => p.count > 0);

  if (input.generationFailed) {
    return {
      businessDate: input.businessDate,
      generated: false,
      statements: [],
      priority,
      withheld,
      total: openable.length,
    };
  }

  // Group by rule so repeated conditions become one statement (§9.2 "group").
  const groups = new Map<string, NeedsYouSignal[]>();
  for (const s of openable) {
    const list = groups.get(s.rule) ?? [];
    list.push(s);
    groups.set(s.rule, list);
  }

  const statements: BriefingStatement[] = [...groups.entries()]
    .map(([rule, list]) => {
      const lead = list.reduce((a, b) =>
        SEVERITY_ORDER[a.severity] <= SEVERITY_ORDER[b.severity] ? a : b,
      );
      return {
        id: rule,
        labelKey: list.length > 1 ? 'aiBriefing.groupedSignal' : 'aiBriefing.singleSignal',
        params: { count: list.length, reason: lead.reason },
        severity: lead.severity,
        recommendedAction: lead.recommendedAction,
        source: {
          entityType: lead.entityType,
          entityId: lead.entityId,
          deepLink: lead.deepLink,
          signalIds: list.map((s) => s.id),
        },
      };
    })
    .sort((a, b) => {
      const bySeverity = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (bySeverity !== 0) return bySeverity;
      return b.source.signalIds.length - a.source.signalIds.length;
    });

  return {
    businessDate: input.businessDate,
    generated: true,
    statements,
    priority,
    withheld,
    total: openable.length,
  };
}

/** Morning / afternoon / evening from a 24h hour, for the greeting. */
export function timeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
