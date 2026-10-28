import type { User, Permission, Capability } from '../lib/types';

function grantAll(capabilities: Capability[]): readonly Permission[] {
  return capabilities.map((c) => ({ capability: c, granted: true }));
}

export const users: readonly User[] = [
  {
    id: 'USR-002',
    firstName: 'Marcus',
    lastName: 'Rivera',
    email: 'marcus.rivera@grandplazadubai.com',
    role: 'reservation_manager',
    status: 'active',
    propertyId: 'PROP-001',
    permissions: grantAll([
      'view_operational_home',
      'view_guest_stay_details',
      'approve_reject_booking',
      'request_booking_changes',
      'modify_confirmed_reservation',
      'review_documents',
      'view_agent_commercial_terms',
      'manage_voucher_templates',
    ]),
    lastAccessAt: '2026-09-21T07:45:00+04:00',
    createdAt: '2025-11-01T09:00:00+04:00',
    updatedAt: '2026-09-21T07:45:00+04:00',
  },
  {
    id: 'USR-003',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@grandplazadubai.com',
    role: 'revenue_manager',
    status: 'active',
    propertyId: 'PROP-001',
    permissions: grantAll([
      'view_operational_home',
      'view_guest_stay_details',
      'view_agent_commercial_terms',
      'assign_rates',
      'view_finance_detail',
      'approve_settlement',
      'mark_collected_paid',
      'export_finance',
    ]),
    lastAccessAt: '2026-09-21T06:30:00+04:00',
    createdAt: '2025-08-20T09:00:00+04:00',
    updatedAt: '2026-09-21T06:30:00+04:00',
  },
  {
    id: 'USR-004',
    firstName: 'James',
    lastName: 'Okafor',
    email: 'james.okafor@grandplazadubai.com',
    role: 'general_manager',
    status: 'active',
    propertyId: 'PROP-001',
    permissions: grantAll([
      'view_operational_home',
      'view_guest_stay_details',
      'approve_reject_booking',
      'request_booking_changes',
      'modify_confirmed_reservation',
      'review_documents',
      'view_agent_commercial_terms',
      'assign_rates',
      'view_finance_detail',
      'approve_settlement',
      'mark_collected_paid',
      'export_finance',
      'manage_team_roles',
      'manage_document_rules',
      'manage_voucher_templates',
      'manage_settings',
    ]),
    lastAccessAt: '2026-09-20T18:00:00+04:00',
    createdAt: '2025-06-01T09:00:00+04:00',
    updatedAt: '2026-09-20T18:00:00+04:00',
  },
];

export const currentUser = users[0]!;
