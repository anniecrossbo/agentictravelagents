import { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { WidgetGrid, WidgetCell } from '../components/WidgetGrid';
import { TopNotchBar } from '../components/TopNotchBar';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { ActionsChatPanel } from '../components/ActionsChatPanel';
import { ColumnChart } from '../components/ColumnChart';
import { TrendLineChart } from '../components/TrendLineChart';
import { AgentActionsContent, AgentChatContent } from '../components/AgentSidebarPanels';
import { useAgentPortalAuth } from '../lib/agent-portal-auth-context';
import {
  commissionSummary,
  pipelineValueSummary,
  bookingPaceWeek,
  clientEntries,
  pipelineColumns,
  agentActions,
} from '../mocks/agent-portal';
import type {
  PipelineColumn,
  PipelineCard,
} from '../contracts/agent-portal-dashboard';

// PROTO: all data from mocks — real implementation calls the agent portal API

// ── Pipeline ─────────────────────────────────────────────────────────────────

function AgentPipelineCard({ card }: { card: PipelineCard }) {
  return (
    <View className="mb-2 flex-row items-start gap-2.5 rounded-sm border border-border-muted bg-surface p-3 shadow-xs">
      <Avatar name={card.initials} size="md" color={card.avatarColor} />
      <View className="flex-1">
        <Text className="text-[11px] font-semibold text-fg-alt">{card.name}</Text>
        <Text className="text-[10px] text-fg-muted">{card.location}</Text>
        <Text className="text-xs font-bold text-fg-alt">
          {card.currency === 'EUR' ? '€' : '$'} {card.amount.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

function AgentPipelineColumn({ column }: { column: PipelineColumn }) {
  const { t } = useTranslation();
  return (
    <View className="mr-3 w-[180px] rounded-sm bg-surface-column p-2">
      <View className="mb-2 flex-row items-center gap-1.5">
        <View className="size-1.5 rounded-full bg-pipeline-dot" />
        <Text className="text-[10px] font-medium text-pipeline-label">{t(column.stageKey)}</Text>
        <View className="rounded-sm bg-border-light px-1.5 py-0.5">
          <Text className="text-[9px] font-medium text-pipeline-label">{column.cards.length}</Text>
        </View>
      </View>
      {column.cards.map((card) => (
        <AgentPipelineCard key={card.id} card={card} />
      ))}
    </View>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export function AgentPortalDashboard() {
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
  const pipelineStageCategories = useMemo(
    () => pipelineValueSummary.stages.map((s) => ({ labelKey: s.stage, values: [s.dealCount] as readonly number[] })),
    [],
  );
  const pipelineStageSeries = useMemo(
    () => [{ labelKey: 'agentPortal.dashboard.pipelineValue', colorClassName: 'bg-brand' }],
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
        <TopNotchBar refreshedMinutesAgo={2} businessDate="12:45 PM, Wednesday" userName={userName} />
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

          {/* ── Col 1: Hotel Commission Status ── */}
          <WidgetCell col={1} row={0} colSpan={1} rowSpan={1} title="agentPortal.dashboard.commissionStatus">
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

          {/* ── Col 2: Pipeline Value ── */}
          <WidgetCell col={2} row={0} colSpan={1} rowSpan={1} title="agentPortal.dashboard.pipelineValue">
            <View>
              <Text className="text-[32px] font-semibold leading-tight text-fg">
                {'€'} {pipelineValueSummary.total.toLocaleString()}
              </Text>
              <Text className="text-xs text-fg-muted">{t('agentPortal.dashboard.activeDeals', { count: pipelineValueSummary.activeDeals })}</Text>
            </View>
            <View className="mt-4 flex-1">
              <ColumnChart categories={pipelineStageCategories} series={pipelineStageSeries} accessibilityLabel={t('agentPortal.dashboard.pipelineValue')} plotHeight={130} />
            </View>
          </WidgetCell>

          {/* ── Col 3: Bookings This Week ── */}
          <WidgetCell col={3} row={0} colSpan={1} rowSpan={1} title="agentPortal.dashboard.bookingsThisWeek" divider>
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

          {/* ── Cols 1-3, Row 1: Pipeline Kanban ── */}
          <WidgetCell col={1} row={1} colSpan={3} rowSpan={1} title="agentPortal.pipeline.title" scrollable={false}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {pipelineColumns.map((col) => (
                <AgentPipelineColumn key={col.stageKey} column={col} />
              ))}
            </ScrollView>
          </WidgetCell>
        </WidgetGrid>
      </View>
    </View>
  );
}
