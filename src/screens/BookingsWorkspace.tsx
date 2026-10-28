import { useState, useMemo, useCallback } from 'react';
import { router } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '../theme/tokens';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { WidgetGrid, WidgetCell } from '../components/WidgetGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterPills } from '../components/FilterPills';
import { Tag } from '../components/Tag';
import { BookingListItem } from '../components/BookingListItem';
import { PipelineBoard } from '../components/PipelineBoard';
import { PipelineControls } from '../components/PipelineControls';
import { RankedBarList } from '../components/RankedBarList';
import { SummaryTile } from '../components/SummaryTile';
import { TrendLineChart } from '../components/TrendLineChart';
import { buildPipelineColumns } from './dashboards/helpers';
import { BookingDetailHost } from './BookingDetailHost';
import {
  useBookings,
  useAgents,
  useGuests,
  useFinance,
  useInventory,
  useProperty,
} from '../lib/hooks';
import type { BookingRequest } from '../lib/types';
import { rememberListState, recallListState } from '../lib/routes';
import { bookingStateBadge, formatMoneyCompact, agencyFilterCycle, filterByAgency, INDEPENDENT, nextAgencyFilter, type AgencyFilter } from '../lib/booking-view';
import { dayFirstRange, isoWeek, monthName } from '../lib/dates';
import {
  bookingsByRoomType,
  filterBookingList,
  monthSummary,
  type BookingListFilter,
} from '../lib/booking-stats';

const LIST_KEY = 'bookings';

type BookingsWorkspaceProps = {
  /** Canonical entity from the route (§22.2); undefined on the list route. */
  openBookingId?: string;
  initialTab?: string;
};

