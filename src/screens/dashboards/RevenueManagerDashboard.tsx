import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react-native';
import { ActionCard } from '../../components/ActionCard';
import { ActionsChatPanel } from '../../components/ActionsChatPanel';
import { ChatPanel } from '../../components/ChatPanel';
import { Badge } from '../../components/Badge';
import { ColumnChart } from '../../components/ColumnChart';
import { PaymentRow } from '../../components/PaymentRow';
import { RevenuePipelineBoard } from '../../components/RevenuePipelineBoard';
import { PipelineControls } from '../../components/PipelineControls';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { TrendLineChart } from '../../components/TrendLineChart';
import { WidgetGrid, WidgetCell } from '../../components/WidgetGrid';
import { NeedsYouDetailModal } from '../../components/modals';
import { BookingDetailHost } from '../BookingDetailHost';
import { tokens } from '../../theme/tokens';
import {
  useBookings,
  useGuests,
  useAgents,
  useCommunications,
  useNeedsYou,
  useInventory,
  useFinance,
  useProperty,
} from '../../lib/hooks';
import type { FinanceObligation, NeedsYouSignal } from '../../lib/types';
import { formatMoney, formatMoneyCompact, agencyFilterCycle, filterByAgency, INDEPENDENT, nextAgencyFilter, type AgencyFilter } from '../../lib/booking-view';
import { percentChange } from '../../lib/agent-directory';
import { dayFirstRange, daysBetween, isoWeek, monthName, ordinalDate, shortDate, weekdayShort } from '../../lib/dates';
import {
  agentRevenueThisMonth,
  buildRevenuePipeline,
  collectionSummary,
  lastTwoMonths,
  openObligations,
  recentPayments,
} from '../../lib/revenue-view';
import { buildAgentConversations, buildGuestConversations, buildThreadMessages } from './helpers';

type LedgerTab = 'to_pay' | 'to_collect';
const LEDGER_TABS = [
  { key: 'to_pay', labelKey: 'revenue.toPayout' },
  { key: 'to_collect', labelKey: 'revenue.toCollect' },
];

/** Days of the month that get an x-axis label on the revenue chart. */
const LABEL_DAYS = [1, 5, 10, 15, 20, 25, 30];

const signed = (n: number) => (n >= 0 ? '+' : '');

