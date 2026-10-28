import { useTranslation } from 'react-i18next';
import { Badge } from './Badge';

/**
 * Maps booking/document/finance/delivery statuses to Badge variants.
 * Status keys should match the i18n keys under their respective type namespace
 * (e.g. booking.state.confirmed, document.status.approved).
 */
const STATUS_VARIANT_MAP: Record<string, Record<string, 'brand' | 'positive' | 'warning' | 'danger' | 'neutral'>> = {
  booking: {
    draft: 'neutral',
    submitted: 'brand',
    approvalNeeded: 'warning',
    changesRequested: 'warning',
    resubmitted: 'brand',
    validationInProgress: 'brand',
    approvalBlocked: 'danger',
    operaCreationInProgress: 'brand',
    operaCreationFailed: 'danger',
    confirmed: 'positive',
    modificationPending: 'warning',
    checkedIn: 'positive',
    checkedOut: 'neutral',
    rejected: 'danger',
    cancelled: 'neutral',
    noShow: 'danger',
  },
  document: {
    missing: 'danger',
    uploaded: 'brand',
    underReview: 'warning',
    approved: 'positive',
    rejected: 'danger',
    expired: 'danger',
    replaced: 'neutral',
    quarantined: 'danger',
    notRequired: 'neutral',
  },
  finance: {
    pending: 'warning',
    approved: 'positive',
    partiallySettled: 'brand',
    settled: 'positive',
    overdue: 'danger',
    disputed: 'danger',
    adjusted: 'warning',
    writtenOff: 'neutral',
  },
  delivery: {
    queued: 'neutral',
    sent: 'brand',
    delivered: 'positive',
    read: 'positive',
    failed: 'danger',
    bounced: 'danger',
  },
};

type StatusBadgeProps = {
  status: string;
  type: 'booking' | 'document' | 'finance' | 'delivery';
};

/** I18n key prefixes for each status type */
const TYPE_KEY_PREFIX: Record<string, string> = {
  booking: 'booking.state',
  document: 'document.status',
  finance: 'finance.status',
  delivery: 'communication.delivery',
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const { t } = useTranslation();
  const variant = STATUS_VARIANT_MAP[type]?.[status] ?? 'neutral';
  const labelKey = `${TYPE_KEY_PREFIX[type]}.${status}`;

  return <Badge label={labelKey} variant={variant} />;
}
