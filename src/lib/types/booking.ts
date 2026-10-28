export type BookingState =
  | 'Draft'
  | 'Submitted'
  | 'ChangesRequested'
  | 'Resubmitted'
  | 'ValidationInProgress'
  | 'ApprovalBlocked'
  | 'OperaCreationInProgress'
  | 'OperaCreationFailed'
  | 'Confirmed'
  | 'ModificationPending'
  | 'CheckedIn'
  | 'CheckedOut'
  | 'Rejected'
  | 'Cancelled'
  | 'NoShow';

export interface GuestData {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly nationality?: string;
  readonly passportNumber?: string;
  readonly dateOfBirth?: string;
}

export interface StayData {
  readonly checkIn: string;
  readonly checkOut: string;
  readonly roomTypeId: string;
  readonly adults: number;
  readonly children: number;
  readonly childAges: readonly number[];
  readonly rateCodeId: string;
  readonly totalAmount: number;
  readonly currency: string;
  readonly taxAmount: number;
  readonly cancellationPolicy: string;
}

export interface BookingVersion {
  readonly versionId: string;
  readonly bookingId: string;
  readonly version: number;
  readonly submittedBy: string;
  readonly submittedAt: string;
  readonly guestData: GuestData;
  readonly stayData: StayData;
  readonly rateData: {
    readonly rateCodeId: string;
    readonly pricePerNight: number;
    readonly totalAmount: number;
    readonly currency: string;
  };
  readonly notes: string;
  /** Field-level diff from the prior version; absent on version 1. */
  readonly changes?: readonly VersionChange[];
}

export interface VersionChange {
  readonly field: string;
  readonly previousValue: unknown;
  readonly newValue: unknown;
}

export interface BookingRequest {
  readonly id: string;
  /** Human-readable identifier, e.g. 'BKG-2026-0012'. */
  readonly humanId: string;
  readonly state: BookingState;
  readonly propertyId: string;
  readonly guestId: string;
  readonly agentId?: string;
  readonly agencyId?: string;
  readonly roomTypeId: string;
  readonly rateCodeId: string;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly adults: number;
  readonly children: number;
  readonly childAges: readonly number[];
  readonly totalAmount: number;
  readonly currency: string;
  readonly specialRequests: string;
  readonly notes: string;
  readonly operaConfirmationId?: string;
  readonly operaCorrelationId?: string;
  readonly currentVersion: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly reviewedBy?: string;
  readonly reviewedAt?: string;
  readonly rejectionReason?: string;
  readonly cancellationReason?: string;
}

/** Cumulative bookings made per day of a month, against the month before. */
export interface BookingPace {
  /** 'YYYY-MM' */
  readonly period: string;
  /** Running totals for day 1…N of this month, through the business date. */
  readonly current: readonly number[];
  /** Running totals for the same days of the previous month. */
  readonly previous: readonly number[];
}

/** Booking flow for one month. */
export interface MonthlyBookingTrend {
  /** 'YYYY-MM' */
  readonly month: string;
  readonly created: number;
  readonly confirmed: number;
  readonly cancelled: number;
}
