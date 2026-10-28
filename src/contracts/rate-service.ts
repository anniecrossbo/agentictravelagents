/**
 * Rate service contract.
 *
 * Handles rate lookups, rate code management, and rate-to-agent/agency
 * assignment lifecycle.
 */

import type {
  RateCode,
  RateAssignment,
  RateAssigneeType,
} from '../lib/types';
import type { PaginatedResult, PaginationParams, SortParams } from './shared';

// ── Lookup ──────────────────────────────────────────────────────────────────

export interface RateLookupRequest {
  readonly propertyId: string;
  readonly roomTypeId: string;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly agentId?: string;
  readonly agencyId?: string;
}

export interface RateLookupResult {
  readonly rateCode: RateCode;
  readonly pricePerNight: number;
  readonly totalPrice: number;
  readonly isNegotiated: boolean;
}

// ── Filters ─────────────────────────────────────────────────────────────────

export interface RateCodeFilters {
  readonly isPublic?: boolean;
  readonly isActive?: boolean;
  readonly currency?: string;
}

export interface RateAssignmentFilters {
  readonly rateCodeId?: string;
  readonly assigneeType?: RateAssigneeType;
  readonly assigneeId?: string;
  readonly activeOnly?: boolean;
}

// ── Service interface ───────────────────────────────────────────────────────

export interface IRateService {
  lookupRates(
    request: RateLookupRequest,
  ): Promise<readonly RateLookupResult[]>;

  getRateCodes(
    filters: RateCodeFilters,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<RateCode>>;

  getRateCodeById(id: string): Promise<RateCode | null>;

  assignRate(
    rateCodeId: string,
    assigneeType: RateAssigneeType,
    assigneeId: string,
    effectiveFrom: string,
    effectiveTo?: string,
  ): Promise<RateAssignment>;

  removeAssignment(assignmentId: string): Promise<void>;

  getAssignments(
    filters: RateAssignmentFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<RateAssignment>>;
}
