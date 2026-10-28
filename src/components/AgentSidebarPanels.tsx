import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  CheckCheck,
  FileText,
  CreditCard,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Send,
  Mic,
  Paperclip,
  FolderOpen,
  Image as ImageIcon,
  X,
  Mail,
  Briefcase,
} from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { ChannelBadge } from './ChannelBadge';
import { ChannelPicker } from './ChannelPicker';
import { AiSummaryCard } from './AiSummaryCard';
import { LunaSignalIcon } from './LunaSignalIcon';
import { Avatar } from './Avatar';
import type { SummaryView } from '../lib/conversation-view';
import type { MessageChannel } from '../lib/types';
import {
  agentActions,
  clientEntries,
  messagesByThread,
} from '../mocks/agent-portal';
import type {
  ClientEntry,
  ChatThread,
  AgentActionItem,
  AgentChatMessage,
  ClientDocument,
  ActionIconVariant,
} from '../contracts/agent-portal-dashboard';

// PROTO: all data from mocks — real implementation calls the agent portal API

const AVATAR_COLOR_MAP: Record<string, string> = {
  'bg-avatar-red': tokens.color.avatar.red,
  'bg-avatar-green': tokens.color.avatar.green,
  'bg-avatar-grey': tokens.color.avatar.grey,
  'bg-avatar-brown': tokens.color.avatar.brown,
  'bg-avatar-teal': tokens.color.avatar.teal,
  'bg-avatar-ink': tokens.color.avatar.ink,
};

function avatarHex(className: string): string {
  return AVATAR_COLOR_MAP[className] ?? tokens.color.avatar.green;
}

function buildSummaryView(client: ClientEntry): SummaryView | undefined {
  if (!client.summary) return undefined;
  return {
    kind: 'ai',
    summary: client.summary.text,
    keyPoints: [...client.summary.keyPoints],
    suggestedNextStep: client.summary.suggestedNextStep,
    generatedAt: client.summary.generatedAt,
    isStale: client.summary.isStale,
    channels: client.channels ? [...client.channels] : [],
  };
}

const ACTION_ICON_CONFIG: Record<ActionIconVariant, { icon: typeof CheckCheck; bg: string }> = {
  approve: { icon: CheckCheck, bg: tokens.color.brand.DEFAULT },
  document: { icon: FileText, bg: tokens.color.danger.avatar },
  rate: { icon: CheckCheck, bg: tokens.color.avatar.brown },
  payment: { icon: CreditCard, bg: tokens.color.accent.DEFAULT },
  calendar: { icon: CalendarDays, bg: tokens.color.danger.avatar },
};

function ActionIconCircle({ variant }: { variant: ActionIconVariant }) {
  const config = ACTION_ICON_CONFIG[variant];
  const Icon = config.icon;
  return (
    <View
      className="h-11 w-11 items-center justify-center rounded-pill"
      style={{ backgroundColor: config.bg }}
    >
      <Icon size={18} color={tokens.color.fg.inverse} />
    </View>
  );
}

