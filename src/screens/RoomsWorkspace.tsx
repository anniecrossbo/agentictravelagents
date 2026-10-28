import { useState, useMemo, useCallback } from 'react';
import { router } from 'expo-router';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '../theme/tokens';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { WidgetGrid, WidgetCell } from '../components/WidgetGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterPills } from '../components/FilterPills';
import { ListRowCard } from '../components/ListRowCard';
import { ExperienceRow } from '../components/ExperienceRow';
import { RoomInventoryPanels } from '../components/RoomInventoryPanels';
import { TrendBars } from '../components/TrendBars';
import { KpiTile } from '../components/KpiTile';
import { Tag } from '../components/Tag';
import { RoomTypeModal } from '../components/modals';
import { BookingDetailHost } from './BookingDetailHost';
import { useInventory, useBookings, useGuests, useAgents, useProperty } from '../lib/hooks';
import { rememberListState, recallListState } from '../lib/routes';
import { formatMoney } from '../lib/booking-view';
import { dayMonth, monthName, shortDate } from '../lib/dates';
import {
  buildRoomTypeRows,
  filterRoomTypeRows,
  formatExperienceHours,
  portfolioSnapshot,
  roomTypeBreakdown,
  tonightKpis,
  type InventoryFilter,
} from '../lib/inventory-view';

const LIST_KEY = 'rooms';

type RoomsWorkspaceProps = {
  /** Canonical room type from the route (§22.2). */
  openRoomTypeId?: string;
  /** Addressable tab within the room type detail (§22.2). */
  initialTab?: string;
};

