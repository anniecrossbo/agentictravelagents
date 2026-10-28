/**
 * Mock implementation of IBookingRepository.
 *
 * Returns mock bookings with filtering, pagination, and search.
 * Components call this service (never mocks directly).
 */

import type { BookingPace, BookingRequest, MonthlyBookingTrend, BookingVersion, BookingState, VersionChange } from '../lib/types';
import { bookings as bookingFixtures, priorMonthDailyBookings, priorBookingTrend } from '../mocks/bookings';
import { currentMonthTrend } from '../lib/booking-stats';
import { buildBookingPace } from '../lib/booking-pace';
import type {
  IBookingRepository,
  BookingFilters,
  BookingSearchFilters,
  CreateBookingData,
  BookingStateMetadata,
  CreateVersionData,
  VersionDiff,
} from '../contracts/booking-repository';
import type { PaginatedResult, PaginationParams, SortParams } from '../contracts/shared';
import { guests } from '../mocks/guests';

// ── Inline mock data (no separate bookings fixture file yet) ──────────────

// PROTO: bookings are hardcoded here; move to src/mocks/bookings.ts when the
// fixture set grows or other adapters need the same data.

const MOCK_BOOKINGS: BookingRequest[] = [
  {
    id: 'BKG-001',
    humanId: 'BKG-2026-0001',
    state: 'Confirmed',
    propertyId: 'PROP-001',
    guestId: 'GST-001',
    agentId: 'agent-elena',
    agencyId: 'agency-wanderlust',
    roomTypeId: 'RT-DLX-KING',
    rateCodeId: 'RC-AGENT-NET',
    checkIn: '2026-09-25',
    checkOut: '2026-09-28',
    adults: 2,
    children: 0,
    childAges: [],
    totalAmount: 2700,
    currency: 'USD',
    specialRequests: 'High floor, late check-out if available',
    notes: 'VIP guest — platinum loyalty',
    operaConfirmationId: 'OP-CONF-10001',
    operaCorrelationId: 'OP-CORR-10001',
    currentVersion: 1,
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-15T14:30:00Z',
    reviewedBy: 'USR-002',
    reviewedAt: '2026-09-11T09:00:00Z',
  },
  {
    id: 'BKG-002',
    humanId: 'BKG-2026-0002',
    state: 'Submitted',
    propertyId: 'PROP-001',
    guestId: 'GST-002',
    agentId: 'agent-marie',
    agencyId: 'agency-pacific',
    roomTypeId: 'RT-SUP-TWIN',
    rateCodeId: 'RC-AGENT-COMM',
    checkIn: '2026-10-01',
    checkOut: '2026-10-05',
    adults: 2,
    children: 1,
    childAges: [8],
    totalAmount: 3200,
    currency: 'USD',
    specialRequests: 'Extra bed for child, allergen-free pillows',
    notes: '',
    currentVersion: 1,
    createdAt: '2026-09-18T08:00:00Z',
    updatedAt: '2026-09-18T08:00:00Z',
  },
  {
    id: 'BKG-003',
    humanId: 'BKG-2026-0003',
    state: 'ChangesRequested',
    propertyId: 'PROP-001',
    guestId: 'GST-003',
    agentId: 'agent-raj',
    agencyId: 'agency-wanderlust',
    roomTypeId: 'RT-PREM-SUITE',
    rateCodeId: 'RC-AGENT-NET',
    checkIn: '2026-10-10',
    checkOut: '2026-10-14',
    adults: 2,
    children: 0,
    childAges: [],
    totalAmount: 6400,
    currency: 'USD',
    specialRequests: 'Anniversary celebration — champagne and flowers on arrival',
    notes: 'Rate mismatch — agent used expired rate code. Request re-quote.',
    currentVersion: 2,
    createdAt: '2026-09-15T11:00:00Z',
    updatedAt: '2026-09-20T16:00:00Z',
    reviewedBy: 'USR-002',
    reviewedAt: '2026-09-20T16:00:00Z',
    rejectionReason: 'Rate code RC-AGENT-NET expired for this date range. Please re-quote with RC-AGENT-NET-Q4.',
  },
  {
    id: 'BKG-004',
    humanId: 'BKG-2026-0004',
    state: 'CheckedIn',
    propertyId: 'PROP-001',
    guestId: 'GST-004',
    agentId: 'agent-elena',
    agencyId: 'agency-wanderlust',
    roomTypeId: 'RT-DLX-KING',
    rateCodeId: 'RC-AGENT-COMM',
    checkIn: '2026-09-19',
    checkOut: '2026-09-23',
    adults: 1,
    children: 0,
    childAges: [],
    totalAmount: 3600,
    currency: 'USD',
    specialRequests: 'Quiet room, non-smoking',
    notes: 'Gold loyalty member',
    operaConfirmationId: 'OP-CONF-10004',
    operaCorrelationId: 'OP-CORR-10004',
    currentVersion: 1,
    createdAt: '2026-09-05T14:00:00Z',
    updatedAt: '2026-09-19T15:30:00Z',
    reviewedBy: 'USR-002',
    reviewedAt: '2026-09-06T10:00:00Z',
  },
  {
    id: 'BKG-005',
    humanId: 'BKG-2026-0005',
    state: 'Rejected',
    propertyId: 'PROP-001',
    guestId: 'GST-005',
    agentId: 'agent-omar',
    agencyId: 'agency-sahara',
    roomTypeId: 'RT-STD-QUEEN',
    rateCodeId: 'RC-AGENT-NET',
    checkIn: '2026-10-20',
    checkOut: '2026-10-22',
    adults: 1,
    children: 0,
    childAges: [],
    totalAmount: 800,
    currency: 'USD',
    specialRequests: '',
    notes: '',
    currentVersion: 1,
    createdAt: '2026-09-19T07:00:00Z',
    updatedAt: '2026-09-19T11:00:00Z',
    reviewedBy: 'USR-002',
    reviewedAt: '2026-09-19T11:00:00Z',
    rejectionReason: 'Agency agreement has expired. Contact reservations to renew partnership.',
  },
  {
    id: 'BKG-006',
    humanId: 'BKG-2026-0006',
    state: 'Confirmed',
    propertyId: 'PROP-001',
    agentId: 'agent-raj',
    agencyId: 'agency-wanderlust',
    guestId: 'GST-006',
    roomTypeId: 'RT-ROYAL-SUITE',
    rateCodeId: 'RC-RACK',
    checkIn: '2026-09-22',
    checkOut: '2026-09-26',
    adults: 2,
    children: 2,
    childAges: [5, 10],
    totalAmount: 12000,
    currency: 'USD',
    specialRequests: 'Airport transfer, butler service, dietary: halal',
    notes: 'Diamond VIP — arriving by private jet',
    operaConfirmationId: 'OP-CONF-10006',
    operaCorrelationId: 'OP-CORR-10006',
    currentVersion: 1,
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-20T08:00:00Z',
    reviewedBy: 'USR-004',
    reviewedAt: '2026-09-02T09:00:00Z',
  },
  {
    id: 'BKG-007',
    humanId: 'BKG-2026-0007',
    state: 'Draft',
    propertyId: 'PROP-001',
    guestId: 'GST-007',
    agentId: 'agent-kenji',
    agencyId: 'agency-pacific',
    roomTypeId: 'RT-SUP-TWIN',
    rateCodeId: 'RC-AGENT-COMM',
    checkIn: '2026-11-01',
    checkOut: '2026-11-03',
    adults: 2,
    children: 0,
    childAges: [],
    totalAmount: 1600,
    currency: 'USD',
    specialRequests: '',
    notes: 'Agent drafting — awaiting guest passport details',
    currentVersion: 1,
    createdAt: '2026-09-21T06:00:00Z',
    updatedAt: '2026-09-21T06:00:00Z',
  },
  {
    id: 'BKG-008',
    humanId: 'BKG-2026-0008',
    state: 'Resubmitted',
    propertyId: 'PROP-001',
    guestId: 'GST-008',
    agentId: 'agent-elena',
    agencyId: 'agency-wanderlust',
    roomTypeId: 'RT-DLX-KING',
    rateCodeId: 'RC-AGENT-NET',
    checkIn: '2026-10-15',
    checkOut: '2026-10-18',
    adults: 2,
    children: 0,
    childAges: [],
    totalAmount: 2400,
    currency: 'USD',
    specialRequests: 'Connecting rooms if possible',
    notes: 'Re-quoted with updated rate code per hotel request',
    currentVersion: 2,
    createdAt: '2026-09-14T09:00:00Z',
    updatedAt: '2026-09-21T10:00:00Z',
  },
  {
    id: 'BKG-009',
    humanId: 'BKG-2026-0009',
    state: 'CheckedOut',
    propertyId: 'PROP-001',
    guestId: 'GST-009',
    agentId: 'agent-yuki',
    roomTypeId: 'RT-STD-QUEEN',
    rateCodeId: 'RC-AGENT-COMM',
    checkIn: '2026-09-15',
    checkOut: '2026-09-18',
    adults: 1,
    children: 0,
    childAges: [],
    totalAmount: 1200,
    currency: 'USD',
    specialRequests: 'Japanese-language TV channels',
    notes: '',
    operaConfirmationId: 'OP-CONF-10009',
    operaCorrelationId: 'OP-CORR-10009',
    currentVersion: 1,
    createdAt: '2026-08-20T05:00:00Z',
    updatedAt: '2026-09-18T12:00:00Z',
    reviewedBy: 'USR-002',
    reviewedAt: '2026-08-21T09:00:00Z',
  },
  {
    id: 'BKG-010',
    humanId: 'BKG-2026-0010',
    state: 'Cancelled',
    propertyId: 'PROP-001',
    guestId: 'GST-010',
    agentId: 'agent-carlos',
    roomTypeId: 'RT-PREM-SUITE',
    rateCodeId: 'RC-AGENT-NET',
    checkIn: '2026-10-05',
    checkOut: '2026-10-09',
    adults: 2,
    children: 0,
    childAges: [],
    totalAmount: 6400,
    currency: 'USD',
    specialRequests: '',
    notes: '',
    operaConfirmationId: 'OP-CONF-10010',
    operaCorrelationId: 'OP-CORR-10010',
    currentVersion: 1,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-20T14:00:00Z',
    reviewedBy: 'USR-002',
    reviewedAt: '2026-09-02T11:00:00Z',
    cancellationReason: 'Guest travel plans changed — requested full cancellation',
  },
  {
    id: 'BKG-011',
    humanId: 'BKG-2026-0011',
    state: 'OperaCreationInProgress',
    propertyId: 'PROP-001',
    guestId: 'GST-011',
    agentId: 'agent-ling',
    agencyId: 'agency-wanderlust',
    roomTypeId: 'RT-SUP-TWIN',
    rateCodeId: 'RC-AGENT-NET',
    checkIn: '2026-10-08',
    checkOut: '2026-10-11',
    adults: 2,
    children: 0,
    childAges: [],
    totalAmount: 2400,
    currency: 'USD',
    specialRequests: 'Early check-in requested',
    notes: 'Approved — pushing to OPERA',
    operaCorrelationId: 'OP-CORR-10011',
    currentVersion: 1,
    createdAt: '2026-09-16T13:00:00Z',
    updatedAt: '2026-09-21T08:00:00Z',
    reviewedBy: 'USR-002',
    reviewedAt: '2026-09-21T07:50:00Z',
  },
  {
    id: 'BKG-012',
    humanId: 'BKG-2026-0012',
    state: 'Confirmed',
    propertyId: 'PROP-001',
    guestId: 'GST-012',
    agentId: 'agent-fatima',
    agencyId: 'agency-sahara',
    roomTypeId: 'RT-ROYAL-SUITE',
    rateCodeId: 'RC-AGENT-NET',
    checkIn: '2026-10-12',
    checkOut: '2026-10-17',
    adults: 2,
    children: 3,
    childAges: [3, 7, 12],
    totalAmount: 15000,
    currency: 'USD',
    specialRequests: 'Royal suite setup, halal kitchen, nanny service',
    notes: 'High-value booking — despite expired agency agreement, GM approved',
    operaConfirmationId: 'OP-CONF-10012',
    operaCorrelationId: 'OP-CORR-10012',
    currentVersion: 1,
    createdAt: '2026-09-08T11:00:00Z',
    updatedAt: '2026-09-12T16:00:00Z',
    reviewedBy: 'USR-004',
    reviewedAt: '2026-09-09T10:00:00Z',
  },
];

