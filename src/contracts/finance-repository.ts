/**
 * Finance repository contract.
 *
 * Manages financial obligations, settlement recording, reconciliation,
 * and reporting exports.
 */

import type {
  MonthlyAgentRevenue,
  FinanceObligation,
  ObligationStatus,
  ObligationType,
  SettlementRecord,
} from '../lib/types';
import type { PaginatedResult, PaginationParams, SortParams, DateRangeFilter } from './shared';

// ── Filters ─────────────────────────────────────────────────────────────────

export interface ObligationFilters {
  readonly type?: ObligationType;
  readonly status?: ObligationStatus | ObligationStatus[];
  readonly counterpartyId?: string;
  readonly counterpartyType?: string;
  readonly bookingId?: string;
  readonly dueDateRange?: DateRangeFilter;
  readonly overdue?: boolean;
}

// ── Create / Update payloads ────────────────────────────────────────────────

export interface CreateObligationData {
  readonly bookingId: string;
  readonly operaConfirmationId?: string;
  readonly type: ObligationType;
  readonly counterpartyType: string;
  readonly counterpartyId: string;
  readonly grossAmount: number;
  readonly commissionBasis?: number;
  readonly commissionAmount?: number;
  readonly netAmount: number;
  readonly collectAmount?: number;
  readonly payAmount?: number;
  readonly originalCurrency: string;
  readonly dueDate: string;
  readonly evidence?: readonly string[];
}

export interface ObligationStatusMetadata {
  readonly updatedBy: string;
  readonly reason?: string;
}

export interface RecordSettlementData {
  readonly amount: number;
  readonly currency: string;
  readonly date: string;
  readonly reference: string;
  readonly type: 'collection' | 'payment';
  readonly recordedBy: string;
}

export interface ReconciliationFile {
  readonly fileName: string;
  readonly mimeType: string;
  readonly data: string; // base64 or URI
}

export interface ReconciliationResult {
  readonly matched: number;
  readonly unmatched: number;
  readonly errors: readonly string[];
}

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// ── Service interface ───────────────────────────────────────────────────────

export interface IFinanceRepository {
  getObligations(
    filters: ObligationFilters,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<FinanceObligation>>;

  getObligationById(id: string): Promise<FinanceObligation | null>;

  createObligation(data: CreateObligationData): Promise<FinanceObligation>;

  updateObligationStatus(
    id: string,
    status: ObligationStatus,
    metadata: ObligationStatusMetadata,
  ): Promise<FinanceObligation>;

  recordSettlement(
    obligationId: string,
    data: RecordSettlementData,
  ): Promise<SettlementRecord>;

  reverseSettlement(
    settlementId: string,
    reason: string,
  ): Promise<SettlementRecord>;

  getSettlements(
    obligationId: string,
  ): Promise<readonly SettlementRecord[]>;

  importReconciliation(
    file: ReconciliationFile,
  ): Promise<ReconciliationResult>;

  exportObligations(
    filters: ObligationFilters,
    format: ExportFormat,
  ): Promise<{ url: string; fileName: string }>;

  /** Agent-booking revenue for the `months` months ending with `throughMonth` ('YYYY-MM'), oldest first. */
  getAgentRevenueHistory(throughMonth: string, months: number): Promise<readonly MonthlyAgentRevenue[]>;
}
