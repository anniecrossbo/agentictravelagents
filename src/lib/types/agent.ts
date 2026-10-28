export type AgentStatus = 'active' | 'inactive' | 'pending';

export interface Agent {
  readonly id: string;
  /** Human-readable identifier, e.g. 'AGT-004'. */
  readonly humanId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly agencyId?: string;
  readonly status: AgentStatus;
  readonly operaMappingId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type AgencyStatus = 'active' | 'inactive' | 'expired';

export interface Agency {
  readonly id: string;
  /** Human-readable identifier, e.g. 'AGN-002'. */
  readonly humanId: string;
  readonly name: string;
  readonly iataNumber?: string;
  readonly country: string;
  readonly email: string;
  readonly phone: string;
  readonly status: AgencyStatus;
  readonly collectionModel: string;
  readonly paymentTerms: string;
  readonly partnershipStatus: string;
  readonly settlementCurrency: string;
  readonly agreementId?: string;
  /** Last day the commercial agreement is in force. */
  readonly agreementValidTo?: string;
  readonly creditLimit?: number;
  readonly settlementMethod?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** A figure for the current reporting period alongside the previous one. */
export interface PeriodMetric {
  readonly current: number;
  readonly previous: number;
}

/** Month-level agent channel performance, for the Agents workspace. */
export interface AgentBookingOverview {
  /** Reporting month, 'YYYY-MM'. */
  readonly period: string;
  readonly currency: string;
  readonly activeAgents: PeriodMetric;
  readonly averageBookingValue: PeriodMetric;
  readonly averageStayNights: PeriodMetric;
  readonly agentBookings: PeriodMetric;
  /** Booking count per agency (or independent agent) this period, highest first. */
  readonly bookingsBySource: readonly { readonly id: string; readonly name: string; readonly count: number }[];
}