// PROTO: Version data is minimal — just enough for the diff viewer
const MOCK_VERSIONS: BookingVersion[] = [
  {
    versionId: 'VER-003-01',
    bookingId: 'BKG-003',
    version: 1,
    submittedBy: 'agent-raj',
    submittedAt: '2026-09-15T11:00:00Z',
    guestData: {
      firstName: 'Isabelle',
      lastName: 'Moreau',
      email: 'isabelle.moreau@example.com',
      phone: '+33-6-12-34-56-78',
      nationality: 'FR',
    },
    stayData: {
      checkIn: '2026-10-10',
      checkOut: '2026-10-14',
      roomTypeId: 'RT-PREM-SUITE',
      adults: 2,
      children: 0,
      childAges: [],
      rateCodeId: 'RC-AGENT-NET',
      totalAmount: 5600,
      currency: 'USD',
      taxAmount: 560,
      cancellationPolicy: '48h',
    },
    rateData: {
      rateCodeId: 'RC-AGENT-NET',
      pricePerNight: 1400,
      totalAmount: 5600,
      currency: 'USD',
    },
    notes: 'Initial submission with net rate',
  },
  {
    versionId: 'VER-003-02',
    bookingId: 'BKG-003',
    version: 2,
    submittedBy: 'agent-raj',
    submittedAt: '2026-09-20T16:00:00Z',
    guestData: {
      firstName: 'Isabelle',
      lastName: 'Moreau',
      email: 'isabelle.moreau@example.com',
      phone: '+33-6-12-34-56-78',
      nationality: 'FR',
    },
    stayData: {
      checkIn: '2026-10-10',
      checkOut: '2026-10-14',
      roomTypeId: 'RT-PREM-SUITE',
      adults: 2,
      children: 0,
      childAges: [],
      rateCodeId: 'RC-AGENT-NET',
      totalAmount: 6400,
      currency: 'USD',
      taxAmount: 640,
      cancellationPolicy: '48h',
    },
    rateData: {
      rateCodeId: 'RC-AGENT-NET',
      pricePerNight: 1600,
      totalAmount: 6400,
      currency: 'USD',
    },
    notes: 'Re-quoted at Q4 rate per hotel request',
    changes: [
      { field: 'rateData.pricePerNight', previousValue: 1400, newValue: 1600 },
      { field: 'rateData.totalAmount', previousValue: 5600, newValue: 6400 },
      { field: 'stayData.totalAmount', previousValue: 5600, newValue: 6400 },
      { field: 'stayData.taxAmount', previousValue: 560, newValue: 640 },
    ],
  },
  {
    versionId: 'VER-008-01',
    bookingId: 'BKG-008',
    version: 1,
    submittedBy: 'agent-elena',
    submittedAt: '2026-09-14T09:00:00Z',
    guestData: {
      firstName: 'Liam',
      lastName: "O'Brien",
      email: 'liam.obrien@example.com',
      phone: '+353-87-123-4567',
      nationality: 'IE',
    },
    stayData: {
      checkIn: '2026-10-15',
      checkOut: '2026-10-18',
      roomTypeId: 'RT-DLX-KING',
      adults: 2,
      children: 0,
      childAges: [],
      rateCodeId: 'RC-AGENT-NET',
      totalAmount: 2100,
      currency: 'USD',
      taxAmount: 210,
      cancellationPolicy: '48h',
    },
    rateData: {
      rateCodeId: 'RC-AGENT-NET',
      pricePerNight: 700,
      totalAmount: 2100,
      currency: 'USD',
    },
    notes: 'Initial submission',
  },
  {
    versionId: 'VER-008-02',
    bookingId: 'BKG-008',
    version: 2,
    submittedBy: 'agent-elena',
    submittedAt: '2026-09-21T10:00:00Z',
    guestData: {
      firstName: 'Liam',
      lastName: "O'Brien",
      email: 'liam.obrien@example.com',
      phone: '+353-87-123-4567',
      nationality: 'IE',
    },
    stayData: {
      checkIn: '2026-10-15',
      checkOut: '2026-10-18',
      roomTypeId: 'RT-DLX-KING',
      adults: 2,
      children: 0,
      childAges: [],
      rateCodeId: 'RC-AGENT-NET',
      totalAmount: 2400,
      currency: 'USD',
      taxAmount: 240,
      cancellationPolicy: '48h',
    },
    rateData: {
      rateCodeId: 'RC-AGENT-NET',
      pricePerNight: 800,
      totalAmount: 2400,
      currency: 'USD',
    },
    notes: 'Re-quoted with updated rate code per hotel request',
    changes: [
      { field: 'rateData.pricePerNight', previousValue: 700, newValue: 800 },
      { field: 'rateData.totalAmount', previousValue: 2100, newValue: 2400 },
      { field: 'stayData.totalAmount', previousValue: 2100, newValue: 2400 },
      { field: 'stayData.taxAmount', previousValue: 210, newValue: 240 },
    ],
  },
];

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

