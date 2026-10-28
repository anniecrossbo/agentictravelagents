/**
 * Mock implementation of IAgentRepository.
 *
 * Returns mock agents and agencies with filtering, pagination, and search.
 * Components call this service (never mocks directly).
 */

import type { Agent, Agency, AgentBookingOverview, BookingRequest, RateAssignment } from '../lib/types';
import type {
  IAgentRepository,
  AgentFilters,
  AgencyFilters,
} from '../contracts/agent-repository';
import type { PaginatedResult, PaginationParams, SortParams } from '../contracts/shared';
import { agents, agencies, agentPriorPeriodStats } from '../mocks/agents';
import { bookings } from '../mocks/bookings';
import { buildAgentBookingOverview } from '../lib/agent-directory';

// ── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function paginate<T>(
  items: readonly T[],
  pagination: PaginationParams,
): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));
  const page = Math.min(pagination.page, totalPages);
  const start = (page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;

  return {
    items: items.slice(start, end),
    total,
    page,
    pageSize: pagination.pageSize,
    totalPages,
  };
}

// ── Mock rate assignments ───────────────────────────────────────────────────

// PROTO: minimal rate assignment data for the agents who have bookings
const MOCK_RATE_ASSIGNMENTS: RateAssignment[] = [
  {
    id: 'RA-001',
    rateCodeId: 'RC-AGENT-NET',
    assigneeType: 'agency',
    assigneeId: 'agency-wanderlust',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    isOverride: false,
    createdBy: 'USR-003',
    createdAt: '2025-12-15T10:00:00Z',
  },
  {
    id: 'RA-002',
    rateCodeId: 'RC-AGENT-COMM',
    assigneeType: 'agency',
    assigneeId: 'agency-wanderlust',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    isOverride: false,
    createdBy: 'USR-003',
    createdAt: '2025-12-15T10:00:00Z',
  },
  {
    id: 'RA-003',
    rateCodeId: 'RC-AGENT-COMM',
    assigneeType: 'agency',
    assigneeId: 'agency-pacific',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    isOverride: false,
    createdBy: 'USR-003',
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 'RA-004',
    rateCodeId: 'RC-AGENT-NET',
    assigneeType: 'agent',
    assigneeId: 'agent-yuki',
    effectiveFrom: '2026-03-01',
    isOverride: true,
    createdBy: 'USR-003',
    createdAt: '2026-02-28T09:00:00Z',
  },
  {
    id: 'RA-005',
    rateCodeId: 'RC-AGENT-COMM',
    assigneeType: 'agent',
    assigneeId: 'agent-carlos',
    effectiveFrom: '2026-04-01',
    isOverride: true,
    createdBy: 'USR-003',
    createdAt: '2026-03-30T10:00:00Z',
  },
];

// ── Implementation ─────────────────────────────────────────────────────────

export class MockAgentRepository implements IAgentRepository {
  async getAgents(
    filters: AgentFilters,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<Agent>> {
    await delay(100);

    let result = [...agents] as Agent[];

    if (filters.status) {
      result = result.filter((a) => a.status === filters.status);
    }

    if (filters.agencyId) {
      result = result.filter((a) => a.agencyId === filters.agencyId);
    }

    // Sort
    if (sort) {
      result.sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[sort.sortBy];
        const bVal = (b as unknown as Record<string, unknown>)[sort.sortBy];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sort.sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return 0;
      });
    } else {
      // Default: sort by last name
      result.sort((a, b) => a.lastName.localeCompare(b.lastName));
    }

    return paginate(result, pagination);
  }

  async getAgentById(
    id: string,
  ): Promise<{ agent: Agent; agency: Agency | null } | null> {
    await delay(80);

    const agent = agents.find((a) => a.id === id || a.humanId === id);
    if (!agent) return null;

    const agency = agent.agencyId
      ? (agencies.find((ag) => ag.id === agent.agencyId) ?? null)
      : null;

    return { agent, agency };
  }

  async getAgencies(
    filters: AgencyFilters,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<Agency>> {
    await delay(100);

    let result = [...agencies] as Agency[];

    if (filters.status) {
      result = result.filter((a) => a.status === filters.status);
    }

    if (filters.country) {
      result = result.filter(
        (a) => a.country.toLowerCase() === filters.country!.toLowerCase(),
      );
    }

    // Sort
    if (sort) {
      result.sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[sort.sortBy];
        const bVal = (b as unknown as Record<string, unknown>)[sort.sortBy];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sort.sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return 0;
      });
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return paginate(result, pagination);
  }

  async getAgencyById(
    id: string,
  ): Promise<{ agency: Agency; members: readonly Agent[] } | null> {
    await delay(80);

    const agency = agencies.find((a) => a.id === id || a.humanId === id);
    if (!agency) return null;

    const members = agents.filter((a) => a.agencyId === agency.id);
    return { agency, members };
  }

  async searchAgents(
    query: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Agent>> {
    await delay(120);

    const lowerQuery = query.toLowerCase();

    const result = (agents as readonly Agent[]).filter((a) => {
      const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
      if (fullName.includes(lowerQuery)) return true;
      if (a.email.toLowerCase().includes(lowerQuery)) return true;
      if (a.humanId.toLowerCase().includes(lowerQuery)) return true;

      // Search by agency name
      if (a.agencyId) {
        const agency = agencies.find((ag) => ag.id === a.agencyId);
        if (agency?.name.toLowerCase().includes(lowerQuery)) return true;
      }

      return false;
    });

    return paginate(result, pagination ?? { page: 1, pageSize: 20 });
  }

  async getAgentBookings(
    agentId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<BookingRequest>> {
    await delay(100);

    // PROTO: import bookings at runtime to avoid circular dependency
    // In production this would be a proper backend join
    const { mockBookingRepository } = await import('./mock-booking-repository');
    return mockBookingRepository.getBookings(
      { agentId },
      pagination ?? { page: 1, pageSize: 20 },
    );
  }

  async getAgentRateAssignments(
    agentId: string,
  ): Promise<readonly RateAssignment[]> {
    await delay(80);

    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return [];

    // Return assignments for this specific agent, plus any agency-level assignments
    return MOCK_RATE_ASSIGNMENTS.filter((ra) => {
      if (ra.assigneeType === 'agent' && ra.assigneeId === agentId) return true;
      if (ra.assigneeType === 'agency' && agent.agencyId && ra.assigneeId === agent.agencyId) {
        return true;
      }
      return false;
    });
  }

  async getAgentBookingOverview(period: string): Promise<AgentBookingOverview> {
    await delay(80);
    // PROTO: current month is derived from booking fixtures; the backend aggregates this server-side
    return buildAgentBookingOverview(period, 'USD', agencies, agents, bookings, agentPriorPeriodStats);
  }
}

export const mockAgentRepository = new MockAgentRepository();
