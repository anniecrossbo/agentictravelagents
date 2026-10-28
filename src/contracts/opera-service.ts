/**
 * Opera PMS integration service contract.
 *
 * Handles availability lookups, reservation CRUD, guest-profile resolution,
 * and event consumption from the Opera property-management system.
 */

import type { BookingRequest, BookingVersion, StayData } from '../lib/types';

// ── Availability ────────────────────────────────────────────────────────────

export interface AvailabilityRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  roomTypeId: string;
  adults: number;
  children: number;
  childAges?: number[];
  agentId?: string;
  agencyId?: string;
}

export interface AvailabilityResult {
  available: boolean;
  rateCode: string;
  rateCodeName: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  taxAmount: number;
  restrictions: string[];
  cancellationPolicy: string;
  isNegotiated: boolean;
  isCommissionable: boolean;
  commissionRate?: number;
  mealPlan?: string;
  freshness: string; // ISO timestamp
}

export interface AvailabilityResponse {
  results: AvailabilityResult[];
  checkedAt: string;
}

// ── Reservation CRUD ────────────────────────────────────────────────────────

export interface ReservationCreateRequest {
  bookingId: string;
  bookingVersion: number;
  operationKey: string; // idempotency key
  guestProfile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  stay: StayData;
  agentId?: string;
  agencyId?: string;
}

export interface ReservationCreateResponse {
  success: boolean;
  confirmationId?: string;
  correlationId: string;
  error?: { code: string; message: string; retryable: boolean };
}

export interface ReservationUpdateRequest {
  confirmationId: string;
  operationKey: string;
  changes: Partial<StayData>;
}

export interface ReservationUpdateResponse {
  success: boolean;
  confirmationId: string;
  correlationId: string;
  error?: { code: string; message: string; retryable: boolean };
}

export interface CancellationRequest {
  confirmationId: string;
  operationKey: string;
  reason: string;
}

export interface CancellationResponse {
  success: boolean;
  cancellationId?: string;
  error?: { code: string; message: string };
}

// ── Guest Profile ───────────────────────────────────────────────────────────

export interface GuestProfileMatch {
  profileId: string;
  firstName: string;
  lastName: string;
  email?: string;
  matchConfidence: 'exact' | 'probable' | 'ambiguous';
}

// ── Events ──────────────────────────────────────────────────────────────────

export interface OperaEvent {
  eventId: string;
  type:
    | 'check_in'
    | 'check_out'
    | 'cancellation'
    | 'no_show'
    | 'modification'
    | 'rate_change';
  confirmationId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// ── Service interface ───────────────────────────────────────────────────────

export interface IOperaService {
  getAvailabilityAndRates(
    request: AvailabilityRequest,
  ): Promise<AvailabilityResponse>;

  createReservation(
    request: ReservationCreateRequest,
  ): Promise<ReservationCreateResponse>;

  getReservation(confirmationId: string): Promise<BookingRequest | null>;

  updateReservation(
    request: ReservationUpdateRequest,
  ): Promise<ReservationUpdateResponse>;

  cancelReservation(
    request: CancellationRequest,
  ): Promise<CancellationResponse>;

  findOrCreateGuestProfile(guest: {
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<{
    profileId: string;
    isNew: boolean;
    matches?: GuestProfileMatch[];
  }>;

  consumeEvents(since: string): Promise<OperaEvent[]>;

  reconcile(
    confirmationId: string,
    operationKey: string,
  ): Promise<ReservationCreateResponse>;
}