function AudiencePill({
  count,
  label,
  active,
  onPress,
}: {
  count: number;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${count} ${label}`}
      accessibilityState={{ selected: active }}
      className={`h-8 flex-row items-center gap-2 rounded-pill border px-2.5 ${
        active ? 'border-brand bg-brand-05' : 'border-border-input bg-surface'
      }`}
      hitSlop={{ top: 8, bottom: 8 }}
    >
      <View className="min-w-5 items-center rounded-sm bg-surface-page px-1 py-0.5">
        <Text className="text-[10px] font-bold text-fg">{count}</Text>
      </View>
      <Text className="text-[11px] font-medium text-fg">{label}</Text>
    </Pressable>
  );
}

function ExpandableActionCard({ item }: { item: AgentActionItem }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <View className="border-t border-border-light">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={t(item.titleKey)}
        accessibilityState={{ expanded }}
        className="flex-row items-start gap-3 px-3 py-3.5 active:bg-surface-page"
      >
        <ActionIconCircle variant={item.iconVariant} />
        <View className="flex-1 gap-1">
          <Text className="text-sm font-bold text-fg">{t(item.titleKey)}</Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-medium text-fg">{item.clientName}</Text>
            {item.isVip && (
              <View className="rounded-pill bg-warning-vipBg px-1.5">
                <Text className="text-[9px] font-bold text-warning-vip">{t('guest.vip')}</Text>
              </View>
            )}
            {item.agencyName && <Briefcase size={11} color={tokens.color.fg.muted} />}
          </View>
          <Text className="text-[11px] text-fg-muted" numberOfLines={1}>{item.subtitle}</Text>
        </View>
        <Chevron size={16} color={tokens.color.fg.muted} />
      </Pressable>

      {expanded && (
        <View className="gap-3 px-3 pb-4">
          <View className="gap-2 rounded-md bg-positive-bg px-3.5 py-3">
            <View className="flex-row items-center gap-1.5">
              <LunaSignalIcon size={16} />
              <Text className="text-[11px] font-bold uppercase text-positive">
                {t('agentPortal.actions.whyThisAction')}
              </Text>
            </View>
            <Text className="text-xs leading-[17px] text-fg">{item.reasoningText}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            {item.type === 'booking_approval' || item.type === 'rate_approval' ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('agentPortal.actions.approve')}
                  onPress={() => {/* PROTO: approve action */}}
                  className="rounded-pill bg-brand px-4 py-2 active:opacity-80"
                  hitSlop={{ top: 6, bottom: 6 }}
                >
                  <Text className="text-xs font-semibold text-fg-inverse">{t('agentPortal.actions.approve')}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('agentPortal.actions.decline')}
                  onPress={() => {/* PROTO: decline action */}}
                  className="rounded-pill border border-border-input px-4 py-2 active:bg-surface-page"
                  hitSlop={{ top: 6, bottom: 6 }}
                >
                  <Text className="text-xs font-medium text-fg">{t('agentPortal.actions.decline')}</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('agentPortal.actions.sendReminder')}
                onPress={() => {/* PROTO: send reminder */}}
                className="rounded-pill bg-brand px-4 py-2 active:opacity-80"
                hitSlop={{ top: 6, bottom: 6 }}
              >
                <Text className="text-xs font-semibold text-fg-inverse">{t('agentPortal.actions.sendReminder')}</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('agentPortal.actions.openChat')}
              onPress={() => {/* PROTO: navigate to thread */}}
              className="rounded-pill border border-border-input px-4 py-2 active:bg-surface-page"
              hitSlop={{ top: 6, bottom: 6 }}
            >
              <Text className="text-xs font-medium text-fg">{t('agentPortal.actions.openChat')}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Chat components ──────────────────────────────────────────────────────────

const THREAD_BORDER: Record<string, string> = {
  need_attention: 'border-l-[3px] border-danger',
  ai_ongoing: 'border-l-[3px] border-avatar-green',
  resolved: 'border border-brand',
};

const THREAD_STATUS_LABEL: Record<string, string> = {
  need_attention: 'agentPortal.chat.needsReply',
  ai_ongoing: 'agentPortal.chat.aiHandling',
  resolved: 'agentPortal.chat.resolved',
};

const STAY_STATUS_LABEL: Record<string, string> = {
  upcoming: 'agentPortal.chat.stayUpcoming',
  checked_in: 'agentPortal.chat.stayCheckedIn',
  departing: 'agentPortal.chat.stayDeparting',
  checked_out: 'agentPortal.chat.stayCheckedOut',
};

function ConversationRow({
  client, expanded, onToggle, onThreadPress,
}: {
  client: ClientEntry; expanded: boolean; onToggle: () => void; onThreadPress: (thread: ChatThread) => void;
}) {
  const { t } = useTranslation();
  const hasThreads = (client.threads?.length ?? 0) > 0;
  const Chevron = expanded ? ChevronUp : ChevronDown;
  const statusLabel = client.stayStatus ? t(STAY_STATUS_LABEL[client.stayStatus] ?? '') : '';
  const subtitleParts = [statusLabel, client.stayDates].filter(Boolean).join(' · ');
  const chatsPart = `${client.chatCount} ${client.chatCount === 1 ? 'chat' : 'chats'}`;
  const subtitle = subtitleParts ? `${subtitleParts} • ${chatsPart}` : chatsPart;

  return (
    <View className="border-t border-border">
      <Pressable
        onPress={onToggle}
        disabled={!hasThreads}
        accessibilityRole="button"
        accessibilityLabel={client.name}
        accessibilityState={{ expanded }}
        className="flex-row items-center gap-3 px-3 py-3 active:bg-surface-page"
        hitSlop={{ top: 4, bottom: 4 }}
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-pill"
          style={{ backgroundColor: avatarHex(client.avatarColor) }}
        >
          <Text className="text-xs font-bold text-fg-inverse">{client.initials}</Text>
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-sm font-bold text-fg" numberOfLines={1}>{client.name}</Text>
            {client.isVip && (
              <View className="rounded-pill bg-warning-vipBg px-1.5 py-0.5">
                <Text className="text-[9px] font-bold text-warning-vip">{t('guest.vip')}</Text>
              </View>
            )}
          </View>
          <Text className="text-[11px] text-fg-muted" numberOfLines={1}>{subtitle}</Text>
        </View>
        {hasThreads && <Chevron size={14} color={tokens.color.chat.chevron} />}
      </Pressable>

      {expanded && client.threads && (
        <View className="px-3 pb-3">
          <Text className="mb-2 text-[10px] font-semibold uppercase text-fg">
            {t('communication.chatsHeading', { count: client.threads.length })}
          </Text>
          <View className="gap-2">
            {client.threads.map((thread) => (
              <Pressable
                key={thread.id}
                onPress={() => onThreadPress(thread)}
                accessibilityRole="button"
                accessibilityLabel={thread.name}
                className={`flex-row items-center gap-3 rounded-lg bg-surface px-3 py-3 active:opacity-70 ${THREAD_BORDER[thread.status] ?? ''}`}
              >
                <View className="flex-1 gap-1">
                  <Text className="text-sm font-bold text-fg" numberOfLines={1}>{thread.name}</Text>
                  {thread.statusSubtitle && (
                    <Text className="text-[11px] text-fg-muted" numberOfLines={1}>{thread.statusSubtitle}</Text>
                  )}
                </View>
                <View className="rounded-pill border border-border-input px-3 py-1.5">
                  <Text className="text-[10px] font-medium text-fg-secondary">
                    {t(THREAD_STATUS_LABEL[thread.status] ?? '')}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function DocumentCard({ doc }: { doc: ClientDocument }) {
  const iconBg = doc.fileType === 'pdf' ? tokens.color.brand.light : tokens.color.surface.page;
  const iconColor = doc.fileType === 'pdf' ? tokens.color.brand.DEFAULT : tokens.color.fg.muted;
  const Icon = doc.fileType === 'image' ? ImageIcon : FileText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={doc.name}
      onPress={() => {/* PROTO: open document preview */}}
      className="flex-row items-center gap-3 rounded-xl border border-border-light bg-surface px-3 py-3 active:opacity-70"
    >
      <View className="h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: iconBg }}>
        <Icon size={18} color={iconColor} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-xs font-bold text-fg" numberOfLines={1}>{doc.name}</Text>
        <Text className="text-[10px] text-fg-muted" numberOfLines={1}>{doc.fileLine}</Text>
      </View>
      <ChevronRight size={16} color={tokens.color.fg.muted} />
    </Pressable>
  );
}

function DocumentsPanel({ documents, onClose }: { documents: readonly ClientDocument[]; onClose: () => void }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((d) => d.name.toLowerCase().includes(q));
  }, [query, documents]);

  return (
    <View className="flex-1 gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-fg">{t('agentPortal.documents.headingCount', { count: documents.length })}</Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('common.close')} className="h-8 w-8 items-center justify-center rounded-pill bg-surface-page active:opacity-70" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={14} color={tokens.color.fg.DEFAULT} />
        </Pressable>
      </View>
      <View className="flex-row items-center gap-2.5 rounded-notch border border-border-input px-3.5 py-2">
        <Search size={14} color={tokens.color.fg.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder={t('agentPortal.documents.searchPlaceholder')} placeholderTextColor={tokens.color.fg.muted} accessibilityLabel={t('agentPortal.documents.searchPlaceholder')} className="flex-1 text-xs text-fg" />
      </View>
      <ScrollView className="flex-1" contentContainerClassName="gap-2.5">
        {filtered.map((doc) => (<DocumentCard key={doc.id} doc={doc} />))}
      </ScrollView>
    </View>
  );
}

const BUBBLE_STYLE: Record<string, { wrap: string; body: string; meta: string }> = {
  client: { wrap: 'self-start rounded-2xl rounded-bl-none bg-chat-guestBubble', body: 'text-fg-inverse', meta: 'text-chat-guestMeta' },
  ai: { wrap: 'self-start rounded-2xl rounded-bl-none bg-chat-aiBubble', body: 'text-fg', meta: 'text-chat-aiMeta' },
  agent: { wrap: 'self-end rounded-2xl rounded-br-none bg-brand', body: 'text-fg-inverse', meta: 'text-chat-staffMeta' },
};

function MessageBubble({ message }: { message: AgentChatMessage }) {
  const style = (BUBBLE_STYLE[message.sender] ?? BUBBLE_STYLE.client)!;
  const isStaff = message.sender === 'agent';
  const showChannelIcon = message.title && message.channel === 'email';

  return (
    <View className={`max-w-[85%] gap-2 px-3.5 py-3.5 ${style.wrap}`}>
      {message.title && (
        <View className="flex-row items-start gap-2">
          {showChannelIcon && <Mail size={14} color={isStaff ? tokens.color.fg.inverse : tokens.color.fg.DEFAULT} />}
          <Text className={`flex-1 text-sm font-bold ${style.body}`}>{message.title}</Text>
        </View>
      )}
      <Text className={`text-xs leading-[17px] ${style.body}`}>{message.body}</Text>
      {message.attachments && message.attachments.length > 0 && (
        <View className="gap-1.5">
          {message.attachments.map((att) => (
            <Pressable key={att.name} accessibilityRole="button" accessibilityLabel={att.name} onPress={() => {/* PROTO: open attachment */}} className={`flex-row items-center gap-2 rounded-lg px-2.5 py-2 ${isStaff ? 'bg-brand-dark' : 'bg-surface-page'}`}>
              <FileText size={14} color={isStaff ? tokens.color.fg.inverse : tokens.color.brand.DEFAULT} />
              <Text className={`flex-1 text-[10px] font-medium ${isStaff ? 'text-fg-inverse' : 'text-fg'}`} numberOfLines={1}>{att.name}</Text>
              <Text className={`text-[10px] ${isStaff ? 'text-chat-staffMeta' : 'text-fg-muted'}`}>{att.size}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <View className="flex-row items-center gap-1.5">
        <Text className={`text-[10px] ${style.meta}`}>{message.author} | {message.time}</Text>
        {message.channel && <ChannelBadge channel={message.channel} variant="icon" />}
      </View>
    </View>
  );
}

function ThreadDetailView({ client, thread, onBack }: { client: ClientEntry; thread: ChatThread; onBack: () => void }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [smartReplies, setSmartReplies] = useState(true);
  const [showDocuments, setShowDocuments] = useState(false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const messages = messagesByThread[thread.id] ?? [];
  const lastInbound = [...messages].reverse().find((m) => m.sender !== 'agent');
  // PROTO: the chosen channel isn't sent anywhere
  const [channel, setChannel] = useState<MessageChannel>(lastInbound?.channel ?? client.channels?.[0] ?? 'chat');
  const summaryView = buildSummaryView(client);
  const docCount = client.documents?.length ?? 0;

  return (
    <View className="flex-1 overflow-hidden rounded-md">
      <View className="flex-row items-center gap-2 px-3 py-3">
        <Pressable onPress={showDocuments ? () => setShowDocuments(false) : onBack} accessibilityRole="button" accessibilityLabel={t('communication.back')} className="h-8 w-8 items-center justify-center rounded-pill bg-brand-light active:opacity-70" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={16} color={tokens.color.brand.DEFAULT} />
        </Pressable>
        <View className="flex-1 gap-[3px]">
          <Text className="text-sm font-bold text-fg" numberOfLines={1}>{client.name}</Text>
          <Text className="text-[10px] font-medium text-fg-muted" numberOfLines={1}>{client.roomNumber} · {client.stayDates} …</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.search')} onPress={() => {/* PROTO: search */}} className="h-8 w-8 items-center justify-center rounded-pill bg-surface-page" hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <Search size={14} color={tokens.color.fg.DEFAULT} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('agentPortal.documents.heading')} onPress={() => setShowDocuments((v) => !v)} className="h-8 w-8 items-center justify-center rounded-pill bg-brand-light" hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <FolderOpen size={14} color={tokens.color.brand.DEFAULT} />
          {docCount > 0 && (
            <View className="absolute -right-1 -top-1 min-w-4 items-center rounded-pill bg-warning px-1">
              <Text className="text-[8px] font-bold text-fg-inverse">{docCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {showDocuments && client.documents ? (
        <View className="flex-1 border-t border-border-subtle px-3 pt-3">
          <DocumentsPanel documents={client.documents} onClose={() => setShowDocuments(false)} />
        </View>
      ) : (
        <>
          <ScrollView className="flex-1 border-y border-border-subtle" contentContainerClassName="gap-3 px-3.5 py-3">
            {summaryView && (
              <Pressable onPress={() => setSummaryCollapsed((v) => !v)} accessibilityRole="button" accessibilityLabel={t('communication.aiSummary.title')} accessibilityState={{ expanded: !summaryCollapsed }}>
                {summaryCollapsed ? (
                  <View className="flex-row items-center gap-2 rounded-md bg-brand-10 px-4 py-3">
                    <LunaSignalIcon size={20} />
                    <Text className="flex-1 text-[11px] font-semibold uppercase text-brand">{t('communication.aiSummary.title')}</Text>
                    <ChevronDown size={14} color={tokens.color.brand.DEFAULT} />
                  </View>
                ) : (
                  <View>
                    <AiSummaryCard view={summaryView} />
                    <View className="absolute right-3 top-3"><ChevronUp size={14} color={tokens.color.brand.DEFAULT} /></View>
                  </View>
                )}
              </Pressable>
            )}
            <Text className="text-center text-[9px] font-semibold uppercase text-fg-muted">{t('communication.today')}</Text>
            {messages.map((m) => (<MessageBubble key={m.id} message={m} />))}
          </ScrollView>

          <View className="gap-2 p-2">
            <ChannelPicker value={channel} onChange={setChannel} compact />
            <View className="flex-row items-center gap-[7px]">
              <View className="flex-1 flex-row items-center gap-[7px] rounded-notch border border-border-input px-3 py-1.5">
                <TextInput value={draft} onChangeText={setDraft} placeholder={t('communication.typeHere')} placeholderTextColor={tokens.color.fg.placeholder} accessibilityLabel={t('communication.typeHere')} className="flex-1 text-[10px] text-fg" />
                <Pressable accessibilityRole="button" accessibilityLabel={t('communication.send')} onPress={() => setDraft('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Send size={16} color={tokens.color.brand.nav} />
                </Pressable>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={t('communication.voiceMessage')} onPress={() => {/* PROTO: voice */}} className="h-8 w-8 items-center justify-center rounded-pill border border-border-input" hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                <Mic size={16} color={tokens.color.brand.nav} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={t('communication.attachment')} onPress={() => {/* PROTO: attachment */}} className="h-8 w-8 items-center justify-center rounded-pill border border-border-input" hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                <Paperclip size={14} color={tokens.color.brand.nav} />
              </Pressable>
            </View>
            <Pressable onPress={() => setSmartReplies((v) => !v)} accessibilityRole="switch" accessibilityLabel={t('communication.smartReplies')} accessibilityState={{ checked: smartReplies }} className="flex-row items-center gap-2 active:opacity-70" hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
              <View className={`h-6 w-10 justify-center rounded-pill px-0.5 ${smartReplies ? 'items-end bg-brand-nav' : 'items-start bg-surface-track'}`}>
                <View className="h-5 w-5 rounded-pill bg-surface" />
              </View>
              <Text className="text-[10px] text-fg">{t('communication.smartReplies')}</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

// ── Exported panels ──────────────────────────────────────────────────────────

export function AgentActionsContent() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  // PROTO: audience filter state
  const [audience, setAudience] = useState<'all' | 'guests' | 'agents'>('all');
  const guestCount = agentActions.filter((a) => !a.agencyName || a.clientName !== a.agencyName).length;
  const agentCount = agentActions.filter((a) => a.agencyName && a.clientName === a.agencyName).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agentActions.filter((a) => {
      if (q && !a.clientName.toLowerCase().includes(q) && !t(a.titleKey).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, t]);

  return (
    <View className="flex-1 gap-3">
      <View className="flex-row items-center gap-2.5 rounded-notch border border-border-input px-3.5 py-2">
        <Search size={14} color={tokens.color.fg.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder={t('agentPortal.actions.searchPlaceholder')} placeholderTextColor={tokens.color.fg.muted} accessibilityLabel={t('agentPortal.actions.searchPlaceholder')} className="flex-1 text-xs text-fg" />
      </View>
      <View className="flex-row items-center gap-[7px]">
        <Pressable accessibilityRole="button" accessibilityLabel={t('communication.filterBy')} onPress={() => {/* PROTO: filter sheet */}} className="h-8 w-8 items-center justify-center rounded-pill border border-border-input" hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <SlidersHorizontal size={14} color={tokens.color.fg.muted} />
        </Pressable>
        <AudiencePill count={guestCount} label={t('agentPortal.actions.filterGuests')} active={audience === 'guests'} onPress={() => setAudience((a) => (a === 'guests' ? 'all' : 'guests'))} />
        <AudiencePill count={agentCount} label={t('agentPortal.actions.filterAgents')} active={audience === 'agents'} onPress={() => setAudience((a) => (a === 'agents' ? 'all' : 'agents'))} />
      </View>
      <ScrollView className="flex-1">
        {filtered.map((item) => (<ExpandableActionCard key={item.id} item={item} />))}
        {filtered.length === 0 && (
          <Text className="py-6 text-center text-xs text-fg-muted">{t('agentPortal.actions.noActions')}</Text>
        )}
      </ScrollView>
    </View>
  );
}

export function AgentChatContent() {
  const { t } = useTranslation();
  const [audience, setAudience] = useState<'all' | 'guests' | 'agents'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openThread, setOpenThread] = useState<{ client: ClientEntry; thread: ChatThread } | null>(null);
  const guestCount = clientEntries.length;
  const agentCount = 0; // PROTO: no agent-to-agent conversations yet

  if (openThread) {
    return <ThreadDetailView client={openThread.client} thread={openThread.thread} onBack={() => setOpenThread(null)} />;
  }

  return (
    <View className="flex-1 gap-3">
      <View className="flex-row items-center gap-[7px]">
        <Pressable accessibilityRole="button" accessibilityLabel={t('communication.filterBy')} onPress={() => {/* PROTO: filter sheet */}} className="h-8 w-8 items-center justify-center rounded-pill border border-border-input" hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <SlidersHorizontal size={14} color={tokens.color.fg.muted} />
        </Pressable>
        <AudiencePill count={guestCount} label={t('agentPortal.actions.filterGuests')} active={audience === 'guests'} onPress={() => setAudience((a) => (a === 'guests' ? 'all' : 'guests'))} />
        <AudiencePill count={agentCount} label={t('agentPortal.actions.filterAgents')} active={audience === 'agents'} onPress={() => setAudience((a) => (a === 'agents' ? 'all' : 'agents'))} />
      </View>
      <ScrollView className="flex-1">
        {clientEntries.map((client) => (
          <ConversationRow key={client.id} client={client} expanded={expandedId === client.id} onToggle={() => setExpandedId((id) => (id === client.id ? null : client.id))} onThreadPress={(thread) => setOpenThread({ client, thread })} />
        ))}
      </ScrollView>
    </View>
  );
}
