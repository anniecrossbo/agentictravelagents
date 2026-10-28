/**
 * AI briefing service contract.
 *
 * Generates contextual daily briefings for hotel staff based on role,
 * with a deterministic fallback when the AI service is unavailable.
 */

import type { UserRole, NeedsYouSignal } from '../lib/types';

// ── Briefing types ──────────────────────────────────────────────────────────

export interface BriefingSection {
  readonly title: string;
  readonly content: string;
  readonly priority: 'high' | 'medium' | 'low';
  readonly relatedSignals?: readonly string[]; // NeedsYouSignal IDs
}

export interface Briefing {
  readonly userId: string;
  readonly role: UserRole;
  readonly propertyId: string;
  readonly generatedAt: string;
  readonly sections: readonly BriefingSection[];
  readonly isAiGenerated: boolean;
}

// ── Service interface ───────────────────────────────────────────────────────

export interface IAiBriefingService {
  /** Fetches an AI-generated briefing; may fail if the AI backend is down. */
  getBriefing(
    userId: string,
    role: UserRole,
    propertyId: string,
  ): Promise<Briefing>;

  /** Deterministic fallback: assembles a briefing from rules and signals only. */
  getBriefingFallback(
    userId: string,
    role: UserRole,
    propertyId: string,
  ): Promise<Briefing>;
}