// ── Implementation ─────────────────────────────────────────────────────────

export class MockBookingRepository implements IBookingRepository {
  // PROTO: mutable copy so state transitions work within a session
  private bookings: BookingRequest[] = [...MOCK_BOOKINGS];
  private versions: BookingVersion[] = [...MOCK_VERSIONS];

  async getBookings(
    filters: BookingFilters,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<BookingRequest>> {
    await delay(120);

    let result = [...this.bookings];

    // Filter by state
    if (filters.state) {
      const states = Array.isArray(filters.state) ? filters.state : [filters.state];
      result = result.filter((b) => states.includes(b.state));
    }

    // Filter by propertyId
    if (filters.propertyId) {
      result = result.filter((b) => b.propertyId === filters.propertyId);
    }

    // Filter by agentId
    if (filters.agentId) {
      result = result.filter((b) => b.agentId === filters.agentId);
    }

    // Filter by agencyId
    if (filters.agencyId) {
      result = result.filter((b) => b.agencyId === filters.agencyId);
    }

    // Filter by guestId
    if (filters.guestId) {
      result = result.filter((b) => b.guestId === filters.guestId);
    }

    // Filter by source

    // Filter by dateRange (on checkIn)
    if (filters.dateRange) {
      if (filters.dateRange.from) {
        result = result.filter((b) => b.checkIn >= filters.dateRange!.from!);
      }
      if (filters.dateRange.to) {
        result = result.filter((b) => b.checkIn <= filters.dateRange!.to!);
      }
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
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sort.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    } else {
      // Default sort: newest first by updatedAt
      result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    return paginate(result, pagination);
  }

  async getBookingById(
    id: string,
  ): Promise<{ booking: BookingRequest; versions: readonly BookingVersion[] } | null> {
    await delay(80);

    const booking = this.bookings.find((b) => b.id === id || b.humanId === id);
    if (!booking) return null;

    const versions = this.versions
      .filter((v) => v.bookingId === booking.id)
      .sort((a, b) => a.version - b.version);

    return { booking, versions };
  }

  async createBooking(data: CreateBookingData): Promise<BookingRequest> {
    await delay(150);

    const id = `BKG-${String(this.bookings.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    // PROTO: simplified creation — no full validation
    const booking: BookingRequest = {
      id,
      humanId: `BKG-2026-${String(this.bookings.length + 1).padStart(4, '0')}`,
      state: 'Draft',
      propertyId: data.propertyId,
      guestId: `GST-NEW-${Date.now()}`,
      agentId: data.agentId,
      agencyId: data.agencyId,
      roomTypeId: data.stayData.roomTypeId,
      rateCodeId: data.stayData.rateCodeId,
      checkIn: data.stayData.checkIn,
      checkOut: data.stayData.checkOut,
      adults: data.stayData.adults,
      children: data.stayData.children,
      childAges: data.stayData.childAges,
      totalAmount: data.stayData.totalAmount,
      currency: data.stayData.currency,
      specialRequests: data.specialRequests ?? '',
      notes: data.notes ?? '',
      currentVersion: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.bookings.push(booking);
    return booking;
  }

  async submitBooking(id: string): Promise<BookingRequest> {
    return this.updateBookingState(id, 'Submitted');
  }

  async updateBookingState(
    id: string,
    state: BookingState,
    metadata?: BookingStateMetadata,
  ): Promise<BookingRequest> {
    await delay(100);

    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Booking not found: ${id}`);
    }

    const now = new Date().toISOString();
    const updated: BookingRequest = {
      ...this.bookings[index]!,
      state,
      updatedAt: now,
      reviewedBy: metadata?.reviewedBy ?? this.bookings[index]!.reviewedBy,
      reviewedAt: metadata?.reviewedBy ? now : this.bookings[index]!.reviewedAt,
      rejectionReason: metadata?.rejectionReason ?? this.bookings[index]!.rejectionReason,
      cancellationReason: metadata?.cancellationReason ?? this.bookings[index]!.cancellationReason,
      operaConfirmationId: metadata?.operaConfirmationId ?? this.bookings[index]!.operaConfirmationId,
      operaCorrelationId: metadata?.operaCorrelationId ?? this.bookings[index]!.operaCorrelationId,
    };

    this.bookings[index] = updated;
    return updated;
  }

