/**
 * Shared data-shaping helpers for dashboard screens.
 * Converts hook data into props the shared components expect.
 */

import type { BookingRequest, FinanceObligation } from '../../lib/types';
import { formatMoneyCompact, nightsBetween, pipelineChip } from '../../lib/booking-view';
import { dayFirstRange } from '../../lib/dates';
import type { MockGuest } from '../../mocks';
import { nameInitials } from '../../lib/countries';
import { tokens } from '../../theme/tokens';
import type { PipelineColumn, PipelineItem } from '../../components/PipelineBoard';

type GuestLookup = (id: string) => MockGuest | undefined;


const PIPELINE_AVATARS = [
  tokens.color.avatar.brown,
  tokens.color.avatar.green,
  tokens.color.avatar.red,
  tokens.color.avatar.teal,
  tokens.color.avatar.grey,
];

/** Looks up the receivable (guest or agency owes the hotel) for a booking. */
type ReceivableLookup = (bookingId: string) => FinanceObligation | undefined;

function bookingToPipelineItem(
  b: BookingRequest,
  guestById: GuestLookup,
  index: number,
  receivableFor?: ReceivableLookup,
): PipelineItem {
  const guest = b.guestId ? guestById(b.guestId) : undefined;
  const name = guest ? `${guest.firstName} ${guest.lastName}` : b.humanId;

  return {
    id: b.id,
    name,
    stay: dayFirstRange(b.checkIn, b.checkOut),
    nights: nightsBetween(b.checkIn, b.checkOut),
    amount: formatMoneyCompact(b.totalAmount, b.currency),
    avatarLabel: nameInitials(name),
    avatarColor: PIPELINE_AVATARS[index % PIPELINE_AVATARS.length],
    chip: pipelineChip(receivableFor?.(b.id)),
  };
}

export function buildPipelineColumns(
  allBookings: readonly BookingRequest[],
  guestById: GuestLookup,
  receivableFor?: ReceivableLookup,
): PipelineColumn[] {
  // PROTO: business date hardcoded
  const todayMs = new Date('2026-09-21').getTime();
  const threeDaysMs = 3 * 86_400_000;

  const enquiry = allBookings.filter((b) => b.state === 'Draft');
  const approvalNeeded = allBookings.filter((b) => b.state === 'Submitted');
  const upcoming = allBookings.filter(
    (b) =>
      b.state === 'Confirmed' &&
      new Date(b.checkIn).getTime() - todayMs > threeDaysMs,
  );
  const precheck = allBookings.filter(
    (b) =>
      b.state === 'Confirmed' &&
      new Date(b.checkIn).getTime() - todayMs <= threeDaysMs &&
      new Date(b.checkIn).getTime() >= todayMs,
  );
  const checkedIn = allBookings.filter((b) => b.state === 'CheckedIn');

  return [
    {
      key: 'enquiry',
      labelKey: 'pipeline.enquiry',
      count: enquiry.length,
      items: enquiry.map((b, i) => bookingToPipelineItem(b, guestById, i, receivableFor)),
    },
    {
      key: 'approval',
      labelKey: 'pipeline.approval',
      count: approvalNeeded.length,
      items: approvalNeeded.map((b, i) => bookingToPipelineItem(b, guestById, i, receivableFor)),
    },
    {
      key: 'upcoming',
      labelKey: 'pipeline.upcoming',
      count: upcoming.length,
      items: upcoming.map((b, i) => bookingToPipelineItem(b, guestById, i, receivableFor)),
    },
    {
      key: 'precheck',
      labelKey: 'pipeline.precheck',
      count: precheck.length,
      items: precheck.map((b, i) => bookingToPipelineItem(b, guestById, i, receivableFor)),
    },
    {
      key: 'checkedin',
      labelKey: 'pipeline.checkedIn',
      count: checkedIn.length,
      items: checkedIn.map((b, i) => bookingToPipelineItem(b, guestById, i, receivableFor)),
    },
  ];
}

// ── Chat panel data ─────────────────────────────────────────────────────────

import type {
  ChatConversation,
  ChatThread,
  ChatMessage,
  ChatThreadStatus,
} from '../../components/ChatPanel';
import type { Conversation, Message } from '../../lib/types';
import { channelsUsed, type SummaryView } from '../../lib/conversation-view';

/** Optional per-conversation extras: channel icons and the AI summary. */
type ConversationExtras = {
  messages?: readonly Message[];
  summaryFor?: (conversationId: string) => SummaryView | undefined;
};

