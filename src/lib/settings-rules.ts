/**
 * Settings administration rules (PRD v6 §7.19). Framework-free.
 *
 * These are guards, not cosmetics — each one blocks a change the PRD says
 * must not be possible:
 *  - §7.19.1 the final full administrator cannot be removed or demoted;
 *  - §7.19.4 the active default voucher template cannot be archived until
 *    another active template becomes default.
 */

import type { Capability, User, UserRole, VoucherTemplate, Document, BookingRequest } from './types';

// ── Permission grouping (§7.19.2) ───────────────────────────────────────────

export type CapabilityGroup = 'view' | 'act' | 'approve' | 'export' | 'administer';

export const CAPABILITY_GROUPS: { group: CapabilityGroup; labelKey: string; capabilities: Capability[] }[] = [
  {
    group: 'view',
    labelKey: 'settings.rolesSection.groups.view',
    capabilities: [
      'view_operational_home',
      'view_guest_stay_details',
      'view_agent_commercial_terms',
      'view_finance_detail',
    ],
  },
  {
    group: 'act',
    labelKey: 'settings.rolesSection.groups.act',
    capabilities: [
      'request_booking_changes',
      'modify_confirmed_reservation',
      'assign_rates',
      'mark_collected_paid',
    ],
  },
  {
    group: 'approve',
    labelKey: 'settings.rolesSection.groups.approve',
    capabilities: ['approve_reject_booking', 'review_documents', 'approve_settlement'],
  },
  {
    group: 'export',
    labelKey: 'settings.rolesSection.groups.export',
    capabilities: ['export_finance'],
  },
  {
    group: 'administer',
    labelKey: 'settings.rolesSection.groups.administer',
    capabilities: [
      'manage_team_roles',
      'manage_document_rules',
      'manage_voucher_templates',
      'manage_settings',
    ],
  },
];

/** Capabilities the UI must call out before they are granted (§7.19.2 step 3). */
const HIGH_RISK: ReadonlySet<Capability> = new Set<Capability>([
  'manage_team_roles',
  'manage_settings',
  'approve_settlement',
  'mark_collected_paid',
  'export_finance',
]);

export function isHighRisk(capability: Capability): boolean {
  return HIGH_RISK.has(capability);
}

/** Capability is considered administrative if it appears in the administer group. */
const ADMIN_CAPABILITIES = CAPABILITY_GROUPS.find((g) => g.group === 'administer')!.capabilities;

export function isFullAdministrator(user: User): boolean {
  const granted = new Set(user.permissions.filter((p) => p.granted).map((p) => p.capability));
  return ADMIN_CAPABILITIES.every((c) => granted.has(c));
}

// ── Team administration guards (§7.19.1) ────────────────────────────────────

export type AdminGuard = { allowed: true } | { allowed: false; reasonKey: string };

/** §7.19.1 step 5 — the last full administrator cannot be deactivated. */
export function canDeactivate(target: User, allUsers: readonly User[]): AdminGuard {
  if (target.status !== 'active') return { allowed: true };
  if (!isFullAdministrator(target)) return { allowed: true };

  const otherActiveAdmins = allUsers.filter(
    (u) => u.id !== target.id && u.status === 'active' && isFullAdministrator(u),
  );
  return otherActiveAdmins.length > 0
    ? { allowed: true }
    : { allowed: false, reasonKey: 'settings.rolesSection.lastAdminWarning' };
}

/** Changing the last administrator onto a non-admin role is the same removal. */
export function canChangeRole(
  target: User,
  nextRole: UserRole,
  allUsers: readonly User[],
  roleIsAdmin: (role: UserRole) => boolean,
): AdminGuard {
  if (!isFullAdministrator(target) || roleIsAdmin(nextRole)) return { allowed: true };
  return canDeactivate(target, allUsers);
}

/** Effective capabilities for a role, taken from an existing member of it (§7.19.1 step 2). */
export function effectiveCapabilities(role: UserRole, allUsers: readonly User[]): Capability[] {
  const member = allUsers.find((u) => u.role === role);
  if (!member) return [];
  return member.permissions.filter((p) => p.granted).map((p) => p.capability);
}

// ── Voucher template guards (§7.19.4) ───────────────────────────────────────

export function canArchiveTemplate(
  template: VoucherTemplate,
  allTemplates: readonly VoucherTemplate[],
): AdminGuard {
  if (!template.isDefault) return { allowed: true };
  const otherActive = allTemplates.filter(
    (t) => t.id !== template.id && (t.state === 'ActiveNonDefault' || t.state === 'Default'),
  );
  return otherActive.length > 0
    ? { allowed: false, reasonKey: 'settings.vouchersSection.reassignDefaultFirst' }
    : { allowed: false, reasonKey: 'settings.vouchersSection.cannotArchiveDefault' };
}

export function canSetDefault(template: VoucherTemplate): AdminGuard {
  if (template.state === 'Draft') {
    return { allowed: false, reasonKey: 'settings.vouchersSection.draftCannotDefault' };
  }
  if (template.state === 'Archived') {
    return { allowed: false, reasonKey: 'settings.vouchersSection.archivedCannotDefault' };
  }
  return { allowed: true };
}

// ── Required document impact (§7.19.3 step 2) ───────────────────────────────

export type DocumentImpact = {
  /** Active bookings that would become incomplete if the type becomes required. */
  affectedBookingIds: string[];
  affectedCount: number;
};

const ACTIVE_BOOKING_STATES = new Set(['Confirmed', 'CheckedIn', 'Amended', 'ModificationPending']);

export function previewRequiredDocumentImpact(
  documentTypeName: string,
  bookings: readonly BookingRequest[],
  documents: readonly Document[],
): DocumentImpact {
  const active = bookings.filter((b) => ACTIVE_BOOKING_STATES.has(b.state));
  const satisfied = new Set(
    documents
      .filter((d) => d.type === documentTypeName && (d.status === 'approved' || d.status === 'under_review'))
      .map((d) => d.bookingId)
      .filter((id): id is string => id != null),
  );

  const affected = active.filter((b) => !satisfied.has(b.id)).map((b) => b.id);
  return { affectedBookingIds: affected, affectedCount: affected.length };
}