export function RevenueManagerDashboard() {
  const { t } = useTranslation();
  const { all: allBookings } = useBookings();
  const guestsHook = useGuests();
  const agentsHook = useAgents();
  const comms = useCommunications();
  const needsYou = useNeedsYou('revenue_manager');
  const inventory = useInventory();
  const finance = useFinance();
  const property = useProperty();
  const { businessDate, reportingCurrency } = property;

  const [openBookingId, setOpenBookingId] = useState<string | null>(null);
  const [openSignal, setOpenSignal] = useState<NeedsYouSignal | null>(null);
  const [hiddenSignalIds, setHiddenSignalIds] = useState<readonly string[]>([]);
  const [ledger, setLedger] = useState<LedgerTab>('to_pay');
  const [agencyFilter, setAgencyFilter] = useState<AgencyFilter>('all');
  const agencyCycle = agencyFilterCycle(agentsHook.agencies.map((a) => a.id));
  const agencyLabel =
    agencyFilter === 'all'
      ? t('pipeline.allAgencies')
      : agencyFilter === INDEPENDENT
        ? t('pipeline.independentAgents')
        : (agentsHook.agencies.find((a) => a.id === agencyFilter)?.name ?? agencyFilter);

  const bookingOf = (id: string) => allBookings.find((b) => b.id === id);
  const guestNameOf = (bookingId: string) => {
    const b = bookingOf(bookingId);
    const g = b?.guestId ? guestsHook.byId(b.guestId) : undefined;
    return g ? `${g.firstName} ${g.lastName}` : (b?.humanId ?? bookingId);
  };
  const roomNameOf = (bookingId: string) =>
    inventory.roomTypes.find((rt) => rt.id === bookingOf(bookingId)?.roomTypeId)?.name ?? '';

  // Chat
  const agentConvos = useMemo(
    () =>
      buildAgentConversations(comms.agentConversations, agentsHook.byId, agentsHook.agencyById, tokens.color.avatar, {
        messages: comms.messages,
        summaryFor: comms.summaryFor,
      }),
    [comms, agentsHook],
  );
  const guestConvos = useMemo(
    () =>
      buildGuestConversations(comms.guestConversations, guestsHook.byId, tokens.color.avatar, {
        messages: comms.messages,
        summaryFor: comms.summaryFor,
      }),
    [comms, guestsHook],
  );
  const threadMessages = useMemo(
    () => buildThreadMessages([...agentConvos, ...guestConvos], comms.messages),
    [agentConvos, guestConvos, comms.messages],
  );
  const visibleSignals = needsYou.all.filter((s) => !hiddenSignalIds.includes(s.id));

  // Payout / collect
  const ledgerRows = openObligations(finance.all, ledger);

  // Revenue pipeline
  const scopedBookings = filterByAgency(allBookings, agencyFilter);
  const scopedIds = new Set(scopedBookings.map((b) => b.id));
  const scopedObligations = finance.all.filter((o) => scopedIds.has(o.bookingId));
  const stages = buildRevenuePipeline(scopedBookings, scopedObligations, businessDate, reportingCurrency);
  const summary = collectionSummary(scopedObligations, businessDate, reportingCurrency);
  const week = isoWeek(businessDate);
  const money = (n: number) => formatMoneyCompact(n, reportingCurrency);

  // Recent payments
  const recent = recentPayments(finance.settlements, finance.all, businessDate);
  const recentChange = percentChange({ current: recent.total, previous: recent.previousTotal });
  const when = (iso: string) => {
    const age = daysBetween(iso, businessDate);
    const time = iso.slice(11, 16);
    if (age === 0) return t('revenue.when.today', { time });
    if (age === 1) return t('revenue.when.yesterday', { time });
    return t('revenue.when.weekday', { day: weekdayShort(iso), time });
  };

  // Agent revenue
  const history = finance.agentRevenueHistory;
  const monthMetric = lastTwoMonths(history);
  const monthChange = percentChange(monthMetric);
  const month = monthName(businessDate);
  const thisMonth = agentRevenueThisMonth(allBookings, finance.all, businessDate);
  const revenueLabels = Object.fromEntries(
    LABEL_DAYS.filter((d) => d <= thisMonth.dailyRevenue.length).map((d) => [
      d - 1,
      ordinalDate(`${businessDate.slice(0, 7)}-${String(d).padStart(2, '0')}`).split(' ')[0] ?? String(d),
    ]),
  );

  const ledgerAmount = (o: FinanceObligation) => formatMoney(o.remainingBalance, o.originalCurrency);

  return (
    <WidgetGrid columns={4}>
      <WidgetCell col={0} row={0} rowSpan={2} scrollable={false}>
        <ActionsChatPanel
          actionCount={visibleSignals.length}
          chatCount={comms.totalUnread}
          actions={visibleSignals.map((signal) => (
            <ActionCard
              key={signal.id}
              title={signal.reason}
              subtitle={signal.evidence}
              severity={signal.severity}
              primaryAction={{ label: signal.recommendedAction, onPress: () => setOpenSignal(signal) }}
              secondaryAction={{
                label: 'common.dismiss',
                onPress: () => setHiddenSignalIds((ids) => [...ids, signal.id]),
              }}
            />
          ))}
          chat={
            <ChatPanel
              embedded
              agentConversations={agentConvos}
              guestConversations={guestConvos}
              messagesByThread={threadMessages}
              defaultTab="agents"
            />
          }
        />
      </WidgetCell>

      {/* To payout / to collect */}
      <WidgetCell col={1} row={0}>
        <View className="gap-3">
          <SegmentedTabs variant="pill" fill tabs={LEDGER_TABS} selected={ledger} onSelect={(k) => setLedger(k as LedgerTab)} />
          <View className="h-px w-full bg-border" />
          {ledgerRows.map((o) => {
            const b = bookingOf(o.bookingId);
            const name = guestNameOf(o.bookingId);
            return (
              <PaymentRow
                key={o.id}
                name={name}
                subtitle={t('revenue.obligationSubtitle', {
                  room: roomNameOf(o.bookingId),
                  stay: b ? dayFirstRange(b.checkIn, b.checkOut) : '',
                })}
                amount={ledgerAmount(o)}
                amountTone={ledger === 'to_pay' ? 'danger' : 'default'}
                onPress={b ? () => setOpenBookingId(b.id) : undefined}
                accessibilityLabel={t('revenue.obligationLabel', {
                  name,
                  amount: ledgerAmount(o),
                  date: shortDate(o.dueDate),
                })}
              />
            );
          })}
          {ledgerRows.length === 0 && <Text className="py-4 text-center text-xs text-fg-muted">{t('revenue.emptyList')}</Text>}
        </View>
      </WidgetCell>

      {/* Revenue pipeline */}
      <WidgetCell
        col={2}
        row={0}
        colSpan={2}
        title="revenue.pipelineTitle"
        subtitle={t('revenue.pipelineSubtitle')}
        divider
        scrollable={false}
        action={
          <PipelineControls
            agencyLabel={agencyLabel}
            onCycleAgency={() => setAgencyFilter((cur) => nextAgencyFilter(cur, agencyCycle))}
            weekLabel={t('pipeline.week', { week: week.week, range: dayFirstRange(week.start, week.end) })}
          />
        }
      >
        <View className="flex-1 gap-3 pt-3">
          <View className="flex-row gap-2">
            <View className="flex-1 flex-row items-center justify-between rounded-md bg-brand-10 px-3 py-2">
              <Text className="text-[10px] text-fg">
                {t('revenue.summaryToCollect')} <Text className="text-fg-muted">{t('revenue.summaryToCollectHint')}</Text>
              </Text>
              <Text className="text-sm font-bold text-brand">{money(summary.toCollect)}</Text>
            </View>
            <View className="flex-1 flex-row items-center justify-between rounded-md bg-surface px-3 py-2">
              <View className="flex-row items-center gap-1.5">
                <View className="h-1.5 w-1.5 rounded-pill bg-warning" />
                <Text className="text-[10px] text-fg">
                  {t('revenue.summaryDueThisWeek')}{' '}
                  <Text className="text-fg-muted">{t('revenue.guests', { count: summary.dueThisWeek.count })}</Text>
                </Text>
              </View>
              <Text className="text-sm font-bold text-chip-cautionFg">{money(summary.dueThisWeek.amount)}</Text>
            </View>
            <View className="flex-1 flex-row items-center justify-between rounded-md bg-surface px-3 py-2">
              <View className="flex-row items-center gap-1.5">
                <View className="h-1.5 w-1.5 rounded-pill bg-danger" />
                <Text className="text-[10px] text-fg">
                  {t('revenue.summaryOverdue')}{' '}
                  <Text className="text-fg-muted">{t('revenue.guests', { count: summary.overdue.count })}</Text>
                </Text>
              </View>
              <Text className="text-sm font-bold text-chip-dangerFg">{money(summary.overdue.amount)}</Text>
            </View>
          </View>
          <RevenuePipelineBoard
            onCardPress={(id) => {
              const stageCard = stages.flatMap((s) => s.cards).find((c) => c.id === id);
              if (stageCard) setOpenBookingId(stageCard.bookingId);
            }}
            columns={stages.map((stage) => ({
              key: stage.key,
              label: t(`revenue.stage.${stage.key}`),
              total: money(stage.total),
              note: stage.note
                ? {
                    text: t(stage.note.labelKey, stage.note.amount != null ? { amount: money(stage.note.amount) } : {}),
                    tone: stage.note.tone,
                  }
                : undefined,
              cards: stage.cards.map((c) => ({
                id: c.id,
                name: guestNameOf(c.bookingId),
                amount: formatMoneyCompact(c.amount, c.currency),
                stay: dayFirstRange(c.checkIn, c.checkOut),
                chip: c.chip ? { label: t(c.chip.labelKey, c.chip.params), tone: c.chip.tone } : undefined,
              })),
            }))}
          />
        </View>
      </WidgetCell>

      {/* Recent payments */}
      <WidgetCell
        col={1}
        row={1}
        title="revenue.recentPayments"
        subtitle={t('revenue.recentSubtitle', { count: recent.payments.length })}
        divider
      >
        <View className="gap-3 pt-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-[28px] font-semibold text-fg">{money(recent.total)}</Text>
            {recentChange != null && (
              <Badge
                label={t('revenue.vsPreviousWeek', { sign: signed(recentChange), pct: recentChange })}
                variant={recentChange >= 0 ? 'positive' : 'warning'}
                size="sm"
              />
            )}
          </View>
          <View>
            {recent.payments.map((p) => (
              <PaymentRow
                key={p.settlement.id}
                name={guestNameOf(p.obligation.bookingId)}
                subtitle={t('revenue.paymentMeta', {
                  kind: t(`revenue.paymentKind.${p.kind}`),
                  when: when(p.settlement.recordedAt),
                })}
                amount={t('revenue.paymentAmount', { amount: formatMoneyCompact(p.settlement.amount, p.settlement.currency) })}
                onPress={() => setOpenBookingId(p.obligation.bookingId)}
              />
            ))}
            {recent.payments.length === 0 && (
              <Text className="py-3 text-xs text-fg-muted">{t('revenue.noRecentPayments')}</Text>
            )}
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/finance')}
            accessibilityRole="link"
            hitSlop={{ top: 12, bottom: 12 }}
            className="flex-row items-center gap-1"
          >
            <Text className="text-xs font-medium text-brand underline">{t('revenue.viewAllPayments')}</Text>
            <ArrowRight size={12} color={tokens.color.brand.DEFAULT} />
          </Pressable>
        </View>
      </WidgetCell>

      {/* Agent booking revenue by month */}
      <WidgetCell
        col={2}
        row={1}
        title="revenue.agentRevenue"
        subtitle={t('revenue.forMonth', { month })}
        action={
          monthChange != null ? (
            <Badge
              label={t('revenue.monthOnMonth', { sign: signed(monthChange), pct: monthChange })}
              variant={monthChange >= 0 ? 'positive' : 'warning'}
              size="sm"
            />
          ) : undefined
        }
        divider
      >
        <View className="gap-3 pt-3">
          <View className="flex-row items-baseline gap-1.5">
            <Text className="text-[28px] font-semibold text-fg">{formatMoney(monthMetric.current, reportingCurrency)}</Text>
            <Text className="text-[10px] text-fg-muted">{t('revenue.soFar')}</Text>
          </View>
          <ColumnChart
            plotHeight={150}
            accessibilityLabel={t('revenue.monthlySummary', {
              values: history.map((h) => `${monthName(h.month).slice(0, 3)} ${formatMoney(h.revenue, reportingCurrency)}`).join(', '),
            })}
            series={[{ labelKey: 'revenue.agentRevenue', colorClassName: 'bg-chart-series' }]}
            categories={history.map((h, i) => ({
              labelKey: monthName(h.month).slice(0, 3),
              values: [Math.round(h.revenue / 1000)],
              // The current month is still filling up; set it apart
              colorClassName: i === history.length - 1 ? 'bg-danger-chart' : undefined,
            }))}
          />
        </View>
      </WidgetCell>

      {/* Revenue vs commission */}
      <WidgetCell
        col={3}
        row={1}
        title="revenue.revenueVsCommission"
        subtitle={t('revenue.forMonth', { month })}
        divider
      >
        <View className="gap-3 pt-3">
          <View className="flex-row">
            <View className="flex-1 gap-0.5">
              <Text className="text-2xl font-semibold text-fg">{formatMoney(thisMonth.revenue, reportingCurrency)}</Text>
              <Text className="text-[11px] text-fg-muted">{t('revenue.generated')}</Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-2xl font-semibold text-fg">{formatMoney(thisMonth.commission, reportingCurrency)}</Text>
              <Text className="text-[11px] text-fg-muted">{t('revenue.commission')}</Text>
            </View>
          </View>
          <TrendLineChart
            height={120}
            accessibilityLabel={t('revenue.revenueSummary', {
              revenue: formatMoney(thisMonth.revenue, reportingCurrency),
              commission: formatMoney(thisMonth.commission, reportingCurrency),
            })}
            xLabels={revenueLabels}
            series={[
              { key: 'revenue', label: t('revenue.revenueGenerated'), color: tokens.color.positive.DEFAULT, values: thisMonth.dailyRevenue },
              { key: 'commission', label: t('revenue.commission'), color: tokens.color.roomStatus.available, values: thisMonth.dailyCommission },
            ]}
          />
        </View>
      </WidgetCell>

      {openBookingId && <BookingDetailHost bookingId={openBookingId} onClose={() => setOpenBookingId(null)} />}
      {openSignal && (
        <NeedsYouDetailModal
          visible
          signal={openSignal}
          onClose={() => setOpenSignal(null)}
          onOpenEntity={
            openSignal.entityType === 'booking'
              ? () => {
                  setOpenBookingId(openSignal.entityId);
                  setOpenSignal(null);
                }
              : undefined
          }
          onSnooze={(id) => setHiddenSignalIds((current) => [...current, id])}
          onDismiss={(id) => setHiddenSignalIds((current) => [...current, id])}
        />
      )}
    </WidgetGrid>
  );
}
