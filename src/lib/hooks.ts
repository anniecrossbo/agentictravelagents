/**
 * Data hooks for screens — wraps mock data behind a contract-compatible interface.
 * Components call these hooks instead of importing mocks directly.
 * When real APIs exist, swap the implementation here, no component changes.
 */

import { useMemo } from 'react';
import {
  bookings,
  priorMonthDailyBookings,
  priorBookingTrend,
  agents,
  agencies,
  agentPriorPeriodStats,
  guests,
  roomTypes,
  physicalRooms,
  rateCodes,
  rateAssignments,
  occupancySummaries,
  roomTypeInsights,
  roomPlaceholderImage,
  hotelExperiences,
  experienceImages,
  occupancyForecast,
  obligations,
  settlements,
  priorAgentRevenue,
  importRows,
  documents,
  documentTypes,
  voucherTemplates,
  voucherInstances,
  conversations,
  messages,
  conversationSummaries,
  needsYouSignals,
  auditEvents,
  property,
} from '../mocks';
import type { MockGuest } from '../mocks';
import type {
  BookingRequest,
  Agent,
  Agency,
  FinanceObligation,
  SettlementRecord,
  Document,
  VoucherTemplate,
  VoucherInstance,
  Conversation,
  Message,
  NeedsYouSignal,
  RoomType,
  RateCode,
  OccupancySummary,
  UserRole,
} from './types';
import { rateAssigneeNames } from './room-detail';
import { buildAgentBookingOverview, buildDirectoryRows } from './agent-directory';
import { buildSummaryView } from './conversation-view';
import { buildBookingPace } from './booking-pace';
import { currentMonthTrend } from './booking-stats';
import { agentRevenueThisMonth } from './revenue-view';

// ── Bookings ────────────────────────────────────────────────────────────────

export function useBookings() {
  return useMemo(() => {
    const todayStr = '2026-09-21';

    const todayArrivals = bookings.filter((b) => b.checkIn === todayStr && b.state === 'Confirmed');
    const todayDepartures = bookings.filter((b) => b.checkOut === todayStr);

    // The arrivals widget leads with today but keeps the days after it in view.
    const upcomingArrivals = bookings
      .filter((b) => b.checkIn >= todayStr && ['Confirmed', 'Amended'].includes(b.state))
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    const upcomingDepartures = bookings
      .filter((b) => b.checkOut >= todayStr && ['Confirmed', 'CheckedIn', 'Amended'].includes(b.state))
      .sort((a, b) => a.checkOut.localeCompare(b.checkOut));
    const pending = bookings.filter((b) => b.state === 'Submitted');
    const active = bookings.filter((b) =>
      ['Confirmed', 'CheckedIn', 'Amended'].includes(b.state),
    );

    return {
      all: bookings,
      todayArrivals,
      todayDepartures,
      upcomingArrivals,
      upcomingDepartures,
      pending,
      active,
      byId: (id: string) => bookings.find((b) => b.id === id),
      byAgent: (agentId: string) => bookings.filter((b) => b.agentId === agentId),
      byGuest: (guestId: string) => bookings.filter((b) => b.guestId === guestId),
      /** This month's booking pace against last month, through the business date. */
      pace: buildBookingPace(bookings, property.businessDate, priorMonthDailyBookings),
      /** Six months of created / confirmed / cancelled counts, oldest first. */
      // PROTO: earlier months are a fixed fixture; real build calls getBookingTrend
      trend: [...priorBookingTrend, currentMonthTrend(bookings, property.businessDate.slice(0, 7))],
    };
  }, []);
}

// ── Agents ──────────────────────────────────────────────────────────────────

export function useAgents() {
  return useMemo(() => ({
    all: agents,
    agencies,
    activeAgents: agents.filter((a) => a.status === 'active'),
    byId: (id: string) => agents.find((a) => a.id === id),
    agencyById: (id: string) => agencies.find((a) => a.id === id),
    byAgency: (agencyId: string) => agents.filter((a) => a.agencyId === agencyId),
    bookingsForAgent: (agentId: string) => bookings.filter((b) => b.agentId === agentId),
  }), []);
}

