import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { WidgetGrid, WidgetCell } from '../components/WidgetGrid';
import { TopNotchBar } from '../components/TopNotchBar';
import { Badge } from '../components/Badge';
import { FilterPills } from '../components/FilterPills';
import { ColumnChart } from '../components/ColumnChart';
import { TrendLineChart } from '../components/TrendLineChart';
import { DonutChart } from '../components/DonutChart';
import { useAgentPortalAuth } from '../lib/agent-portal-auth-context';
import {
  commissionSummary,
  bookingPaceWeek,
  financePayments,
  payoutItems,
  revenuePipelineSummary,
  revenueStageColumns,
  commissionEarned,
} from '../mocks/agent-portal';
import type {
  FinancePaymentRow,
  PayoutItem,
  RevenueStageCard,
  RevenueStageColumn,
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

const FILTER_OPTIONS = [
  { key: 'all', labelKey: 'agentPortal.finance.filterAllAgents', count: 2846 },
  { key: 'active', labelKey: 'agentPortal.finance.filterActiveBookings', count: 31 },
  { key: 'inactive', labelKey: 'agentPortal.finance.filterInactiveBookings', count: 7 },
];

const STATUS_VARIANT: Record<string, 'positive' | 'danger' | 'warning' | 'neutral'> = {
  settled: 'positive',
  pending: 'warning',
  overdue: 'danger',
  due: 'danger',
};

// ── All Bookings and Payments table ──────────────────────────────────────────

function PaymentRow({ row }: { row: FinancePaymentRow }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center border-b border-border-light px-4 py-3.5">
      <Text className="w-[80px] text-sm text-fg">{row.date}</Text>
      <Text className="flex-1 text-sm text-fg">{row.guestName}</Text>
      <Text className="flex-1 text-sm text-fg">{row.agentName}</Text>
      <Text className="w-[80px] text-sm font-semibold text-fg">${row.amount.toLocaleString()}</Text>
      <View className="w-[80px]">
        <Badge
          label={`agentPortal.finance.${row.status}`}
          variant={STATUS_VARIANT[row.status] ?? 'neutral'}
          size="sm"
        />
      </View>
    </View>
  );
}

