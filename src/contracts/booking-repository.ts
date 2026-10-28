/**
 * Booking repository contract.
 *
 * Provides booking CRUD, state transitions, version management, and search.
 */

import type {
  BookingPace,
  MonthlyBookingTrend,
  BookingRequest,
  BookingState,
  BookingVersion,
  VersionChange,
  GuestData,
  StayData,
} from '../lib/types';
import type { PaginatedResult, PaginationParams, SortParams, DateRangeFilter } from './shared';

// ── Filters ─────────────────────────────────────────────────────────────────

export interface BookingFilters {
  readonly state?: BookingState | BookingState[];
  readonly propertyId?: string;
  readonly agentId?: string;
  readonly agencyId?: string;
  readonly guestId?: string;
  readonly dateRange?: DateRangeFilter;
}

export interface BookingSearchFilters extends BookingFilters {
  readonly states?: BookingState[];
  readonly checkInFrom?: string;
  readonly checkInTo?: string;
}

// ── Create / Update payloads ────────────────────────────────────────────────

/** A booking pushed in by a travel agent — the hotel app never creates bookings. */
export interface CreateBookingData {
  readonly propertyId: string;
  readonly guestData: GuestData;
  readonly stayData: StayData;
  readonly agentId: string;
  readonly agencyId?: string;
  readonly specialRequests?: string;
  readonly notes?: string;
}

export interface BookingStateMetadata {
  readonly reviewedBy?: string;
  readonly rejectionReason?: string;
  readonly cancellationReason?: string;
  readonly operaConfirmationId?: string;
  readonly operaCorrelationId?: string;
}

export interface CreateVersionData {
  readonly guestData: GuestData;
  readonly stayData: StayData;
  readonly rateData: {
    readonly rateCodeId: string;
    readonly pricePerNight: number;
    readonly totalAmount: number;
    readonly currency: string;
  };
  readonly notes: string;
  readonly submittedBy: string;
}

// ── Version diff ────────────────────────────────────────────────────────────

export interface VersionDiff {
  readonly bookingId: string;
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly changes: readonly VersionChange[];
}

// ── Service interface ───────────────────────────────────────────────────────

export interface IBookingRepository {
  getBookings(
    filters: BookingFilters,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<BookingRequest>>;

  getBookingById(id: string): Promise<{
    booking: BookingRequest;
    versions: readonly BookingVersion[];
  } | null>;

  createBooking(data: CreateBookingData): Promise<BookingRequest>;

  submitBooking(id: string): Promise<BookingRequest>;

  updateBookingState(
    id: string,
    state: BookingState,
    metadata?: BookingStateMetadata,
  ): Promise<BookingRequest>;

  createVersion(
    bookingId: string,
    data: CreateVersionData,
  ): Promise<BookingVersion>;

  getVersions(bookingId: string): Promise<readonly BookingVersion[]>;

  getVersionDiff(
    bookingId: string,
    fromVersion: number,
    toVersion: number,
  ): Promise<VersionDiff>;

  searchBookings(
    query: string,
    filters?: BookingSearchFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<BookingRequest>>;

  /** Booking pace for a month ('YYYY-MM') through `throughDate`, against the previous month. */
  getBookingPace(period: string, throughDate: string): Promise<BookingPace>;

  /** Created / confirmed / cancelled counts for the `months` months ending `throughMonth`, oldest first. */
  getBookingTrend(throughMonth: string, months: number): Promise<readonly MonthlyBookingTrend[]>;
}