  async createVersion(
    bookingId: string,
    data: CreateVersionData,
  ): Promise<BookingVersion> {
    await delay(100);

    const existing = this.versions.filter((v) => v.bookingId === bookingId);
    const nextVersion = existing.length + 1;

    const version: BookingVersion = {
      versionId: `VER-${bookingId}-${String(nextVersion).padStart(2, '0')}`,
      bookingId,
      version: nextVersion,
      submittedBy: data.submittedBy,
      submittedAt: new Date().toISOString(),
      guestData: data.guestData,
      stayData: data.stayData as BookingVersion['stayData'],
      rateData: data.rateData,
      notes: data.notes,
    };

    this.versions.push(version);

    // Update booking currentVersion
    const bIdx = this.bookings.findIndex((b) => b.id === bookingId);
    if (bIdx !== -1) {
      this.bookings[bIdx] = {
        ...this.bookings[bIdx]!,
        currentVersion: nextVersion,
        updatedAt: new Date().toISOString(),
      };
    }

    return version;
  }

  async getVersions(bookingId: string): Promise<readonly BookingVersion[]> {
    await delay(60);
    return this.versions
      .filter((v) => v.bookingId === bookingId)
      .sort((a, b) => a.version - b.version);
  }

  async getVersionDiff(
    bookingId: string,
    fromVersion: number,
    toVersion: number,
  ): Promise<VersionDiff> {
    await delay(60);

    const to = this.versions.find(
      (v) => v.bookingId === bookingId && v.version === toVersion,
    );

    // PROTO: return the stored changes on the target version; real impl
    // would compute a proper field-level diff
    return {
      bookingId,
      fromVersion,
      toVersion,
      changes: to?.changes ?? [],
    };
  }