function extrasFor(convId: string, extras?: ConversationExtras) {
  if (!extras) return {};
  return {
    channels: extras.messages
      ? channelsUsed(extras.messages.filter((m) => m.conversationId === convId))
      : undefined,
    summary: extras.summaryFor?.(convId),
  };
}

// PROTO: threads are synthesised from a conversation's unread count — the real
// backend models each subject thread separately.
const THREAD_SHAPES: {
  labelKey: string;
  status: ChatThreadStatus;
  subtitle: string;
  timeAgo?: string;
  escalated?: boolean;
}[] = [
  {
    labelKey: 'communication.housekeeping',
    status: 'resolved',
    subtitle: 'Marked resolved at 12PM',
    timeAgo: '35 mins ago',
  },
  {
    labelKey: 'communication.generalChat',
    status: 'ai_ongoing',
    subtitle: 'Started at 11AM',
  },
  {
    labelKey: 'communication.concierge',
    status: 'needs_attention',
    subtitle: 'Awaiting reply since 10AM',
    escalated: true,
  },
];

function threadsFor(convId: string, count: number): ChatThread[] {
  return THREAD_SHAPES.slice(0, Math.max(Math.min(count, THREAD_SHAPES.length), 1)).map(
    (shape, i) => ({ ...shape, id: `${convId}-t${i + 1}` }),
  );
}

const AVATAR_CYCLE = ['red', 'green', 'brown', 'teal', 'grey'] as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase();
}

export function buildGuestConversations(
  conversations: readonly Conversation[],
  guestById: GuestLookup,
  avatarColors: Record<string, string>,
  extras?: ConversationExtras,
): ChatConversation[] {
  // PROTO: room numbers are faked
  const rooms = ['1001', '1004', '1005', '1007', '1008', '1011'];

  return conversations.map((conv, i) => {
    const guest = conv.guestId ? guestById(conv.guestId) : undefined;
    const fullName = guest ? `${guest.firstName} ${guest.lastName}` : `Guest ${i + 1}`;
    const display = guest ? `${guest.isVip ? 'Mr.' : 'Ms.'} ${guest.lastName}` : fullName;
    const count = conv.unreadCount || 1;

    return {
      id: conv.id,
      name: display,
      avatarLabel: initials(fullName),
      avatarColor: avatarColors[AVATAR_CYCLE[i % AVATAR_CYCLE.length]!],
      isVip: guest?.isVip,
      roomOrRef: rooms[i % rooms.length],
      chatCount: count,
      threads: threadsFor(conv.id, count),
      ...extrasFor(conv.id, extras),
    };
  });
}

export function buildAgentConversations(
  conversations: readonly Conversation[],
  agentById: (id: string) => { firstName: string; lastName: string; agencyId?: string } | undefined,
  agencyById: (id: string) => { name: string } | undefined,
  avatarColors: Record<string, string>,
  extras?: ConversationExtras,
): ChatConversation[] {
  return conversations.map((conv, i) => {
    const agent = conv.agentId ? agentById(conv.agentId) : undefined;
    const agency = agent?.agencyId ? agencyById(agent.agencyId) : undefined;
    const name = agent ? `${agent.firstName} ${agent.lastName}` : `Agent ${i + 1}`;
    const count = conv.unreadCount || 1;

    return {
      id: conv.id,
      name,
      avatarLabel: initials(name),
      avatarColor: avatarColors[AVATAR_CYCLE[i % AVATAR_CYCLE.length]!],
      roomOrRef: agency?.name,
      chatCount: count,
      threads: threadsFor(conv.id, count),
      ...extrasFor(conv.id, extras),
    };
  });
}

/** Maps every synthesised thread of a conversation onto that conversation's messages. */
export function buildThreadMessages(
  conversations: readonly ChatConversation[],
  messages: readonly Message[],
): Record<string, readonly ChatMessage[]> {
  const out: Record<string, readonly ChatMessage[]> = {};

  for (const conv of conversations) {
    const convMessages: ChatMessage[] = messages
      .filter((m) => m.conversationId === conv.id)
      .map((m) => ({
        id: m.id,
        body: m.content,
        author: m.senderType === 'user' ? 'Staff' : conv.name,
        time: m.sentAt.slice(11, 16),
        sender:
          m.senderType === 'user' ? 'staff' : m.senderType === 'ai' ? 'ai' : 'guest',
        channel: m.channel,
      }));

    for (const thread of conv.threads ?? []) {
      out[thread.id] = convMessages;
    }
  }

  return out;
}