/** Agents workspace data: directory rows and the month's channel overview. */
export function useAgentOverview() {
  return useMemo(() => {
    const period = property.businessDate.slice(0, 7);
    return {
      rows: buildDirectoryRows(agencies, agents, bookings),
      overview: buildAgentBookingOverview(
        period,
        property.reportingCurrency,
        agencies,
        agents,
        bookings,
        // PROTO: fixed August baseline; real build asks the analytics service for the prior period
        agentPriorPeriodStats,
      ),
    };
  }, []);
}

// ── Guests ───────────────────────────────────────────────────────────────────

export function useGuests() {
  return useMemo(() => ({
    all: guests,
    byId: (id: string) => guests.find((g) => g.id === id),
    vipGuests: guests.filter((g) => g.isVip),
  }), []);
}

// ── Inventory ───────────────────────────────────────────────────────────────

export function useInventory() {
  return useMemo(() => {
    const totalRooms = occupancySummaries.reduce((s, o) => s + o.totalRooms, 0);
    const totalOccupied = occupancySummaries.reduce((s, o) => s + o.occupied, 0);
    const occupancyRate = totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0;

    return {
      roomTypes,
      physicalRooms,
      rateCodes,
      rateAssignments,
      occupancySummaries,
      totalRooms,
      totalOccupied,
      occupancyRate,
      availableByType: (rtId: string) => {
        const summary = occupancySummaries.find((o) => o.roomTypeId === rtId);
        return summary?.sellable ?? 0;
      },
      insightsFor: (rtId: string) => roomTypeInsights.find((i) => i.roomTypeId === rtId),
      /** Image source for a room type's hero photo (a bundled asset or a remote URI). */
      // PROTO: ignores RoomType.images and returns the shared placeholder asset
      imageFor: (_roomType: RoomType): number | { uri: string } => roomPlaceholderImage,
      experiences: hotelExperiences,
      occupancyForecast,
      /** Image source for an experience photo, or undefined when none is available. */
      experienceImageFor: (imageKey: string): number | { uri: string } | undefined =>
        experienceImages[imageKey],
      rateAssigneesFor: (rateCodeId: string) =>
        rateAssigneeNames(rateCodeId, rateAssignments, agencies, agents),
    };
  }, []);
}

// ── Finance ─────────────────────────────────────────────────────────────────

export function useFinance() {
  return useMemo(() => {
    const toCollect = obligations.filter((o) => o.type === 'to_collect');
    const toPay = obligations.filter((o) => o.type === 'to_pay');
    const totalRevenue = obligations
      .filter((o) => o.type === 'to_collect')
      .reduce((s, o) => s + (o.reportingAmount ?? o.grossAmount), 0);
    const totalCommission = obligations
      .reduce((s, o) => s + (o.commissionAmount ?? 0), 0);

    return {
      all: obligations,
      settlements,
      toCollect,
      toPay,
      totalRevenue,
      totalCommission,
      overdue: obligations.filter((o) => o.status === 'overdue'),
      disputed: obligations.filter((o) => o.status === 'disputed'),
      byBooking: (bookingId: string) => obligations.filter((o) => o.bookingId === bookingId),
      byId: (id: string) => obligations.find((o) => o.id === id),
      importRows,
      /** Agent revenue by month: history from the backend plus this month so far. */
      // PROTO: history is a fixed fixture; real build calls getAgentRevenueHistory
      agentRevenueHistory: [
        ...priorAgentRevenue,
        {
          month: property.businessDate.slice(0, 7),
          revenue: agentRevenueThisMonth(bookings, obligations, property.businessDate).revenue,
        },
      ],
      settlementsFor: (obligationId: string) =>
        settlements.filter((s) => s.obligationId === obligationId),
      /** Forecast only — kept separate from confirmed obligations (PRD v6 §12.4). */
      pendingBookingValue: bookings
        .filter((b) => b.state === 'Submitted' || b.state === 'Resubmitted')
        .reduce((s, b) => s + b.totalAmount, 0),
      pendingBookingCount: bookings.filter(
        (b) => b.state === 'Submitted' || b.state === 'Resubmitted',
      ).length,
    };
  }, []);
}

// ── Documents ───────────────────────────────────────────────────────────────

