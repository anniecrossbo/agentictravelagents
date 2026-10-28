import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionCard } from '../../components/ActionCard';
import { ActionsChatPanel } from '../../components/ActionsChatPanel';
import { PipelineBoard } from '../../components/PipelineBoard';
import { PipelineControls } from '../../components/PipelineControls';
import { ChatPanel } from '../../components/ChatPanel';
import { Badge } from '../../components/Badge';
import { RoomInventoryPanels } from '../../components/RoomInventoryPanels';
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
import type { NeedsYouSignal } from '../../lib/types';
import { paceTotals } from '../../lib/booking-pace';
import { agencyFilterCycle, filterByAgency, INDEPENDENT, nextAgencyFilter, type AgencyFilter } from '../../lib/booking-view';
import { percentChange } from '../../lib/agent-directory';
import { portfolioSnapshot, roomTypeBreakdown } from '../../lib/inventory-view';
import { dayFirstRange, isoWeek, monthName, ordinalDate } from '../../lib/dates';
import {
  buildPipelineColumns,
  buildAgentConversations,
  buildGuestConversations,
  buildThreadMessages,
} from './helpers';

/** Days of the month that get an x-axis label on the pace chart. */
const PACE_LABEL_DAYS = [1, 5, 10, 15, 20, 25, 30];

export function ReservationManagerDashboard() {
  const { t } = useTranslation();
  const { all: allBookings, pace } = useBookings();
  const guestsHook = useGuests();
  const agentsHook = useAgents();
  const comms = useCommunications();
  const needsYou = useNeedsYou('reservation_manager');
  const inventory = useInventory();
  const finance = useFinance();
  const property = useProperty();

  const [openBookingId, setOpenBookingId] = useState<string | null>(null);
  const [openSignal, setOpenSignal] = useState<NeedsYouSignal | null>(null);
  const [hiddenSignalIds, setHiddenSignalIds] = useState<readonly string[]>([]);
  const [agencyFilter, setAgencyFilter] = useState<AgencyFilter>('all');
  const agencyCycle = agencyFilterCycle(agentsHook.agencies.map((a) => a.id));
  const agencyLabel =
    agencyFilter === 'all'
      ? t('pipeline.allAgencies')
      : agencyFilter === INDEPENDENT
        ? t('pipeline.independentAgents')
        : (agentsHook.agencies.find((a) => a.id === agencyFilter)?.name ?? agencyFilter);

  const pipelineColumns = useMemo(
    () =>
      buildPipelineColumns(
        filterByAgency(allBookings, agencyFilter),
        guestsHook.byId,
        (bookingId) => finance.byBooking(bookingId).find((o) => o.type === 'to_collect'),
      ),
    [allBookings, guestsHook, finance, agencyFilter],
  );

  const agentConvos = useMemo(
    () =>
      buildAgentConversations(
        comms.agentConversations,
        agentsHook.byId,
        agentsHook.agencyById,
        tokens.color.avatar,
        { messages: comms.messages, summaryFor: comms.summaryFor },
      ),
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

  const totals = paceTotals(pace);
  const paceChange = percentChange(totals);
  const paceLabels = Object.fromEntries(
    PACE_LABEL_DAYS.filter((d) => d <= pace.current.length).map((d) => [
      d - 1,
      ordinalDate(`${pace.period}-${String(d).padStart(2, '0')}`).split(' ')[0] ?? String(d),
    ]),
  );

  const snapshot = portfolioSnapshot(inventory.occupancySummaries);
  const breakdown = roomTypeBreakdown(inventory.occupancySummaries, inventory.roomTypes);
  const week = isoWeek(property.businessDate);

  return (
    <WidgetGrid columns={4}>
      {/* Actions | Chat — full-height left rail */}
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
              defaultTab="guests"
            />
          }
        />
      </WidgetCell>

      {/* Booking pace */}
      <WidgetCell
        col={1}
        row={0}
        title="home.bookingsThisMonth"
        subtitle={t('home.vsLastMonth')}
        action={
          paceChange != null ? (
            <Badge
              label={t('home.paceChange', { sign: paceChange >= 0 ? '+' : '', pct: paceChange })}
              variant={paceChange >= 0 ? 'positive' : 'warning'}
              size="sm"
            />
          ) : undefined
        }
        divider
      >
        <View className="gap-4 pt-4">
          <View className="flex-row">
            <View className="flex-1 gap-0.5">
              <Text className="text-xl font-semibold text-fg">{totals.current}</Text>
              <Text className="text-[11px] text-fg-muted">{t('home.thisMonth')}</Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-xl font-semibold text-fg">{totals.previous}</Text>
              <Text className="text-[11px] text-fg-muted">{t('home.lastMonth')}</Text>
            </View>
          </View>
          <TrendLineChart
            height={130}
            accessibilityLabel={t('home.paceSummary', { current: totals.current, previous: totals.previous })}
            xLabels={paceLabels}
            series={[
              { key: 'current', label: t('home.thisMonth'), color: tokens.color.occupancy.sellable, values: pace.current },
              { key: 'previous', label: t('home.lastMonth'), color: tokens.color.roomStatus.available, values: pace.previous },
            ]}
          />
        </View>
      </WidgetCell>

      {/* Room inventory */}
      <WidgetCell
        col={2}
        row={0}
        colSpan={2}
        title="inventory.page.inventoryTitle"
        subtitle={t('inventory.page.inventorySubtitle', { month: monthName(property.businessDate) })}
        action={
          <View className="rounded-pill bg-roomStatus-occupiedBg px-2 py-0.5">
            <Text className="text-[10px] font-semibold text-roomStatus-totalFg">
              {t('inventory.page.totalRooms', { count: snapshot.total })}
            </Text>
          </View>
        }
        divider
        scrollable={false}
      >
        <RoomInventoryPanels snapshot={snapshot} breakdown={breakdown} />
      </WidgetCell>

      {/* Booking pipeline */}
      <WidgetCell
        col={1}
        row={1}
        colSpan={3}
        title="pipeline.bookingPipeline"
        subtitle={t('pipeline.viewSubtitle')}
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
        <View className="flex-1 pt-4">
          <PipelineBoard columns={pipelineColumns} onItemPress={(item) => setOpenBookingId(item.id)} />
        </View>
      </WidgetCell>

      {openBookingId && (
        <BookingDetailHost bookingId={openBookingId} onClose={() => setOpenBookingId(null)} />
      )}
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
