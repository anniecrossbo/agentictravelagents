export type MessageChannel = 'chat' | 'email' | 'whatsapp';

export type MessageDeliveryStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'bounced';

export type ConversationRoute =
  | 'hotel_agent'
  | 'hotel_guest'
  | 'agent_guest'
  | 'agent_hotel';

export type ConversationStatus = 'active' | 'resolved' | 'reopened';

export interface Participant {
  readonly id: string;
  readonly type: string;
  readonly name: string;
}

export interface Conversation {
  readonly id: string;
  /** Human-readable identifier, e.g. 'MSG-0041'. */
  readonly humanId: string;
  readonly route: ConversationRoute;
  readonly participants: readonly Participant[];
  readonly bookingId?: string;
  readonly agentId?: string;
  readonly guestId?: string;
  readonly status: ConversationStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastMessageAt: string;
  readonly unreadCount: number;
}

export interface Attachment {
  readonly id: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly mimeType: string;
  readonly url: string;
}

export interface Message {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string;
  readonly senderType: string;
  readonly channel: MessageChannel;
  readonly content: string;
  readonly attachments?: readonly Attachment[];
  readonly deliveryStatus: MessageDeliveryStatus;
  readonly sentAt: string;
  readonly deliveredAt?: string;
  readonly readAt?: string;
  readonly failureReason?: string;
  readonly replyToId?: string;
  readonly retryOfId?: string;
}

/** AI-written digest of a conversation, produced by the summary service. */
export interface ConversationSummary {
  readonly conversationId: string;
  /** Model-written prose — content, not UI copy. */
  readonly summary: string;
  readonly keyPoints: readonly string[];
  readonly suggestedNextStep?: string;
  /** Messages the summary covers; a newer message means it's stale. */
  readonly coversThroughMessageId: string;
  readonly generatedAt: string;
}