export function useDocuments() {
  return useMemo(() => ({
    all: documents,
    documentTypes,
    pendingReview: documents.filter((d) => d.status === 'under_review'),
    expiringSoon: documents.filter((d) => {
      if (!d.expiryDate) return false;
      const daysDiff = Math.floor(
        (new Date(d.expiryDate).getTime() - new Date('2026-09-21').getTime()) / 86400000,
      );
      return daysDiff >= 0 && daysDiff <= 30;
    }),
    byBooking: (bookingId: string) => documents.filter((d) => d.bookingId === bookingId),
    byAgency: (agencyId: string) => documents.filter((d) => d.agencyId === agencyId),
  }), []);
}

// ── Vouchers ────────────────────────────────────────────────────────────────

export function useVouchers() {
  return useMemo(() => ({
    templates: voucherTemplates,
    instances: voucherInstances,
    defaultTemplate: voucherTemplates.find((t) => t.isDefault),
    byBooking: (bookingId: string) => voucherInstances.filter((v) => v.bookingId === bookingId),
  }), []);
}

// ── Communications ──────────────────────────────────────────────────────────

export function useCommunications() {
  return useMemo(() => {
    const guestConversations = conversations.filter(
      (c) => c.route === 'hotel_guest',
    );
    const agentConversations = conversations.filter(
      (c) => c.route === 'hotel_agent',
    );
    const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

    return {
      all: conversations,
      messages,
      guestConversations,
      agentConversations,
      totalUnread,
      messagesFor: (convId: string) => messages.filter((m) => m.conversationId === convId),
      /** AI summary (or rule-based fallback) for one conversation. */
      summaryFor: (convId: string) =>
        buildSummaryView(
          conversationSummaries.find((cs) => cs.conversationId === convId),
          messages.filter((m) => m.conversationId === convId),
        ),
      /** Summary of the agent ↔ hotel thread attached to a booking. */
      bookingThreadSummary: (bookingId: string) => {
        const conv = conversations.find(
          (c) => c.bookingId === bookingId && c.route === 'hotel_agent',
        );
        if (!conv) return undefined;
        return buildSummaryView(
          conversationSummaries.find((cs) => cs.conversationId === conv.id),
          messages.filter((m) => m.conversationId === conv.id),
        );
      },
    };
  }, []);
}

// ── Needs You ───────────────────────────────────────────────────────────────

export function useNeedsYou(role?: UserRole) {
  return useMemo(() => {
    const open = needsYouSignals.filter((s) => s.state === 'open');
    const forRole = role ? open.filter((s) => s.ownerRole === role) : open;
    const critical = forRole.filter((s) => s.severity === 'critical');
    const high = forRole.filter((s) => s.severity === 'high');

    return {
      all: forRole,
      critical,
      high,
      count: forRole.length,
    };
  }, [role]);
}

// ── Property ────────────────────────────────────────────────────────────────

export function useProperty() {
  return useMemo(() => property, []);
}

// ── Dashboard Aggregates ────────────────────────────────────────────────────

export function useDashboardStats() {
  return useMemo(() => {
    const activeAgentCount = agents.filter((a) => a.status === 'active').length;
    const activeBookingCount = bookings.filter((b) =>
      ['Confirmed', 'CheckedIn', 'Amended'].includes(b.state),
    ).length;

    const agentBookingCounts = agents
      .filter((a) => a.status === 'active')
      .map((a) => ({
        name: a.firstName,
        count: bookings.filter(
          (b) => b.agentId === a.id && ['Confirmed', 'CheckedIn', 'Amended'].includes(b.state),
        ).length,
      }))
      .filter((a) => a.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalRevenueThisMonth = obligations
      .filter((o) => o.type === 'to_collect' && o.createdAt.startsWith('2026-09'))
      .reduce((s, o) => s + (o.reportingAmount ?? o.grossAmount), 0);

    const avgBookingValue = activeBookingCount > 0
      ? Math.round(
          bookings
            .filter((b) => ['Confirmed', 'CheckedIn', 'Amended'].includes(b.state))
            .reduce((s, b) => s + b.totalAmount, 0) / activeBookingCount,
        )
      : 0;

    const monthlyRevenue = [
      { month: 'May', amount: 18000 },
      { month: 'Jun', amount: 26000 },
      { month: 'Jul', amount: 22000 },
      { month: 'Aug', amount: 22000 },
    ];

    return {
      activeAgentCount,
      activeBookingCount,
      agentBookingCounts,
      totalRevenueThisMonth,
      avgBookingValue,
      monthlyRevenue,
    };
  }, []);
}
