/**
 * Voucher service contract.
 *
 * Manages voucher template lifecycle, voucher generation and delivery,
 * share-link creation, and revocation.
 */

import type {
  VoucherTemplate,
  VoucherInstance,
  DeliveryChannel,
  ShareLink,
} from '../lib/types';

// ── Payloads ────────────────────────────────────────────────────────────────

export interface UpdateTemplateData {
  readonly name?: string;
  readonly content?: string;
  readonly language?: string;
  readonly supportedLanguages?: readonly string[];
}

export interface VoucherPreview {
  readonly html: string;
  readonly language: string;
  readonly templateVersion: number;
}

// ── Service interface ───────────────────────────────────────────────────────

export interface IVoucherService {
  getTemplates(): Promise<readonly VoucherTemplate[]>;

  getTemplateById(id: string): Promise<VoucherTemplate | null>;

  updateTemplate(
    id: string,
    data: UpdateTemplateData,
  ): Promise<VoucherTemplate>;

  setDefaultTemplate(id: string): Promise<VoucherTemplate>;

  getVouchersByBooking(
    bookingId: string,
  ): Promise<readonly VoucherInstance[]>;

  generateVoucher(
    bookingId: string,
    templateId: string,
    language: string,
    recipientType: string,
  ): Promise<VoucherInstance>;

  previewVoucher(
    bookingId: string,
    templateId: string,
  ): Promise<VoucherPreview>;

  sendVoucher(
    voucherId: string,
    recipientId: string,
    channel: DeliveryChannel,
  ): Promise<VoucherInstance>;

  revokeVoucher(
    voucherId: string,
    reason: string,
  ): Promise<VoucherInstance>;

  regenerateVoucher(voucherId: string): Promise<VoucherInstance>;

  createShareLink(
    voucherId: string,
    recipientScope: string,
    expiresAt: string,
  ): Promise<ShareLink>;

  revokeShareLink(linkId: string): Promise<ShareLink>;
}
