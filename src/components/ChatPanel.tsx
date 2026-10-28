import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  MoreVertical,
  Search,
  SlidersHorizontal,
  Send,
  Mic,
  Paperclip,
} from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { ChannelBadge } from './ChannelBadge';
import { ChannelPicker } from './ChannelPicker';
import { AiSummaryCard } from './AiSummaryCard';
import type { MessageChannel } from '../lib/types';
import type { SummaryView } from '../lib/conversation-view';

// ── Types ───────────────────────────────────────────────────────────────────

export type ChatThreadStatus = 'needs_attention' | 'ai_ongoing' | 'resolved';

export type ChatThread = {
  id: string;
  /** i18n key for the thread name, e.g. 'communication.housekeeping'. */
  labelKey: string;
  /** Already-formatted detail line, e.g. 'Marked resolved at 12PM'. */
  subtitle: string;
  status: ChatThreadStatus;
  timeAgo?: string;
  escalated?: boolean;
};

export type ChatConversation = {
  id: string;
  name: string;
  avatarLabel: string;
  avatarColor?: string;
  isVip?: boolean;
  roomOrRef?: string;
  chatCount: number;
  threads?: ChatThread[];
  /** Channels this conversation has used, in display order. */
  channels?: MessageChannel[];
  /** AI (or fallback) digest of the conversation. */
  summary?: SummaryView;
};

export type ChatMessage = {
  id: string;
  body: string;
  author: string;
  time: string;
  sender: 'guest' | 'ai' | 'staff';
  channel?: MessageChannel;
};

export type ChatFilter = 'all' | 'needs_attention' | 'staff' | 'resolved';

// ── Static config ───────────────────────────────────────────────────────────

const FILTERS: { key: ChatFilter; labelKey: string }[] = [
  { key: 'all', labelKey: 'communication.filters.all' },
  { key: 'needs_attention', labelKey: 'communication.filters.needsAttention' },
  { key: 'staff', labelKey: 'communication.filters.staff' },
  { key: 'resolved', labelKey: 'communication.filters.resolved' },
];

/** Figma: resolved threads carry a full brand border, AI threads a green left edge. */
const THREAD_BORDER: Record<ChatThreadStatus, string> = {
  resolved: 'border border-brand',
  ai_ongoing: 'border-l-[3px] border-avatar-green',
  needs_attention: 'border-l-[3px] border-danger',
};

const THREAD_STATUS_KEY: Record<ChatThreadStatus, string> = {
  resolved: 'communication.status.resolved',
  ai_ongoing: 'communication.status.aiOngoing',
  needs_attention: 'communication.status.needAttention',
};

const BUBBLE: Record<ChatMessage['sender'], { wrap: string; body: string; meta: string }> = {
  guest: { wrap: 'self-start rounded-2xl rounded-bl-none bg-chat-guestBubble', body: 'text-fg-inverse', meta: 'text-chat-guestMeta' },
  ai: { wrap: 'self-start rounded-2xl rounded-bl-none bg-chat-aiBubble', body: 'text-fg', meta: 'text-chat-aiMeta' },
  staff: { wrap: 'self-end rounded-2xl rounded-br-none bg-brand', body: 'text-fg-inverse', meta: 'text-chat-staffMeta' },
};

// ── Segmented header (Actions | Chat) ───────────────────────────────────────

export type ChatAudience = 'agents' | 'guests';

