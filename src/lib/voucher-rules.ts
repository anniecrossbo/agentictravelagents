/**
 * Voucher issuance rules (PRD 11.3). Framework-free so the same gate can run
 * on the server: a voucher may only be issued from a reservation that is
 * currently confirmed in OPERA, and it can never imply a confirmation that
 * does not exist.
 */

import type { BookingRequest } from './types';

export type VoucherGate =
  | { allowed: true }
  | { allowed: false; reasonKey: string };

const ISSUABLE_STATES = new Set(['Confirmed', 'CheckedIn', 'CheckedOut']);

export function canGenerateVoucher(booking: BookingRequest): VoucherGate {
  if (!booking.operaConfirmationId) {
    return { allowed: false, reasonKey: 'voucher.blockedNotConfirmed' };
  }
  if (!ISSUABLE_STATES.has(booking.state)) {
    return { allowed: false, reasonKey: 'voucher.blockedNotConfirmed' };
  }
  if (!booking.guestId || !booking.roomTypeId) {
    return { allowed: false, reasonKey: 'voucher.blockedMissingFields' };
  }
  return { allowed: true };
}
