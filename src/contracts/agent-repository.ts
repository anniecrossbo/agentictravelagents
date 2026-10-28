/**
 * Agent and agency repository contract.
 *
 * Provides CRUD, search, and relationship queries for travel agents
 * and their parent agencies.
 */

import type {
  Agent,
  AgentStatus,
  Agency,
  AgencyStatus,
  AgentBookingOverview,
  BookingRequest,
  RateAssignment,
} from '../lib/types';
import type { PaginatedResult, PaginationParams, SortParams } from './shared';

// ── Filters ─────────────────────────────────────────────────────────────────

export interface AgentFilters {
  readonly status?: AgentStatus;
  readonly agencyId?: string;
}

export interface AgencyFilters {
  readonly status?: AgencyStatus;
  readonly country?: string;
}

// ── Service interface ───────────────────────────────────────────────────────

export interface IAgentRepository {
  getAgents(
    filters: AgentFilters,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<Agent>>;

  getAgentById(id: string): Promise<{
    agent: Agent;
    agency: Agency | null;
  } | null>;

  getAgencies(
    filters: AgencyFilters,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<Agency>>;

  getAgencyById(id: string): Promise<{
    agency: Agency;
    members: readonly Agent[];
  } | null>;

  searchAgents(
    query: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Agent>>;

  getAgentBookings(
    agentId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<BookingRequest>>;

  getAgentRateAssignments(
    agentId: string,
  ): Promise<readonly RateAssignment[]>;

  /** Agent channel performance for a month ('YYYY-MM') against the month before. */
  getAgentBookingOverview(period: string): Promise<AgentBookingOverview>;
}