function SegmentedTabs({
  active,
  onChange,
  agentCount,
  guestCount,
}: {
  active: ChatAudience;
  onChange: (t: ChatAudience) => void;
  agentCount: number;
  guestCount: number;
}) {
  const { t } = useTranslation();
  const tabs: { key: ChatAudience; labelKey: string; count: number }[] = [
    { key: 'agents', labelKey: 'communication.tabs.agents', count: agentCount },
    { key: 'guests', labelKey: 'communication.tabs.guests', count: guestCount },
  ];

  return (
    <View className="flex-row rounded-notch bg-surface-page p-[3px]">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityLabel={t(tab.labelKey)}
            accessibilityState={{ selected: isActive }}
            aria-selected={isActive}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-notch px-3.5 py-1.5 ${
              isActive ? 'bg-surface' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${isActive ? 'text-fg' : 'text-fg-muted'}`}
            >
              {t(tab.labelKey)}
            </Text>
            <View className="min-w-5 items-center rounded-pill bg-warning-bg px-1.5 py-0.5">
              <Text className="text-xs font-bold text-warning">{tab.count}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Conversation list ───────────────────────────────────────────────────────

function ConversationRow({
  item,
  expanded,
  onToggle,
  onThreadPress,
}: {
  item: ChatConversation;
  expanded: boolean;
  onToggle: () => void;
  onThreadPress: (conv: ChatConversation, thread: ChatThread) => void;
}) {
  const { t } = useTranslation();
  const hasThreads = (item.threads?.length ?? 0) > 0;
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <View className="border-t border-border">
      <Pressable
        onPress={onToggle}
        disabled={!hasThreads}
        accessibilityRole="button"
        accessibilityLabel={item.name}
        accessibilityState={{ expanded }}
        className="flex-row items-center gap-2 px-3 py-2.5 active:bg-surface-page"
        hitSlop={{ top: 4, bottom: 4 }}
      >
        <View
          className="h-9 w-9 items-center justify-center rounded-pill"
          style={{ backgroundColor: item.avatarColor ?? tokens.color.avatar.green }}
        >
          <Text className="text-[9px] font-bold text-fg-inverse">
            {item.avatarLabel}
          </Text>
        </View>

        <View className="flex-1 gap-[3px]">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-bold text-fg" numberOfLines={1}>
              {item.name}
            </Text>
            {item.isVip && (
              <View className="rounded-pill bg-warning-vipBg px-1.5">
                <Text className="text-[9px] font-bold text-warning-vip">
                  {t('guest.vip')}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="shrink text-[10px] font-medium text-chat-subtitle" numberOfLines={1}>
              {item.roomOrRef ? `${item.roomOrRef} • ` : ''}
              {t('communication.chatsCount', { count: item.chatCount })}
            </Text>
            {item.channels?.map((c) => (
              <ChannelBadge key={c} channel={c} variant="icon" />
            ))}
          </View>
        </View>

        {hasThreads && <Chevron size={14} color={tokens.color.chat.chevron} />}
      </Pressable>

      {expanded && item.threads && (
        <View className="mx-2 mb-2 gap-1 rounded-xl bg-surface-page p-2.5">
          <Text className="text-[10px] font-semibold text-fg">
            {t('communication.chatsHeading', { count: item.threads.length })}
          </Text>

          <View className="gap-[7px]">
            {item.threads.map((thread) => (
              <Pressable
                key={thread.id}
                onPress={() => onThreadPress(item, thread)}
                accessibilityRole="button"
                accessibilityLabel={t(thread.labelKey)}
                className={`flex-row items-center gap-2 rounded-md bg-surface px-3 py-2.5 active:opacity-70 ${THREAD_BORDER[thread.status]}`}
              >
                <View className="flex-1 gap-[3px]">
                  <Text className="text-xs font-bold text-fg" numberOfLines={1}>
                    {t(thread.labelKey)}
                  </Text>
                  <Text className="text-[10px] text-chat-subtitle" numberOfLines={1}>
                    {thread.subtitle}
                  </Text>
                </View>
                <View className="rounded-pill border border-border-input px-2.5 py-1.5">
                  <Text className="text-[10px] font-medium text-fg-accent">
                    {t(THREAD_STATUS_KEY[thread.status])}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {item.threads.some((th) => th.timeAgo || th.escalated) && (
            <View className="mt-1 flex-row items-center gap-1.5">
              <View className="flex-row">
                <View className="h-2 w-2 rounded-pill bg-chat-dotGreen" />
                <View className="-ml-0.5 h-2 w-2 rounded-pill bg-chat-dotAmber" />
                <View className="-ml-0.5 h-2 w-2 rounded-pill bg-chat-dotRed" />
              </View>
              <Text className="text-[10px] text-chat-meta">
                {item.threads.find((th) => th.timeAgo)?.timeAgo ?? ''}
              </Text>
              {item.threads.some((th) => th.escalated) && (
                <Text className="text-[10px] text-danger-avatar">
                  {t('communication.escalated')}
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ── Thread detail ───────────────────────────────────────────────────────────

function ThreadView({
  conversation,
  thread,
  messages,
  onBack,
}: {
  conversation: ChatConversation;
  thread: ChatThread;
  messages: readonly ChatMessage[];
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [smartReplies, setSmartReplies] = useState(true);
  const lastInbound = [...messages].reverse().find((m) => m.sender !== 'staff');
  // PROTO: the chosen channel isn't sent anywhere; real build passes it to sendMessage
  const [channel, setChannel] = useState<MessageChannel>(
    lastInbound?.channel ?? conversation.channels?.[0] ?? 'chat',
  );

  return (
    <View className="flex-1 overflow-hidden rounded-md">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-3 py-3">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('communication.back')}
          className="h-8 w-8 items-center justify-center rounded-pill bg-brand-light active:opacity-70"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={16} color={tokens.color.fg.DEFAULT} />
        </Pressable>

        <View className="flex-1 gap-[3px]">
          <Text className="text-xs font-bold text-fg" numberOfLines={1}>
            {conversation.roomOrRef ? `${conversation.roomOrRef} ` : ''}
            {conversation.name}
          </Text>
          <Text className="text-[10px] font-medium text-chat-subtitle" numberOfLines={1}>
            {thread.subtitle}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('communication.moreOptions')}
          onPress={() => {/* PROTO: thread overflow menu */}}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MoreVertical size={14} color={tokens.color.fg.DEFAULT} />
        </Pressable>
      </View>

      {/* Messages */}
      <ScrollView
        className="flex-1 border-y border-border-subtle"
        contentContainerClassName="gap-3 px-3.5 py-3"
      >
        {conversation.summary && <AiSummaryCard view={conversation.summary} size="compact" />}

        <Text className="text-center text-[9px] font-semibold uppercase text-fg-muted">
          {t('communication.today')}
        </Text>

        {messages.map((m) => {
          const style = BUBBLE[m.sender];
          return (
            <View key={m.id} className={`max-w-[85%] gap-1.5 px-3 py-4 ${style.wrap}`}>
              <Text className={`text-xs ${style.body}`}>{m.body}</Text>
              <View className="flex-row items-center gap-1.5">
                <Text className={`text-[11px] ${style.meta}`}>
                  {m.author} | {m.time}
                </Text>
                {m.channel && <ChannelBadge channel={m.channel} variant="icon" />}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Composer */}
      <View className="gap-2 p-2">
        <ChannelPicker value={channel} onChange={setChannel} compact />
        <View className="flex-row items-center gap-[7px]">
          <View className="flex-1 flex-row items-center gap-[7px] rounded-notch border border-border-input px-3 py-1.5">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={t('communication.typeHere')}
              placeholderTextColor={tokens.color.fg.placeholder}
              accessibilityLabel={t('communication.typeHere')}
              className="flex-1 text-[10px] text-fg"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('communication.send')}
              onPress={() => setDraft('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Send size={16} color={tokens.color.brand.nav} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('communication.voiceMessage')}
            onPress={() => {/* PROTO: voice capture */}}
            className="h-8 w-8 items-center justify-center rounded-pill border border-border-input"
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Mic size={16} color={tokens.color.brand.nav} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('communication.attachment')}
            onPress={() => {/* PROTO: attachment picker */}}
            className="h-8 w-8 items-center justify-center rounded-pill border border-border-input"
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Paperclip size={14} color={tokens.color.brand.nav} />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setSmartReplies((v) => !v)}
            accessibilityRole="switch"
            accessibilityLabel={t('communication.smartReplies')}
            accessibilityState={{ checked: smartReplies }}
            className="flex-row items-center gap-2 active:opacity-70"
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text className="text-[9px] text-fg">{t('communication.smartReplies')}</Text>
            <View
              className={`h-5 w-9 justify-center rounded-pill px-0.5 ${
                smartReplies ? 'items-end bg-brand-nav' : 'items-start bg-surface-track'
              }`}
            >
              <View className="h-4 w-4 rounded-pill bg-surface" />
            </View>
          </Pressable>

          <View className="flex-1" />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('communication.endChat')}
            onPress={onBack}
            className="rounded-pill bg-danger-avatar px-2.5 py-1.5 active:opacity-80"
            hitSlop={{ top: 8, bottom: 8 }}
          >
            <Text className="text-[9px] text-fg-inverse">{t('communication.endChat')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ── Filter pill ─────────────────────────────────────────────────────────────

function CountPill({
  label,
  count,
  active,
  alert,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  /** Red count bubble when idle, e.g. "needs attention". */
  alert?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      className={`h-8 flex-row items-center gap-[7px] rounded-pill border border-brand-nav pl-1 pr-2.5 ${
        active ? 'bg-brand-nav' : 'bg-surface'
      }`}
      hitSlop={{ top: 8, bottom: 8 }}
    >
      <View
        className={`h-6 w-6 items-center justify-center rounded-pill ${
          active ? 'bg-surface' : alert ? 'bg-danger-avatar' : 'bg-surface-page'
        }`}
      >
        <Text
          className={`text-[10px] font-semibold ${
            active ? 'text-brand-nav' : alert ? 'text-fg-inverse' : 'text-fg'
          }`}
        >
          {count}
        </Text>
      </View>
      <Text className={`text-[10px] font-medium ${active ? 'text-fg-inverse' : 'text-fg'}`}>{label}</Text>
    </Pressable>
  );
}

// ── Panel ───────────────────────────────────────────────────────────────────

type ChatPanelProps = {
  agentConversations: readonly ChatConversation[];
  guestConversations: readonly ChatConversation[];
  /** Messages for the open thread, keyed by thread id. */
  messagesByThread?: Record<string, readonly ChatMessage[]>;
  defaultTab?: ChatAudience;
  /**
   * Inside another tabbed panel: drops the Agents | Guests header and switches
   * audience with pills in the filter row instead of status filters.
   */
  embedded?: boolean;
};

export function ChatPanel({
  agentConversations,
  guestConversations,
  messagesByThread,
  defaultTab = 'guests',
  embedded = false,
}: ChatPanelProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ChatAudience>(defaultTab);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ChatFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [open, setOpen] = useState<{ conv: ChatConversation; thread: ChatThread } | null>(null);

  const conversations = tab === 'agents' ? agentConversations : guestConversations;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (filter === 'all') return true;
      if (filter === 'resolved') return c.threads?.some((th) => th.status === 'resolved');
      if (filter === 'needs_attention') {
        return c.threads?.some((th) => th.status === 'needs_attention');
      }
      return true;
    });
  }, [conversations, query, filter]);

  const filterCounts: Record<ChatFilter, number> = {
    all: conversations.length,
    needs_attention: conversations.filter((c) =>
      c.threads?.some((th) => th.status === 'needs_attention'),
    ).length,
    staff: conversations.filter((c) => !c.isVip).length,
    resolved: conversations.filter((c) =>
      c.threads?.some((th) => th.status === 'resolved'),
    ).length,
  };

  const switchAudience = (next: ChatAudience) => {
    setTab(next);
    setExpandedId(null);
    setOpen(null);
  };

  return (
    <View className="flex-1 gap-4">
      {!embedded && (
        <SegmentedTabs
          active={tab}
          onChange={(next) => {
            setTab(next);
            setExpandedId(null);
            setOpen(null);
          }}
          agentCount={agentConversations.length}
          guestCount={guestConversations.length}
        />
      )}

      {open ? (
        <ThreadView
          conversation={open.conv}
          thread={open.thread}
          messages={messagesByThread?.[open.thread.id] ?? []}
          onBack={() => setOpen(null)}
        />
      ) : (
        <View className="flex-1 gap-5">
          {/* Search */}
          <View className="flex-row items-center gap-2.5 rounded-notch border border-border-input px-3.5 py-2">
            <Search size={14} color={tokens.color.fg.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('communication.searchPlaceholder')}
              placeholderTextColor={tokens.color.fg.muted}
              accessibilityLabel={t('communication.searchPlaceholder')}
              className="flex-1 text-xs text-fg"
            />
          </View>

          {/* Filters */}
          <View className="flex-row items-center gap-[7px]">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('communication.filterBy')}
              onPress={() => {/* PROTO: advanced filter sheet */}}
              className="h-8 w-8 items-center justify-center rounded-pill border border-brand-nav"
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <SlidersHorizontal size={14} color={tokens.color.brand.nav} />
            </Pressable>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-[7px]">
              {embedded
                ? ([
                    { key: 'guests', labelKey: 'communication.guestChats', count: guestConversations.length },
                    { key: 'agents', labelKey: 'communication.tabs.agents', count: agentConversations.length },
                  ] as const).map((a) => (
                    <CountPill
                      key={a.key}
                      label={t(a.labelKey)}
                      count={a.count}
                      active={tab === a.key}
                      onPress={() => switchAudience(a.key)}
                    />
                  ))
                : FILTERS.map((f) => (
                    <CountPill
                      key={f.key}
                      label={t(f.labelKey)}
                      count={filterCounts[f.key]}
                      active={f.key === filter}
                      alert={f.key === 'needs_attention'}
                      onPress={() => setFilter(f.key)}
                    />
                  ))}
            </ScrollView>
          </View>

          {/* Conversations */}
          <ScrollView className="flex-1">
            {filtered.map((item) => (
              <ConversationRow
                key={item.id}
                item={item}
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
                onThreadPress={(conv, thread) => setOpen({ conv, thread })}
              />
            ))}
            {filtered.length === 0 && (
              <Text className="py-6 text-center text-xs text-fg-muted">
                {t('communication.empty')}
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