export function BookingsWorkspace({ openBookingId, initialTab }: BookingsWorkspaceProps) {
  const { t } = useTranslation();
  const { all: allBookings, trend } = useBookings();
  const finance = useFinance();
  const inventory = useInventory();
  const property = useProperty();
  const { byId: agentById, agencyById, agencies } = useAgents();
  const { byId: guestById } = useGuests();


  const [agencyFilter, setAgencyFilter] = useState<AgencyFilter>('all');
  const agencyCycle = agencyFilterCycle(agencies.map((a) => a.id));
  const agencyLabel =
    agencyFilter === 'all'
      ? t('pipeline.allAgencies')
      : agencyFilter === INDEPENDENT
        ? t('pipeline.independentAgents')
        : (agencies.find((a) => a.id === agencyFilter)?.name ?? agencyFilter);

  const restored = recallListState(LIST_KEY);
  const [searchQuery, setSearchQuery] = useState(restored.query ?? '');
  const [activeFilter, setActiveFilter] = useState<BookingListFilter>(
    (restored.filter as BookingListFilter) ?? 'all',
  );

  const openBookingRoute = useCallback(
    (id: string, tab?: string) => {
      // Remember list context so Back restores it (§22.1)
      rememberListState(LIST_KEY, { query: searchQuery, filter: activeFilter });
      router.push({ pathname: '/(tabs)/bookings/[id]', params: tab ? { id, tab } : { id } });
    },
    [searchQuery, activeFilter],
  );

  const closeBookingRoute = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/bookings');
  }, []);

  const guestNameOf = (b: BookingRequest) => {
    const g = b.guestId ? guestById(b.guestId) : undefined;
    return g ? `${g.firstName} ${g.lastName}` : b.humanId;
  };
  const sourceNameOf = (b: BookingRequest) => {
    const agent = b.agentId ? agentById(b.agentId) : undefined;
    const agency = agent?.agencyId ? agencyById(agent.agencyId) : undefined;
    return agency?.name ?? (agent ? `${agent.firstName} ${agent.lastName}` : t('booking.sourceAgent'));
  };
  const roomNameOf = (b: BookingRequest) => inventory.roomTypes.find((rt) => rt.id === b.roomTypeId)?.name ?? b.roomTypeId;
  const rowSubtitle = (b: BookingRequest) =>
    t('booking.page.rowSubtitle', { room: roomNameOf(b), stay: dayFirstRange(b.checkIn, b.checkOut) });

  // Side list
  const listed = filterBookingList(allBookings, activeFilter, searchQuery, (b) =>
    [b.humanId, guestNameOf(b), sourceNameOf(b)].join(' '),
  );
  const filterOptions = [
    { key: 'all', labelKey: 'booking.page.filterAll', count: filterBookingList(allBookings, 'all', '', () => '').length },
    { key: 'active', labelKey: 'booking.page.filterActive', count: filterBookingList(allBookings, 'active', '', () => '').length },
    { key: 'inactive', labelKey: 'booking.page.filterInactive', count: filterBookingList(allBookings, 'inactive', '', () => '').length },
  ];

  // Widgets
  const period = property.businessDate.slice(0, 7);
  const month = monthName(period);
  const summary = monthSummary(allBookings, period);
  const byRoom = bookingsByRoomType(allBookings, inventory.roomTypes, period);
  const trendTotals = trend.reduce(
    (acc, m) => ({ created: acc.created + m.created, confirmed: acc.confirmed + m.confirmed, cancelled: acc.cancelled + m.cancelled }),
    { created: 0, confirmed: 0, cancelled: 0 },
  );
  const monthShort = (m: string) => monthName(m).slice(0, 3);

  const pipelineColumns = useMemo(
    () =>
      buildPipelineColumns(
        filterByAgency(allBookings, agencyFilter),
        guestById,
        (bookingId) => finance.byBooking(bookingId).find((o) => o.type === 'to_collect'),
      ),
    [allBookings, guestById, finance, agencyFilter],
  );
  const week = isoWeek(property.businessDate);

  return (
    <View className="flex-1 bg-surface-page">
      <WorkspaceHeader businessDate="21 Sep 2026" />

      <View
        className="flex-1"
        style={{
          paddingHorizontal: tokens.size.pageGutter,
          paddingTop: tokens.space['5'],
          paddingBottom: tokens.size.navClearance,
        }}
      >
        <WidgetGrid columns={4}>
          {/* All bookings — full-height left rail */}
          <WidgetCell col={0} row={0} rowSpan={2} title="booking.allBookings" count={allBookings.length} scrollable={false}>
            <View className="flex-1 gap-3">
              <SearchBar
                variant="pill"
                bordered
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="booking.page.searchPlaceholder"
              />
              {/* Fixed-height row so the pills never stretch with the list */}
              <View className="h-9 justify-center">
                <FilterPills
                  options={filterOptions}
                  selected={activeFilter}
                  onSelect={(key) => setActiveFilter(key as BookingListFilter)}
                />
              </View>
              <ScrollView className="flex-1">
                {listed.map((b) => (
                  <BookingListItem
                    key={b.id}
                    guestName={guestNameOf(b)}
                    subtitle={rowSubtitle(b)}
                    amount={formatMoneyCompact(b.totalAmount, b.currency)}
                    status={bookingStateBadge(b.state)}
                    onPress={() => openBookingRoute(b.id)}
                  />
                ))}
                {listed.length === 0 && (
                  <Text className="py-6 text-center text-xs text-fg-muted">{t('booking.emptyFiltered')}</Text>
                )}
              </ScrollView>
            </View>
          </WidgetCell>

          {/* Booking summary */}
          <WidgetCell col={1} row={0} title="booking.page.summaryTitle" subtitle={t('booking.page.forMonth', { month })} divider>
            <View className="gap-2.5 pt-4">
              <View className="flex-row gap-2.5">
                <SummaryTile tone="teal" label={t('booking.page.totalBookings')} value={String(summary.bookings)} />
                <SummaryTile tone="blue" label={t('booking.page.roomNights')} value={String(summary.roomNights)} />
              </View>
              <View className="flex-row gap-2.5">
                <SummaryTile tone="violet" label={t('booking.page.guests')} value={String(summary.guests)} />
                <SummaryTile
                  tone="amber"
                  label={t('booking.page.avgStay')}
                  value={String(summary.averageStay)}
                  unit={t('booking.page.nightsUnit')}
                />
              </View>
            </View>
          </WidgetCell>

          {/* Booking overview — six-month trend */}
          <WidgetCell
            col={2}
            row={0}
            title="booking.page.overviewTitle"
            subtitle={t('booking.page.rangeToDate', {
              from: monthShort(trend[0]?.month ?? period),
              to: monthShort(trend[trend.length - 1]?.month ?? period),
            })}
            action={<Tag labelKey="booking.page.sixMonths" tone="muted" shape="pill" />}
            divider
          >
            <View className="gap-3 pt-4">
              <TrendLineChart
                height={140}
                accessibilityLabel={t('booking.page.overviewSummary', trendTotals)}
                xLabels={Object.fromEntries(trend.map((m, i) => [i, monthShort(m.month)]))}
                series={[
                  { key: 'created', label: t('booking.page.created'), color: tokens.color.tile.blueFg, values: trend.map((m) => m.created) },
                  { key: 'confirmed', label: t('booking.page.confirmed'), color: tokens.color.brand.DEFAULT, values: trend.map((m) => m.confirmed) },
                  { key: 'cancelled', label: t('booking.page.cancelled'), color: tokens.color.danger.chart, values: trend.map((m) => m.cancelled) },
                ]}
              />
              <View className="flex-row">
                {(['created', 'confirmed', 'cancelled'] as const).map((k) => (
                  <Text key={k} className="flex-1 text-lg font-semibold text-fg">
                    {trendTotals[k]}
                  </Text>
                ))}
              </View>
            </View>
          </WidgetCell>

          {/* Bookings by room type */}
          <WidgetCell col={3} row={0} title="booking.page.byRoomTypeTitle" subtitle={t('booking.page.forMonth', { month })} divider>
            <View className="gap-4 pt-4">
              <View className="flex-row items-baseline gap-1.5">
                <Text className="text-[32px] font-semibold leading-8 text-fg">{byRoom.total}</Text>
                <Text className="text-[10px] text-fg-muted">{t('booking.page.totalLabel')}</Text>
              </View>
              <RankedBarList
                items={[
                  ...byRoom.rows.map((r) => ({ key: r.id, label: r.name, value: r.count })),
                  ...(byRoom.otherCount > 0
                    ? [{ key: 'other', label: t('booking.page.other'), value: byRoom.otherCount, muted: true }]
                    : []),
                ]}
              />
            </View>
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
              <PipelineBoard columns={pipelineColumns} onItemPress={(item) => openBookingRoute(item.id)} />
            </View>
          </WidgetCell>
        </WidgetGrid>
      </View>

      {openBookingId && (
        <BookingDetailHost bookingId={openBookingId} onClose={closeBookingRoute} initialTab={initialTab} />
      )}

    </View>
  );
}
