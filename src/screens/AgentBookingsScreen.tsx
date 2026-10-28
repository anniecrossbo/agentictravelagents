import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  MoreVertical,
  ChevronRight,
} from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { WidgetGrid, WidgetCell } from '../components/WidgetGrid';
import { TopNotchBar } from '../components/TopNotchBar';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { FilterPills } from '../components/FilterPills';
import { RankedBarList } from '../components/RankedBarList';
import { ActionsChatPanel } from '../components/ActionsChatPanel';
import { AgentActionsContent, AgentChatContent } from '../components/AgentSidebarPanels';
import { CustomerDetailModal } from '../components/modals/CustomerDetailModal';
import { useAgentPortalAuth } from '../lib/agent-portal-auth-context';
import {
  agentBookingsList,
  agentBookingOverview,
  agentActions,
  clientEntries,
  customerDetails,
  pipelineColumns as pipelineData,
} from '../mocks/agent-portal';
import type {
  AgentBookingListItem,
  AgentPortalBookingOverview,
  CustomerDetail,
  PipelineColumn as PipelineColumnContract,
  PipelineCard,
} from '../contracts/agent-portal-dashboard';

// PROTO: all data from mocks — real implementation calls the agent portal API

const FILTER_OPTIONS = [
  { key: 'all', labelKey: 'agentPortal.bookings.filterAllAgents', count: 2846 },
  { key: 'active', labelKey: 'agentPortal.bookings.filterActiveBookings', count: 31 },
  { key: 'inactive', labelKey: 'agentPortal.bookings.filterInactiveBookings', count: 7 },
];

const MIN_PIPELINE_COL_WIDTH = 160;

// ── Guest Overview Card (right column, row 0) ────────────────────────────────

function BookingOverviewCard({ overview }: { overview: AgentPortalBookingOverview }) {
  const { t } = useTranslation();

  const bars = overview.hotelBreakdown.map((h) => ({
    key: h.hotelName,
    label: h.hotelName,
    value: h.amount,
    valueLabel: `€${h.amount.toLocaleString()}`,
    fraction: h.pct / 100,
  }));

  return (
    <View className="gap-4">
      <View className="flex-row items-end gap-2">
        <Text className="text-3xl font-bold text-fg">{overview.totalClients.toLocaleString()}</Text>
        <Text className="pb-0.5 text-sm text-fg-muted">{t('agentPortal.bookings.clients')}</Text>
        <Text className="ml-auto pb-0.5 text-sm font-semibold text-positive">
          {t('agentPortal.bookings.vsLastMonth', { pct: overview.changePctVsLastMonth })}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1 items-center rounded-lg bg-positive-bg px-2 py-3">
          <Text className="text-lg font-bold text-positive">
            {overview.activeClients.toLocaleString()}
          </Text>
          <Text className="mt-0.5 text-center text-[10px] text-positive">
            {t('agentPortal.bookings.activeClients')}
          </Text>
        </View>
        <View className="flex-1 items-center rounded-lg bg-positive-bg px-2 py-3">
          <Text className="text-lg font-bold text-positive">
            €{overview.avgClientValue.toLocaleString()}
          </Text>
          <Text className="mt-0.5 text-center text-[10px] text-positive">
            {t('agentPortal.bookings.avgClientValue')}
          </Text>
        </View>
        <View className="flex-1 items-center rounded-lg bg-positive-bg px-2 py-3">
          <Text className="text-lg font-bold text-positive">
            +{overview.newThisMonth}
          </Text>
          <Text className="mt-0.5 text-center text-[10px] text-positive">
            {t('agentPortal.bookings.newThisMonth')}
          </Text>
        </View>
      </View>

      <RankedBarList items={bars} />
    </View>
  );
}

// ── Booking Row ──────────────────────────────────────────────────────────────

function AgentBookingRow({
  item,
  onPress,
}: {
  item: AgentBookingListItem;
  onPress?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.guestName}
      className="flex-row items-center border-b border-border-light px-4 py-3.5 active:bg-surface-page"
    >
      <Avatar name={item.guestName} size="md" color={item.avatarColor} />
      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-fg" numberOfLines={1}>
          {item.guestName}
        </Text>
        <Text className="mt-0.5 text-xs text-fg-muted" numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <View className="mx-3">
        <Badge label={item.status.labelKey} variant={item.status.tone === 'positive' ? 'brand' : 'danger'} />
      </View>
      <Text className="mr-2 text-sm font-semibold text-fg" numberOfLines={1}>
        {t('agentPortal.bookings.generated', { amount: item.amountGenerated.toLocaleString() })}
      </Text>
      <ChevronRight size={18} color={tokens.color.fg.muted} />
    </Pressable>
  );
}

// ── Pipeline Card ────────────────────────────────────────────────────────────

