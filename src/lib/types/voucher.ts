export type VoucherTemplateState =
  | 'Starter'
  | 'Draft'
  | 'ActiveNonDefault'
  | 'Default'
  | 'Archived';

export interface VoucherTemplate {
  readonly id: string;
  readonly name: string;
  readonly state: VoucherTemplateState;
  readonly version: number;
  readonly content: string;
  readonly language: string;
  readonly supportedLanguages: readonly string[];
  readonly propertyId: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly isDefault: boolean;
}

export type VoucherInstanceState =
  | 'NotGenerated'
  | 'Preview'
  | 'Generated'
  | 'DeliveryQueued'
  | 'Sent'
  | 'Delivered'
  | 'DeliveryFailed'
  | 'Superseded'
  | 'Revoked';

export type DeliveryChannel = 'email' | 'chat';

export type DeliveryStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced';

export interface DeliveryAttempt {
  readonly id: string;
  readonly voucherId: string;
  readonly recipientType: string;
  readonly recipientId: string;
  readonly channel: DeliveryChannel;
  readonly destination: string;
  readonly status: DeliveryStatus;
  readonly attemptedAt: string;
  readonly resultAt?: string;
  readonly failureReason?: string;
}

export interface VoucherInstance {
  readonly id: string;
  /** Human-readable identifier, e.g. 'VCH-0009'. */
  readonly humanId: string;
  readonly bookingId: string;
  readonly operaConfirmationId: string;
  readonly templateId: string;
  readonly templateVersion: number;
  readonly reservationSnapshot: Record<string, unknown>;
  readonly state: VoucherInstanceState;
  readonly language: string;
  readonly generatedBy: string;
  readonly generatedAt: string;
  readonly supersededById?: string;
  readonly revokedAt?: string;
  readonly revokedReason?: string;
  readonly deliveryAttempts: readonly DeliveryAttempt[];
}

export interface ShareLinkAccess {
  readonly accessedAt: string;
  readonly ipAddress: string;
  readonly userAgent: string;
}

export interface ShareLink {
  readonly id: string;
  readonly voucherId: string;
  readonly token: string;
  readonly recipientScope: string;
  readonly expiresAt: string;
  readonly revokedAt?: string;
  readonly accessLog: readonly ShareLinkAccess[];
}
