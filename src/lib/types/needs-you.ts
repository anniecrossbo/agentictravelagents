export type NeedsYouSeverity = 'critical' | 'high' | 'medium' | 'low';

export type NeedsYouState = 'open' | 'snoozed' | 'resolved' | 'dismissed';

export interface NeedsYouSignal {
  readonly id: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly rule: string;
  readonly evidence: string;
  readonly reason: string;
  readonly severity: NeedsYouSeverity;
  readonly ownerRole: string;
  readonly recommendedAction: string;
  readonly deepLink: string;
  readonly state: NeedsYouState;
  readonly snoozedUntil?: string;
  readonly resolvedAt?: string;
  readonly dismissedAt?: string;
  readonly dismissedBy?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Notification {
  readonly id: string;
  readonly eventType: string;
  readonly recipientId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly message: string;
  readonly isRead: boolean;
  readonly deepLink: string;
  readonly createdAt: string;
  readonly readAt?: string;
}
