/**
 * Audit service contract.
 *
 * Provides immutable audit trail retrieval and event recording
 * for all tracked entities.
 */

import type { AuditEvent, AuditActor } from '../lib/types';
import type { PaginatedResult, PaginationParams, SortParams, DateRangeFilter } from './shared';

// ── Filters ─────────────────────────────────────────────────────────────────

export interface AuditFilters {
  readonly action?: string;
  readonly actorId?: string;
  readonly dateRange?: DateRangeFilter;
}

// ── Record payload ──────────────────────────────────────────────────────────

export interface RecordAuditEventData {
  readonly entityType: string;
  readonly entityId: string;
  readonly action: string;
  readonly actor: AuditActor;
  readonly previousState?: string;
  readonly nextState?: string;
  readonly propertyId: string;
  readonly sourceModule: string;
  readonly reason?: string;
  readonly bookingVersion?: number;
  readonly operationId: string;
  readonly metadata?: Record<string, unknown>;
}

// ── Service interface ───────────────────────────────────────────────────────

export interface IAuditService {
  getAuditHistory(
    entityType: string,
    entityId: string,
    filters?: AuditFilters,
    pagination?: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<AuditEvent>>;

  recordEvent(event: RecordAuditEventData): Promise<AuditEvent>;
}
