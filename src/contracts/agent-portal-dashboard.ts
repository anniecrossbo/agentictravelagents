/**
 * Agent portal dashboard contract.
 *
 * Data the agent-side dashboard displays: commission per hotel,
 * pipeline value breakdown, booking pace, client list with chat threads,
 * and the booking pipeline kanban.
 *
 * // PROTO: all data is faked via fixtures in src/mocks/agent-portal.ts
 */

export interface HotelCommission {
  readonly hotelName: string;
  readonly amount: number;
  readonly currency: string;
  readonly isOverdue: boolean;
}

export interface CommissionSummary {
  readonly total: number;
  readonly currency: string;
  readonly changePct: number;
  readonly hotels: readonly HotelCommission[];
}

export interface PipelineStageSummary {
  readonly stage: string;
  readonly stageKey: string;
  readonly dealCount: number;
}

export interface PipelineValueSummary {
  readonly total: number;
  readonly currency: string;
  readonly activeDeals: number;
  readonly stages: readonly PipelineStageSummary[];
}

export interface BookingPaceWeek {
  readonly thisWeek: number;
  readonly lastWeek: number;
  readonly changePct: number;
  readonly thisWeekSeries: readonly number[];
  readonly lastWeekSeries: readonly number[];
  readonly labels: readonly string[];
}

export type ChatStatus = 'need_attention' | 'ai_ongoing' | 'resolved';
export type MessageChannel = 'chat' | 'email' | 'whatsapp';

export interface ChatThread {
  readonly id: string;
  readonly name: string;
  readonly status: ChatStatus;
  readonly lastActivity: string;
  readonly statusSubtitle?: string;
  readonly channel?: MessageChannel;
}

export interface ClientDocument {
  readonly id: string;
  readonly name: string;
  readonly fileLine: string;
  readonly status: 'pending' | 'approved' | 'rejected' | 'expired';
  readonly fileSize?: string;
  readonly fileType?: 'pdf' | 'image' | 'document';
  readonly category?: string;
  readonly uploadedBy?: string;
  readonly uploadedAt?: string;
}

export interface ClientSummary {
  readonly text: string;
  readonly keyPoints: readonly string[];
  readonly suggestedNextStep?: string;
  readonly generatedAt: string;
  readonly isStale: boolean;
}

export interface ClientEntry {
  readonly id: string;
  readonly initials: string;
  readonly name: string;
  readonly roomNumber?: string;
  readonly isVip: boolean;
  readonly chatCount: number;
  readonly avatarColor: string;
  readonly threads?: readonly ChatThread[];
  readonly isDeparting?: boolean;
  readonly channels?: readonly MessageChannel[];
  readonly summary?: ClientSummary;
  readonly documents?: readonly ClientDocument[];
  readonly stayDates?: string;
  readonly stayStatus?: 'upcoming' | 'checked_in' | 'departing' | 'checked_out';
}

export type AgentActionType =
  | 'booking_approval'
  | 'document_missing'
  | 'rate_approval'
  | 'payment_overdue'
  | 'balance_due';

export type ActionIconVariant = 'approve' | 'document' | 'rate' | 'payment' | 'calendar';

export interface AgentActionItem {
  readonly id: string;
  readonly type: AgentActionType;
  readonly titleKey: string;
  readonly clientName: string;
  readonly clientInitials: string;
  readonly clientAvatarColor: string;
  readonly isVip?: boolean;
  readonly agencyName?: string;
  readonly subtitle: string;
  readonly reasoningText: string;
  readonly iconVariant: ActionIconVariant;
  readonly urgency: 'low' | 'medium' | 'high';
  readonly createdAt: string;
}

export interface MessageAttachment {
  readonly name: string;
  readonly size: string;
}

export interface AgentChatMessage {
  readonly id: string;
  readonly body: string;
  readonly author: string;
  readonly time: string;
  readonly sender: 'client' | 'ai' | 'agent';
  readonly channel?: MessageChannel;
  readonly title?: string;
  readonly attachments?: readonly MessageAttachment[];
}

export interface PipelineCard {
  readonly id: string;
  readonly initials: string;
  readonly name: string;
  readonly location: string;
  readonly amount: number;
  readonly currency: string;
  readonly avatarColor: string;
}

export interface PipelineColumn {
  readonly stageKey: string;
  readonly cards: readonly PipelineCard[];
}

export interface AgentBookingListItem {
  readonly id: string;
  readonly guestName: string;
  readonly guestInitials: string;
  readonly avatarColor: string;
  readonly subtitle: string;
  readonly status: {
    readonly labelKey: string;
    readonly tone: 'positive' | 'danger' | 'neutral';
  };
  readonly amountGenerated: number;
  readonly currency: string;
  readonly customerId?: string;
}

