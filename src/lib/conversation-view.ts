/**
 * Presentation logic for conversations across channels. Framework-free: no
 * react-native or expo imports, so it stays unit-testable in plain Node.
 */

import type { ConversationSummary, Message, MessageChannel } from './types';

/** Display order when listing a conversation's channels. */
const CHANNEL_ORDER: readonly MessageChannel[] = ['chat', 'whatsapp', 'email'];

/** Distinct channels used in a set of messages, in a stable order. */
export function channelsUsed(messages: readonly Pick<Message, 'channel'>[]): MessageChannel[] {
  const used = new Set(messages.map((m) => m.channel));
  return CHANNEL_ORDER.filter((c) => used.has(c));
}

/** The channel to reply on: whichever the other party used most recently. */
export function replyChannelFor(
  messages: readonly Pick<Message, 'channel' | 'senderType' | 'sentAt'>[],
  fallback: MessageChannel = 'chat',
): MessageChannel {
  const theirs = messages
    .filter((m) => m.senderType !== 'user')
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  return theirs[0]?.channel ?? fallback;
}

export type SummaryView =
  | {
      kind: 'ai';
      summary: string;
      keyPoints: readonly string[];
      suggestedNextStep?: string;
      generatedAt: string;
      /** Newer messages arrived after the summary was generated. */
      isStale: boolean;
      channels: MessageChannel[];
    }
  | {
      kind: 'fallback';
      messageCount: number;
      channels: MessageChannel[];
      lastAt?: string;
      lastFrom?: 'hotel' | 'counterpart';
    };

/**
 * The AI summary when the service has one; otherwise a rule-based digest so
 * the card never goes blank when AI is unavailable.
 */
export function buildSummaryView(
  summary: ConversationSummary | undefined,
  messages: readonly Message[],
): SummaryView | undefined {
  if (messages.length === 0) return undefined;
  const channels = channelsUsed(messages);
  const sorted = [...messages].sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  const last = sorted[sorted.length - 1];

  if (summary) {
    const coveredIndex = sorted.findIndex((m) => m.id === summary.coversThroughMessageId);
    return {
      kind: 'ai',
      summary: summary.summary,
      keyPoints: summary.keyPoints,
      suggestedNextStep: summary.suggestedNextStep,
      generatedAt: summary.generatedAt,
      isStale: coveredIndex >= 0 && coveredIndex < sorted.length - 1,
      channels,
    };
  }

  return {
    kind: 'fallback',
    messageCount: messages.length,
    channels,
    lastAt: last?.sentAt,
    lastFrom: last ? (last.senderType === 'user' ? 'hotel' : 'counterpart') : undefined,
  };
}