function AgentPipelineCard({ card }: { card: PipelineCard }) {
  return (
    <View className="rounded-lg border border-border-muted bg-surface p-3">
      <View className="flex-row items-center gap-2">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: tokens.color.avatar.brown }}
        >
          <Text className="text-[10px] font-bold text-fg-inverse">{card.initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-semibold text-fg" numberOfLines={1}>
            {card.name}
          </Text>
          <Text className="text-[11px] text-fg-muted" numberOfLines={1}>
            {card.location}
          </Text>
        </View>
      </View>
      <Text className="mt-2 text-sm font-bold text-fg">
        € {card.amount.toLocaleString()}
      </Text>
    </View>
  );
}

// ── Pipeline Board ───────────────────────────────────────────────────────────

function AgentPipelineBoard({ columns }: { columns: readonly PipelineColumnContract[] }) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 pb-2"
    >
      {columns.map((col) => (
        <View key={col.stageKey} style={{ width: MIN_PIPELINE_COL_WIDTH }} className="gap-2">
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-pipeline-dot" />
            <Text className="text-xs font-medium text-fg" numberOfLines={1}>
              {t(col.stageKey)}
            </Text>
            <View className="rounded-xs bg-surface-page px-1.5 py-0.5">
              <Text className="text-[10px] font-medium text-pipeline-label">
                {col.cards.length}
              </Text>
            </View>
          </View>
          {col.cards.map((card) => (
            <AgentPipelineCard key={card.id} card={card} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export function AgentBookingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { agent } = useAgentPortalAuth();
  const userName = agent ? `${agent.firstName} ${agent.lastName}` : '';
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);

  // PROTO: filter is visual-only — always shows all mock entries
  const bookings = agentBookingsList;

  const openCustomer = (item: AgentBookingListItem) => {
    if (item.customerId && customerDetails[item.customerId]) {
      setSelectedCustomer(customerDetails[item.customerId]!);
    }
  };

  return (
    <View className="flex-1 bg-surface-page">
      <View style={{ paddingTop: insets.top }}>
        <TopNotchBar
          refreshedMinutesAgo={2}
          businessDate="12:45 PM, Wednesday"
          userName={userName}
        />
      </View>

      <View
        className="flex-1"
        style={{
          paddingHorizontal: tokens.size.pageGutter,
          paddingTop: tokens.space['5'],
          paddingBottom: tokens.size.navClearance,
        }}
      >
        <WidgetGrid columns={4}>
          {/* ── Col 0: Actions / Chat panel (full height) ── */}
          <WidgetCell col={0} row={0} colSpan={1} rowSpan={2} scrollable={false}>
            <ActionsChatPanel
              actionCount={agentActions.length}
              chatCount={clientEntries.length}
              actions={<AgentActionsContent />}
              chat={<AgentChatContent />}
              secondTabLabelKey="agentPortal.actions.chatTab"
            />
          </WidgetCell>

          {/* ── Cols 1-2, Row 0: All Guests list ── */}
          <WidgetCell col={1} row={0} colSpan={2} rowSpan={1} scrollable={false}>
            <View className="flex-row items-center pb-2">
              <Text className="flex-1 text-lg font-bold text-fg">
                {t('agentPortal.bookings.allGuests')}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('agentPortal.bookings.addNewQuery')}
                className="mr-3 rounded-lg bg-brand px-4 py-2 active:opacity-80"
              >
                <Text className="text-xs font-semibold text-fg-inverse">
                  {t('agentPortal.bookings.addNewQuery')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.actions')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MoreVertical size={20} color={tokens.color.fg.muted} />
              </Pressable>
            </View>

            <View className="flex-row items-center gap-2 rounded-lg bg-surface-search px-3 py-2.5">
              <Search size={16} color={tokens.color.fg.placeholder} />
              <Text className="flex-1 text-sm text-fg-placeholder">
                {t('agentPortal.bookings.searchPlaceholder')}
              </Text>
            </View>

            <View className="mt-3">
              <FilterPills
                options={FILTER_OPTIONS}
                selected={activeFilter}
                onSelect={setActiveFilter}
              />
            </View>

            <ScrollView className="mt-3 flex-1" showsVerticalScrollIndicator={false}>
              {bookings.map((item) => (
                <AgentBookingRow key={item.id} item={item} onPress={() => openCustomer(item)} />
              ))}
            </ScrollView>
          </WidgetCell>

          {/* ── Col 3, Row 0: Guest Overview ── */}
          <WidgetCell col={3} row={0} colSpan={1} rowSpan={1} title="agentPortal.bookings.overviewTitle">
            <BookingOverviewCard overview={agentBookingOverview} />
          </WidgetCell>

          {/* ── Cols 1-3, Row 1: Pipeline ── */}
          <WidgetCell col={1} row={1} colSpan={3} rowSpan={1} title="agentPortal.bookings.pipelineTitle" scrollable={false}>
            <AgentPipelineBoard columns={pipelineData} />
          </WidgetCell>
        </WidgetGrid>
      </View>

      {selectedCustomer && (
        <CustomerDetailModal
          visible
          onClose={() => setSelectedCustomer(null)}
          customer={selectedCustomer}
          onEdit={() => {/* PROTO: edit customer */}}
        />
      )}
    </View>
  );
}