  async searchBookings(
    query: string,
    filters?: BookingSearchFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<BookingRequest>> {
    await delay(150);

    const lowerQuery = query.toLowerCase();

    let result = this.bookings.filter((b) => {
      // Search by humanId
      if (b.humanId.toLowerCase().includes(lowerQuery)) return true;
      if (b.id.toLowerCase().includes(lowerQuery)) return true;

      // Search by guest name (lookup from fixtures)
      const guest = guests.find((g) => g.id === b.guestId);
      if (guest) {
        const guestName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
        if (guestName.includes(lowerQuery)) return true;
      }

      // Search by opera confirmation
      if (b.operaConfirmationId?.toLowerCase().includes(lowerQuery)) return true;

      return false;
    });

    // Apply additional filters
    if (filters?.states && filters.states.length > 0) {
      result = result.filter((b) => filters.states!.includes(b.state));
    }
    if (filters?.agentId) {
      result = result.filter((b) => b.agentId === filters.agentId);
    }
    if (filters?.checkInFrom) {
      result = result.filter((b) => b.checkIn >= filters.checkInFrom!);
    }
    if (filters?.checkInTo) {
      result = result.filter((b) => b.checkIn <= filters.checkInTo!);
    }

    return paginate(result, pagination ?? { page: 1, pageSize: 20 });
  }

  async getBookingPace(period: string, throughDate: string): Promise<BookingPace> {
    await delay(80);
    // PROTO: previous month is a fixed August baseline; the reporting backend supplies real history
    return { ...buildBookingPace(bookingFixtures, throughDate, priorMonthDailyBookings), period };
  }

  async getBookingTrend(throughMonth: string, months: number): Promise<readonly MonthlyBookingTrend[]> {
    await delay(80);
    // PROTO: history is a fixed fixture; the current month is derived from booking fixtures
    return [...priorBookingTrend, currentMonthTrend(bookingFixtures, throughMonth)].slice(-months);
  }
}

export const mockBookingRepository = new MockBookingRepository();
