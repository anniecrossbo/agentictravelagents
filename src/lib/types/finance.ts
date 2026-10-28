export type ObligationType = 'to_collect' | 'to_pay';

export type ObligationStatus =
  | 'pending'
  | 'approved'
  | 'partially_settled'
  | 'settled'
  | 'overdue'
  | 'disputed'
  | 'adjusted'
  | 'written_off';

export interface FinanceObligation {
  readonly id: string;
  /** Human-readable identifier, e.g. 'FIN-0017'. */
  readonly humanId: string;
  readonly bookingId: string;
  readonly operaConfirmationId?: string;
  readonly type: ObligationType;
  readonly status: ObligationStatus;
  readonly counterpartyType: string;
  readonly counterpartyId: string;
  readonly grossAmount: number;
  readonly commissionBasis?: number;
  readonly commissionAmount?: number;
  readonly netAmount: number;
  readonly collectAmount?: number;
  readonly payAmount?: number;
  readonly originalCurrency: string;
  readonly reportingCurrency?: string;
  readonly reportingAmount?: number;
  readonly exchangeRate?: number;
  readonly exchangeRateSource?: string;
  readonly exchangeRateTimestamp?: string;
  readonly dueDate: string;
  readonly settledAmount: number;
  readonly remainingBalance: number;
  readonly evidence: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type SettlementType = 'collection' | 'payment' | 'reversal';

export interface SettlementRecord {
  readonly id: string;
  readonly obligationId: string;
  readonly amount: number;
  readonly currency: string;
  readonly date: string;
  readonly reference: string;
  readonly type: SettlementType;
  readonly reason?: string;
  readonly recordedBy: string;
  readonly recordedAt: string;
}

/** Revenue from agent-sourced bookings for one month. */
export interface MonthlyAgentRevenue {
  /** 'YYYY-MM' */
  readonly month: string;
  readonly revenue: number;
}