function PaymentsTable() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <View className="flex-1">
      <View className="flex-row items-center gap-2 rounded-lg bg-surface-search px-3 py-2.5">
        <Search size={16} color={tokens.color.fg.placeholder} />
        <Text className="flex-1 text-sm text-fg-placeholder">
          {t('agentPortal.finance.searchPlaceholder')}
        </Text>
      </View>

      <View className="mt-3">
        <FilterPills
          options={FILTER_OPTIONS}
          selected={activeFilter}
          onSelect={setActiveFilter}
        />
      </View>

      {/* Table header */}
      <View className="mt-4 flex-row border-b border-border-light px-4 pb-2">
        <Text className="w-[80px] text-xs font-medium text-fg-muted">
          {t('agentPortal.finance.date')}
        </Text>
        <Text className="flex-1 text-xs font-medium text-fg-muted">
          {t('agentPortal.finance.guest')}
        </Text>
        <Text className="flex-1 text-xs font-medium text-fg-muted">
          {t('agentPortal.finance.agent')}
        </Text>
        <Text className="w-[80px] text-xs font-medium text-fg-muted">
          {t('agentPortal.finance.amount')}
        </Text>
        <Text className="w-[80px] text-xs font-medium text-fg-muted">
          {t('agentPortal.finance.statusCol')}
        </Text>
      </View>

      {/* Table rows */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {financePayments.map((row) => (
          <PaymentRow key={row.id} row={row} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── To Payout / To Collect ───────────────────────────────────────────────────

function PayoutRow({ item }: { item: PayoutItem }) {
  return (
    <View className="flex-row items-center gap-3 border-b border-border-light px-3 py-3">
      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: avatarHex(item.avatarColor) }}
      >
        <Text className="text-[10px] font-bold text-fg-inverse">{item.initials}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-fg" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-[11px] text-fg-muted" numberOfLines={1}>
          {item.roomType} · {item.stayDates}
        </Text>
      </View>
      <Text className="text-sm font-bold text-brand">
        €{item.amount.toLocaleString()}
      </Text>
    </View>
  );
}

function PayoutPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'payout' | 'collect'>('payout');

  return (
    <View className="flex-1">
      <View className="flex-row">
        <Pressable
          onPress={() => setActiveTab('payout')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'payout' }}
          className={`flex-1 items-center border-b-2 pb-3 ${
            activeTab === 'payout' ? 'border-brand' : 'border-transparent'
          }`}
        >
          <Text className={`text-sm font-semibold ${activeTab === 'payout' ? 'text-fg' : 'text-fg-muted'}`}>
            {t('agentPortal.finance.toPayout')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('collect')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'collect' }}
          className={`flex-1 items-center border-b-2 pb-3 ${
            activeTab === 'collect' ? 'border-brand' : 'border-transparent'
          }`}
        >
          <Text className={`text-sm font-semibold ${activeTab === 'collect' ? 'text-fg' : 'text-fg-muted'}`}>
            {t('agentPortal.finance.toCollect')}
          </Text>
        </Pressable>
      </View>
      <ScrollView className="flex-1 mt-1" showsVerticalScrollIndicator={false}>
        {payoutItems.map((item) => (
          <PayoutRow key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── Revenue Pipeline ─────────────────────────────────────────────────────────

function RevenuePipelineCard({ card }: { card: RevenueStageCard }) {
  const { t } = useTranslation();
  const statusVariant = card.statusTone === 'positive' ? 'positive'
    : card.statusTone === 'danger' ? 'danger'
    : card.statusTone === 'warning' ? 'warning'
    : 'neutral';

  return (
    <View className="rounded-lg border border-border-muted bg-surface p-3">
      <View className="flex-row items-center gap-2">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: avatarHex(card.avatarColor) }}
        >
          <Text className="text-[10px] font-bold text-fg-inverse">{card.initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-semibold text-fg" numberOfLines={1}>
            {card.name}
          </Text>
          <Text className="text-[10px] text-fg-muted" numberOfLines={1}>
            {card.dates} · {card.nights}
          </Text>
        </View>
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-sm font-bold text-fg">
          € {card.amount.toLocaleString()}
        </Text>
        {card.statusKey && (
          <Badge label={card.statusKey} variant={statusVariant} size="sm" />
        )}
        {card.channel && !card.statusKey && (
          <Text className="text-[10px] text-fg-muted">{card.channel}</Text>
        )}
      </View>
    </View>
  );
}

function RevenuePipelineColumn({ column }: { column: RevenueStageColumn }) {
  const { t } = useTranslation();
  return (
    <View className="w-[180px] gap-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-xs font-semibold text-fg">{t(column.stageKey)}</Text>
          <View className="rounded-sm bg-surface-page px-1.5 py-0.5">
            <Text className="text-[10px] font-medium text-fg-muted">{column.count}</Text>
          </View>
        </View>
      </View>
      <Text className="text-sm font-bold text-fg">€ {(column.total / 1000).toFixed(1)}k</Text>

      {/* Progress bar */}
      <View className="flex-row items-center gap-2">
        <View className="h-1.5 flex-1 rounded-full bg-surface-track">
          <View
            className="h-1.5 rounded-full bg-brand"
            style={{ width: `${column.progressPct}%` }}
          />
        </View>
        <Text className="text-[10px] font-medium text-positive">+{column.weekOverWeekPct}%</Text>
      </View>
      <Text className="text-[10px] text-fg-muted">
        {column.progressPct}% · {column.progressLabel}
      </Text>

      {column.cards.map((card) => (
        <RevenuePipelineCard key={card.id} card={card} />
      ))}
    </View>
  );
}

function RevenuePipelineBoard() {
  const { t } = useTranslation();
  const summary = revenuePipelineSummary;

  return (
    <View className="flex-1 gap-3">
      {/* Subtitle and date picker */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-fg-muted">{t(summary.subtitle)}</Text>
        <View className="flex-row items-center gap-1.5 rounded-pill border border-border-input px-3 py-1.5">
          <View className="h-2 w-2 rounded-full bg-brand" />
          <Text className="text-xs font-medium text-fg">{t(summary.period)}</Text>
          <Text className="text-xs text-fg-muted">·</Text>
        </View>
      </View>

      {/* Summary pills */}
      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center gap-1.5 rounded-pill border border-border-light px-3 py-1.5">
          <Text className="text-[11px] text-fg-muted">{t('agentPortal.finance.realised')}</Text>
          <Text className="text-[11px] font-semibold text-fg">€ {(summary.realised / 1000).toFixed(1)}k</Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-pill border border-border-light bg-positive-bg px-3 py-1.5">
          <Text className="text-[11px] text-fg-muted">{t('agentPortal.finance.forecast')}</Text>
          <Text className="text-[11px] font-bold text-positive">€ {(summary.forecast / 1000).toFixed(1)}k</Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-pill border border-border-light px-3 py-1.5">
          <Text className="text-[11px] text-fg-muted">{t('agentPortal.finance.target')}</Text>
          <View className="h-1.5 w-8 rounded-full bg-brand" />
          <Text className="text-[11px] font-medium text-fg">{summary.targetPct}%</Text>
          <Text className="text-[11px] font-semibold text-fg">€ {(summary.target / 1000).toFixed(1)}k</Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-pill border border-border-light px-3 py-1.5">
          <Text className="text-[11px] text-fg-muted">{t('agentPortal.finance.lost')}</Text>
          <Text className="text-[11px] font-semibold text-danger">€ {(summary.lost / 1000).toFixed(1)}k</Text>
        </View>
      </View>

      {/* Pipeline columns */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pb-2">
        {revenueStageColumns.map((col) => (
          <RevenuePipelineColumn key={col.stageKey} column={col} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── Commission Earned ────────────────────────────────────────────────────────

function CommissionEarnedCard() {
  const { t } = useTranslation();
  const data = commissionEarned;

  const segments = useMemo(() => [
    { value: data.paidAmount, color: tokens.color.brand.DEFAULT, labelKey: 'agentPortal.finance.paidOut' },
    { value: data.pendingAmount, color: tokens.color.accent.DEFAULT, labelKey: 'agentPortal.finance.pendingLegend' },
  ], [data]);

  return (
    <View className="items-center gap-4">
      <Text className="text-3xl font-bold text-fg">€ {data.total.toLocaleString()}</Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-xs text-fg-muted">
          € {data.pendingAmount.toLocaleString()} {t('agentPortal.finance.pendingLegend').toLowerCase()}
        </Text>
        <Badge label={`+${data.changePct}%`} variant="positive" size="sm" />
      </View>

      <DonutChart
        segments={segments}
        centerValue={`€ ${data.total.toLocaleString()}`}
        centerLabelKey="agentPortal.finance.total"
        size={140}
        strokeWidth={20}
        showLegend={false}
        roundCaps={false}
      />

      {/* Custom legend with amounts */}
      <View className="gap-2 self-stretch">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tokens.color.brand.DEFAULT }} />
            <Text className="text-xs text-fg-muted">{t('agentPortal.finance.paidOut')}</Text>
          </View>
          <Text className="text-xs font-semibold text-fg">€ {data.paidAmount.toLocaleString()}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tokens.color.accent.DEFAULT }} />
            <Text className="text-xs text-fg-muted">{t('agentPortal.finance.pendingLegend')}</Text>
          </View>
          <Text className="text-xs font-semibold text-fg">€ {data.pendingAmount.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export function AgentFinanceScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { agent } = useAgentPortalAuth();
  const userName = agent ? `${agent.firstName} ${agent.lastName}` : '';

  const commissionCategories = useMemo(
    () =>
      commissionSummary.hotels.map((h) => ({
        labelKey: h.hotelName,
        values: [h.amount] as readonly number[],
        ...(h.isOverdue ? { colorClassName: 'bg-danger-chart' } : {}),
      })),
    [],
  );
  const commissionSeries = useMemo(
    () => [{ labelKey: 'agentPortal.dashboard.commissionStatus', colorClassName: 'bg-brand' }],
    [],
  );
  const trendSeries = useMemo(
    () => [
      { key: 'tw', label: t('agentPortal.dashboard.thisWeek'), color: tokens.color.brand.DEFAULT, values: bookingPaceWeek.thisWeekSeries },
      { key: 'lw', label: t('agentPortal.dashboard.lastWeek'), color: tokens.color.warning.DEFAULT, values: bookingPaceWeek.lastWeekSeries },
    ],
    [t],
  );
  const trendLabels = useMemo(
    () => ({ 0: bookingPaceWeek.labels[0]!, 4: bookingPaceWeek.labels[1]!, 9: bookingPaceWeek.labels[2]!, 14: bookingPaceWeek.labels[3]!, 18: bookingPaceWeek.labels[4]! }),
    [],
  );

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
          {/* ── Cols 0-1, Row 0: All Bookings and Payments ── */}
          <WidgetCell col={0} row={0} colSpan={2} rowSpan={1} title="agentPortal.finance.allBookingsAndPayments" scrollable={false}>
            <PaymentsTable />
          </WidgetCell>

          {/* ── Col 2, Row 0: Bookings This Week ── */}
          <WidgetCell col={2} row={0} colSpan={1} rowSpan={1} title="agentPortal.dashboard.bookingsThisWeek" divider>
            <View className="flex-row items-start justify-between">
              <View />
              <Badge label={`+${bookingPaceWeek.changePct}%`} variant="positive" size="sm" />
            </View>
            <Text className="text-xs text-fg-muted">{t('agentPortal.dashboard.vsLastWeek')}</Text>
            <View className="mt-3 flex-row gap-10">
              <View>
                <Text className="text-2xl font-semibold text-fg">{bookingPaceWeek.thisWeek}</Text>
                <Text className="text-[11px] text-fg-muted">{t('agentPortal.dashboard.thisWeek')}</Text>
              </View>
              <View>
                <Text className="text-2xl font-semibold text-fg">{bookingPaceWeek.lastWeek}</Text>
                <Text className="text-[11px] text-fg-muted">{t('agentPortal.dashboard.lastWeek')}</Text>
              </View>
            </View>
            <View className="mt-3 flex-1">
              <TrendLineChart series={trendSeries} xLabels={trendLabels} accessibilityLabel={t('agentPortal.dashboard.bookingsThisWeek')} height={100} />
            </View>
          </WidgetCell>

          {/* ── Col 3, Row 0: Hotel Commission Status ── */}
          <WidgetCell col={3} row={0} colSpan={1} rowSpan={1} title="agentPortal.dashboard.commissionStatus">
            <View className="flex-row items-baseline gap-2">
              <Text className="text-[32px] font-semibold leading-tight text-fg">
                ${commissionSummary.total.toLocaleString()}
              </Text>
              <Text className="text-[10px] font-light text-fg">{t('agentPortal.dashboard.soFar')}</Text>
              <Badge label={`+${commissionSummary.changePct}%`} variant="positive" size="sm" />
            </View>
            <View className="mt-4 flex-1">
              <ColumnChart categories={commissionCategories} series={commissionSeries} accessibilityLabel={t('agentPortal.dashboard.commissionStatus')} plotHeight={130} />
            </View>
          </WidgetCell>

          {/* ── Col 0, Row 1: To Payout / To Collect ── */}
          <WidgetCell col={0} row={1} colSpan={1} rowSpan={1} scrollable={false}>
            <PayoutPanel />
          </WidgetCell>

          {/* ── Cols 1-2, Row 1: Revenue Pipeline ── */}
          <WidgetCell col={1} row={1} colSpan={2} rowSpan={1} title="agentPortal.finance.revenuePipeline" scrollable={false}>
            <RevenuePipelineBoard />
          </WidgetCell>

          {/* ── Col 3, Row 1: Commission Earned ── */}
          <WidgetCell col={3} row={1} colSpan={1} rowSpan={1} title="agentPortal.finance.commissionEarned">
            <CommissionEarnedCard />
          </WidgetCell>
        </WidgetGrid>
      </View>
    </View>
  );
}
