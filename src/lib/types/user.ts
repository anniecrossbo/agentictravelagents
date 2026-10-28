export type UserRole =
  | 'reservation_manager'
  | 'revenue_manager'
  | 'general_manager';

export type UserStatus = 'active' | 'inactive' | 'pending';

export type Capability =
  | 'view_operational_home'
  | 'view_guest_stay_details'
  | 'approve_reject_booking'
  | 'request_booking_changes'
  | 'modify_confirmed_reservation'
  | 'review_documents'
  | 'view_agent_commercial_terms'
  | 'assign_rates'
  | 'view_finance_detail'
  | 'approve_settlement'
  | 'mark_collected_paid'
  | 'export_finance'
  | 'manage_team_roles'
  | 'manage_document_rules'
  | 'manage_voucher_templates'
  | 'manage_settings';

export interface Permission {
  readonly capability: Capability;
  readonly granted: boolean;
  readonly scope?: string;
}

export interface User {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly propertyId: string;
  readonly permissions: readonly Permission[];
  readonly lastAccessAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
