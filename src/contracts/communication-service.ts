/**
 * Communication service contract.
 *
 * Manages conversations, message sending and delivery across channels
 * (chat, email, WhatsApp), conversation lifecycle, and AI summaries.
 */

import type {
  Conversation,
  ConversationRoute,
  ConversationStatus,
  Message,
  MessageChannel,
  ConversationSummary,
  Participant,
  Attachment,
} from '../lib/types';
import type { PaginatedResult, PaginationParams, SortParams } from './shared';

// ── Filters ─────────────────────────────────────────────────────────────────

export interface ConversationFilters {
  readonly route?: ConversationRoute;
  readonly status?: ConversationStatus;
  readonly bookingId?: string;
  readonly agentId?: string;
  readonly guestId?: string;
  readonly participantId?: string;
}

// ── Payloads ────────────────────────────────────────────────────────────────

export interface SendMessageAttachment {
  readonly fileName: string;
  readonly mimeType: string;
  readonly data: string; // base64 or URI
  readonly fileSize: number;
}

export interface StartConversationContent {
  readonly text: string;
  readonly channel: MessageChannel;
  readonly attachments?: readonly SendMessageAttachment[];
}

// ── Service interface ───────────────────────────────────────────────────────

export interface ICommunicationService {
  getConversations(
    filters: ConversationFilters,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<Conversation>>;

  getConversationById(id: string): Promise<Conversation | null>;

  getMessages(
    conversationId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Message>>;

  sendMessage(
    conversationId: string,
    content: string,
    channel: MessageChannel,
    attachments?: readonly SendMessageAttachment[],
  ): Promise<Message>;

  retryMessage(messageId: string): Promise<Message>;

  startConversation(
    route: ConversationRoute,
    participants: readonly Participant[],
    bookingId?: string,
    content?: StartConversationContent,
  ): Promise<Conversation>;

  markRead(conversationId: string): Promise<void>;

  resolveConversation(conversationId: string): Promise<Conversation>;

  /**
   * Latest AI summary of a conversation. Resolves null when the AI service
   * has none (or is unavailable) — callers show the rule-based fallback.
   */
  getConversationSummary(conversationId: string): Promise<ConversationSummary | null>;
}