export interface AgentHotelBreakdown {
  readonly hotelName: string;
  readonly amount: number;
  readonly currency: string;
  readonly pct: number;
}

export interface AgentPortalBookingOverview {
  readonly totalClients: number;
  readonly changePctVsLastMonth: number;
  readonly activeClients: number;
  readonly avgClientValue: number;
  readonly avgClientValueCurrency: string;
  readonly newThisMonth: number;
  readonly hotelBreakdown: readonly AgentHotelBreakdown[];
}

// ── Finance page types ──────────────────────────────────────────────────────

export type FinancePaymentStatus = 'settled' | 'pending' | 'overdue' | 'due';

export interface FinancePaymentRow {
  readonly id: string;
  readonly date: string;
  readonly guestName: string;
  readonly agentName: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: FinancePaymentStatus;
}

export interface PayoutItem {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly avatarColor: string;
  readonly roomType: string;
  readonly stayDates: string;
  readonly amount: number;
  readonly currency: string;
}

export interface RevenueStageCard {
  readonly id: string;
  readonly initials: string;
  readonly name: string;
  readonly avatarColor: string;
  readonly dates: string;
  readonly nights: string;
  readonly amount: number;
  readonly currency: string;
  readonly statusKey?: string;
  readonly statusTone?: 'neutral' | 'danger' | 'positive' | 'warning';
  readonly channel?: string;
}

export interface RevenueStageColumn {
  readonly stageKey: string;
  readonly count: number;
  readonly total: number;
  readonly currency: string;
  readonly progressPct: number;
  readonly progressLabel: string;
  readonly weekOverWeekPct: number;
  readonly cards: readonly RevenueStageCard[];
}

export interface RevenuePipelineSummary {
  readonly realised: number;
  readonly forecast: number;
  readonly target: number;
  readonly targetPct: number;
  readonly lost: number;
  readonly currency: string;
  readonly period: string;
  readonly subtitle: string;
}

export interface CommissionEarned {
  readonly total: number;
  readonly pendingAmount: number;
  readonly paidAmount: number;
  readonly changePct: number;
  readonly currency: string;
}

// ── Customer detail types ───────────────────────────────────────────────────

export interface CustomerTravelPreference {
  readonly key: string;
  readonly labelKey: string;
  readonly value: string;
}

export interface CustomerBookingHistoryRow {
  readonly id: string;
  readonly guestName: string;
  readonly bookingRef: string;
  readonly guestCount: number;
  readonly initials: string;
  readonly avatarColor: string;
  readonly dates: string;
  readonly amount: number;
  readonly currency: string;
  readonly hotelName: string;
  readonly status: 'pending' | 'confirmed' | 'cancelled' | 'checked_out';
}

export interface CustomerDocument {
  readonly id: string;
  readonly name: string;
  readonly fileName: string;
  readonly uploadedDate: string;
  readonly fileType: string;
  readonly fileSize: string;
  readonly expiryInfo?: string;
  readonly expiryTone?: 'danger' | 'warning' | 'positive' | 'neutral';
  readonly statusKey: string;
  readonly statusTone: 'positive' | 'danger' | 'warning' | 'neutral';
}

export interface CustomerDetail {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly email: string;
  readonly phone: string;
  readonly initials: string;
  readonly avatarColor: string;
  readonly isVip: boolean;
  readonly currentMonthBookings: number;
  readonly currentMonthValue: number;
  readonly last90DaysBookings: number;
  readonly last90DaysValue: number;
  readonly ytdBookings: number;
  readonly ytdValue: number;
  readonly currency: string;
  readonly travelPreferences: readonly CustomerTravelPreference[];
  readonly specialRequirements?: string;
  readonly loyaltyPrograms?: readonly string[];
  readonly notes?: string;
  readonly bookings: readonly CustomerBookingHistoryRow[];
  readonly documents: readonly CustomerDocument[];
}

export interface IAgentPortalDashboardService {
  getCommissionSummary(): Promise<CommissionSummary>;
  getPipelineValue(): Promise<PipelineValueSummary>;
  getBookingPace(): Promise<BookingPaceWeek>;
  getClients(): Promise<readonly ClientEntry[]>;
  getPipelineBoard(): Promise<readonly PipelineColumn[]>;
  getActions(): Promise<readonly AgentActionItem[]>;
  getBookingsList(): Promise<readonly AgentBookingListItem[]>;
  getBookingOverview(): Promise<AgentPortalBookingOverview>;
  getFinancePayments(): Promise<readonly FinancePaymentRow[]>;
  getPayoutItems(): Promise<readonly PayoutItem[]>;
  getRevenuePipeline(): Promise<{ summary: RevenuePipelineSummary; columns: readonly RevenueStageColumn[] }>;
  getCommissionEarned(): Promise<CommissionEarned>;
  getCustomerDetail(id: string): Promise<CustomerDetail>;
}