export function RoomsWorkspace({ openRoomTypeId, initialTab }: RoomsWorkspaceProps) {
  const { t } = useTranslation();
  const inventory = useInventory();
  const { all: allBookings } = useBookings();
  const { byId: guestById } = useGuests();
  const { agencyById } = useAgents();
  const property = useProperty();

  const openRoomType = openRoomTypeId
    ? inventory.roomTypes.find((rt) => rt.id === openRoomTypeId)
    : undefined;

  const guestNameFor = (b: (typeof allBookings)[number]) => {
    const g = b.guestId ? guestById(b.guestId) : undefined;
    return g ? `${g.firstName} ${g.lastName}` : b.humanId;
  };

  const [stackedBookingId, setStackedBookingId] = useState<string | null>(null);

  const restored = recallListState(LIST_KEY);
  const [searchQuery, setSearchQuery] = useState(restored.query ?? '');
  const [activeFilter, setActiveFilter] = useState<InventoryFilter>(
    (restored.filter as InventoryFilter) ?? 'all',
  );

  const openRoomTypeRoute = useCallback(
    (id: string) => {
      rememberListState(LIST_KEY, { query: searchQuery, filter: activeFilter });
      router.push({ pathname: '/(tabs)/rooms/[id]', params: { id } });
    },
    [searchQuery, activeFilter],
  );

  const closeRoomTypeRoute = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/rooms');
  }, []);

  const roomRows = useMemo(
    () => buildRoomTypeRows(inventory.roomTypes, inventory.occupancySummaries, inventory.physicalRooms),
    [inventory],
  );
  const visibleRows = useMemo(
    () => filterRoomTypeRows(roomRows, activeFilter, searchQuery),
    [roomRows, activeFilter, searchQuery],
  );

  const filterOptions = [
    { key: 'all', labelKey: 'inventory.page.filterAll', count: roomRows.length },
    {
      key: 'available',
      labelKey: 'inventory.page.filterAvailable',
      count: roomRows.filter((r) => !r.soldOut).length,
    },
    {
      key: 'unavailable',
      labelKey: 'inventory.page.filterUnavailable',
      count: roomRows.filter((r) => r.soldOut).length,
    },
  ];

  const snapshot = portfolioSnapshot(inventory.occupancySummaries);
  const breakdown = roomTypeBreakdown(inventory.occupancySummaries, inventory.roomTypes);
  const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
  const occupancyFraction = snapshot.total > 0 ? snapshot.occupied / snapshot.total : 0;
  const kpis = tonightKpis(allBookings, property.businessDate, occupancyFraction);
  const currency = property.reportingCurrency;

  const forecast = inventory.occupancyForecast;
  const peak = forecast.reduce(
    (best, d) => (d.occupied / d.total > best.occupied / best.total ? d : best),
    forecast[0] ?? { date: property.businessDate, occupied: 0, total: 1 },
  );

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
          {/* Room types — combined cell, full height */}
          <WidgetCell col={0} row={0} colSpan={2} rowSpan={2} title="inventory.page.title">
            <SearchBar
              variant="pill"
              bordered
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="inventory.page.searchPlaceholder"
            />
            <View className="mt-3 border-b border-border pb-4">
              <FilterPills
                options={filterOptions}
                selected={activeFilter}
                onSelect={(key) => setActiveFilter(key as InventoryFilter)}
              />
            </View>
            <View className="mt-4 gap-2">
              {visibleRows.map((row) => (
                <ListRowCard
                  key={row.id}
                  title={row.name}
                  subtitle={t('inventory.page.roomSubtitle', {
                    category: t(`inventory.categoryLabel.${row.category}`),
                    sleeps: row.sleeps,
                    count: row.rooms,
                  })}
                  chips={row.chips}
                  value={t('inventory.fromPrice', { price: formatMoney(row.fromPrice, row.currency) })}
                  valueMuted={row.soldOut}
                  onPress={() => openRoomTypeRoute(row.id)}
                  accessibilityLabel={t('inventory.page.openRoomType', { name: row.name })}
                />
              ))}
              {visibleRows.length === 0 && (
                <Text className="py-8 text-center text-sm text-fg-muted">{t('inventory.page.noRooms')}</Text>
              )}
            </View>
          </WidgetCell>

          {/* Room inventory — portfolio snapshot and per-type breakdown */}
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

          {/* Occupancy — tonight, the next 14 nights, and tonight's rate KPIs */}
          <WidgetCell
            col={2}
            row={1}
            title="inventory.page.occupancyWidget"
            action={<Tag labelKey="inventory.page.tonight" tone="muted" shape="pill" />}
            divider
          >
            <View className="gap-4 pt-4">
              <View className="flex-row items-baseline gap-1.5">
                <Text className="text-[32px] font-semibold leading-8 text-fg">
                  {pct(snapshot.occupied, snapshot.total)}%
                </Text>
                <Text className="shrink text-[10px] text-fg-muted">
                  {t('inventory.page.occupiedTonight', { occupied: snapshot.occupied, total: snapshot.total })}
                </Text>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-fg">{t('inventory.page.forecastTitle')}</Text>
                  <Text className="text-[10px] text-fg-muted">
                    {t('inventory.page.forecastPeak', {
                      pct: pct(peak.occupied, peak.total),
                      date: dayMonth(peak.date),
                    })}
                  </Text>
                </View>
                <TrendBars
                  accessibilityLabel={t('inventory.page.forecastSummary', {
                    values: forecast
                      .map((d) => `${shortDate(d.date)} ${pct(d.occupied, d.total)}%`)
                      .join(', '),
                  })}
                  bars={forecast.map((d) => ({
                    key: d.date,
                    label: String(Number(d.date.slice(8, 10))),
                    fraction: d.total > 0 ? d.occupied / d.total : 0,
                    highlight: d.date === property.businessDate,
                  }))}
                />
              </View>

              <View className="flex-row flex-wrap gap-2">
                {/* Two per row so labels never truncate */}
                <KpiTile label={t('inventory.page.adr')} value={formatMoney(kpis.adr, currency)} />
                <KpiTile label={t('inventory.page.revpar')} value={formatMoney(kpis.revpar, currency)} />
                <KpiTile label={t('inventory.page.arrivals')} value={String(kpis.arrivals)} />
                <KpiTile label={t('inventory.page.departures')} value={String(kpis.departures)} />
              </View>
            </View>
          </WidgetCell>

          <WidgetCell col={3} row={1} title="inventory.page.offerings" divider>
            <View>
              {inventory.experiences.map((exp, i) => (
                <ExperienceRow
                  key={exp.id}
                  divider={i > 0}
                  name={exp.name}
                  category={exp.category}
                  description={exp.description}
                  schedule={t('inventory.page.schedule', {
                    frequency: t(`inventory.page.frequency.${exp.schedule.frequency}`),
                    hours: formatExperienceHours(exp.schedule),
                  })}
                  image={inventory.experienceImageFor(exp.imageKey)}
                />
              ))}
            </View>
          </WidgetCell>
        </WidgetGrid>
      </View>

      {openRoomType && (
        <RoomTypeModal
          visible={!stackedBookingId}
          onClose={closeRoomTypeRoute}
          roomType={openRoomType}
          rooms={inventory.physicalRooms.filter((r) => r.roomTypeId === openRoomType.id)}
          occupancy={inventory.occupancySummaries.find((o) => o.roomTypeId === openRoomType.id)}
          initialTab={initialTab}
          insights={inventory.insightsFor(openRoomType.id)}
          image={inventory.imageFor(openRoomType)}
          bookings={allBookings.filter((b) => b.roomTypeId === openRoomType.id)}
          rateCodes={inventory.rateCodes}
          guestNameFor={guestNameFor}
          agencyNameFor={(id) => agencyById(id)?.name}
          rateAssigneesFor={inventory.rateAssigneesFor}
          onOpenBooking={(b) => setStackedBookingId(b.id)}
        />
      )}
      {/* Booking opens over this sheet; the sheet hides until it closes */}
      {stackedBookingId && (
        <BookingDetailHost bookingId={stackedBookingId} onClose={() => setStackedBookingId(null)} />
      )}
    </View>
  );
}
