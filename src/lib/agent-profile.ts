/**
 * Presentation logic for the agent profile. Framework-free: no react-native
 * or expo imports, so it stays unit-testable in plain Node.
 */

import type {
  BookingRequest,
  BookingState,
  Document,
  DocumentStatus,
  FinanceObligation,
  RateAssignment,
  RateCode,
  RoomType,
} from './types';
import { daysBetween, shortDate } from './dates';
import type { RateTagTone } from './room-detail';

// ── Revenue windows ─────────────────────────────────────────────────────────

export type RevenueWindowKey = 'currentMonth' | 'last90Days' | 'ytd';

export type RevenueWindow = {
  key: RevenueWindowKey;
  bookingCount: number;
  total: number;
};

/** States that never produced revenue and are left out of the totals. */
const NON_REVENUE_STATES: readonly BookingState[] = ['Draft', 'Rejected', 'Cancelled'];

/** Bookings grouped by the date they were made, relative to the business date. */
export function revenueWindows(
  bookings: readonly BookingRequest[],
  businessDate: string,
): RevenueWindow[] {
  const counted = bookings.filter((b) => !NON_REVENUE_STATES.includes(b.state));
  const monthPrefix = businessDate.slice(0, 7);
  const yearPrefix = businessDate.slice(0, 4);

  const windowOf = (key: RevenueWindowKey, match: (b: BookingRequest) => boolean) => {
    const inWindow = counted.filter(match);
    return {
      key,
      bookingCount: inWindow.length,
      total: inWindow.reduce((sum, b) => sum + b.totalAmount, 0),
    };
  };

  return [
    windowOf('currentMonth', (b) => b.createdAt.startsWith(monthPrefix)),
    windowOf('last90Days', (b) => {
      const age = daysBetween(b.createdAt, businessDate);
      return age >= 0 && age < 90;
    }),
    windowOf('ytd', (b) => b.createdAt.startsWith(yearPrefix)),
  ];
}

// ── Action required ─────────────────────────────────────────────────────────

export type OverdueInvoice = {
  obligation: FinanceObligation;
  daysOverdue: number;
};

/** The longest-overdue receivable with money still owed, if any. */
export function mostOverdueInvoice(
  obligations: readonly FinanceObligation[],
  businessDate: string,
): OverdueInvoice | undefined {
  return obligations
    .filter(
      (o) =>
        o.type === 'to_collect' &&
        o.remainingBalance > 0 &&
        o.status !== 'written_off' &&
        o.status !== 'disputed',
    )
    .map((o) => ({ obligation: o, daysOverdue: daysBetween(o.dueDate, businessDate) }))
    .filter((x) => x.daysOverdue > 0)
    .sort((a, b) => b.daysOverdue - a.daysOverdue)[0];
}

// ── Rate plans ──────────────────────────────────────────────────────────────

/**
 * Active rate codes an account can sell: those assigned to the agent or the
 * agency, plus public rates. Pass only an agency id for an agency-level view.
 */
export function ratePlansFor(
  account: { agentId?: string; agencyId?: string },
  rateCodes: readonly RateCode[],
  assignments: readonly RateAssignment[],
): RateCode[] {
  const assigned = new Set(
    assignments
      .filter(
        (a) =>
          (a.assigneeType === 'agent' && a.assigneeId === account.agentId) ||
          (a.assigneeType === 'agency' && a.assigneeId === account.agencyId),
      )
      .map((a) => a.rateCodeId),
  );
  return rateCodes.filter((rc) => rc.isActive && (rc.isPublic || assigned.has(rc.id)));
}

/** Lowest-priced room type — the "from" basis for rates quoted outside a room context. */
export function entryRoomType(roomTypes: readonly RoomType[]): RoomType | undefined {
  return [...roomTypes].sort((a, b) => a.basePrice - b.basePrice)[0];
}

// ── Documents ───────────────────────────────────────────────────────────────

export type DocumentTag = {
  labelKey: string;
  params?: Record<string, string | number>;
  tone: RateTagTone;
};

export type DocumentCardView = {
  title: string;
  fileName: string;
  uploadedOn: string;
  status: DocumentTag;
  tags: readonly DocumentTag[];
};

const STATUS_TONE: Record<DocumentStatus, RateTagTone> = {
  missing: 'danger',
  uploaded: 'caution',
  under_review: 'caution',
  approved: 'positive',
  rejected: 'danger',
  expired: 'danger',
  replaced: 'neutral',
  quarantined: 'danger',
  not_required: 'neutral',
};

/** 'under_review' → 'underReview', matching the document.status.* copy keys. */
function statusKey(status: DocumentStatus): string {
  return status.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Expiry within this many days is called out as a warning. */
const EXPIRY_WARNING_DAYS = 30;

const FILE_FORMAT: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
};

export function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1_000))} KB`;
}

function validityTag(doc: Document, businessDate: string): DocumentTag | undefined {
  if (doc.expiryDate) {
    const date = shortDate(doc.expiryDate);
    const days = daysBetween(businessDate, doc.expiryDate);
    if (days < 0) return { labelKey: 'agent.profile.docExpired', params: { date }, tone: 'danger' };
    if (days === 0) return { labelKey: 'agent.profile.docExpiresToday', params: { date }, tone: 'caution' };
    if (days === 1) return { labelKey: 'agent.profile.docExpiresTomorrow', params: { date }, tone: 'caution' };
    if (days <= EXPIRY_WARNING_DAYS) {
      return { labelKey: 'agent.profile.docExpiresIn', params: { count: days, date }, tone: 'caution' };
    }
    return { labelKey: 'agent.profile.docValidUntil', params: { date }, tone: 'neutral' };
  }
  if (doc.status === 'uploaded' || doc.status === 'under_review') {
    return { labelKey: 'agent.profile.docAwaitingReview', tone: 'neutral' };
  }
  return undefined;
}

export function documentCardView(doc: Document, businessDate: string): DocumentCardView {
  const format = FILE_FORMAT[doc.mimeType] ?? doc.mimeType.split('/').pop()?.toUpperCase() ?? '';
  const validity = validityTag(doc, businessDate);
  return {
    title: doc.type,
    fileName: doc.fileName,
    uploadedOn: shortDate(doc.uploadedAt),
    status: { labelKey: `document.status.${statusKey(doc.status)}`, tone: STATUS_TONE[doc.status] },
    tags: [
      {
        labelKey: 'agent.profile.docFile',
        params: { format, size: formatFileSize(doc.fileSize) },
        tone: 'neutral',
      },
      ...(validity ? [validity] : []),
    ],
  };
}
