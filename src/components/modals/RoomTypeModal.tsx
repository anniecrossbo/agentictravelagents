import { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, useWindowDimensions } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { SegmentedTabs } from '../SegmentedTabs';
import { SearchBar } from '../SearchBar';
import { OccupancySummaryPanel } from '../OccupancySummaryPanel';
import { ChartCard } from '../ChartCard';
import { ColumnChart } from '../ColumnChart';
import { BookingRow } from '../BookingRow';
import { RateCodeCard } from '../RateCodeCard';
import { Tag } from '../Tag';
import { formatMoney, bookingStateBadge } from '../../lib/booking-view';
import {
  buildRateCardView,
  formatStayRange,
  matchesQuery,
  occupancyBreakdown,
} from '../../lib/room-detail';
import { resolveTab } from '../../lib/routes';
import type {
  RoomType,
  PhysicalRoom,
  RateCode,
  OccupancySummary,
  BookingRequest,
  RoomTypeInsights,
} from '../../lib/types';

type RoomTypeModalProps = {
  visible: boolean;
  onClose: () => void;
  roomType: RoomType;
  /** Tab to open on; unknown values fall back to Overview. */
  initialTab?: string;
  rooms: readonly PhysicalRoom[];
  occupancy?: OccupancySummary;
  insights?: RoomTypeInsights;
  image: ImageSourcePropType;
  bookings: readonly BookingRequest[];
  rateCodes: readonly RateCode[];
  guestNameFor: (booking: BookingRequest) => string;
  agencyNameFor: (agencyId: string) => string | undefined;
  rateAssigneesFor: (rateCodeId: string) => readonly string[];
  onOpenBooking?: (booking: BookingRequest) => void;
};

type TabKey = 'overview' | 'bookings' | 'rates';

const TABS: { key: TabKey; labelKey: string }[] = [
  { key: 'overview', labelKey: 'inventory.tabs.overview' },
  { key: 'bookings', labelKey: 'inventory.tabs.bookings' },
  { key: 'rates', labelKey: 'inventory.tabs.rateCodes' },
];

const SEARCH_PLACEHOLDER: Record<TabKey, string> = {
  overview: 'inventory.roomDetail.searchAmenities',
  bookings: 'inventory.roomDetail.searchBookings',
  rates: 'inventory.roomDetail.searchRateCodes',
};

/** Below this width the two panes stack and the whole body scrolls. */
const SPLIT_MIN_WIDTH = 900;
/** Body height: 0.8x the design's 638, shrinking to fit shorter windows. */
const BODY_HEIGHT = 510;

export function RoomTypeModal({
  visible,
  onClose,
  roomType,
  initialTab,
  rooms,
  occupancy,
  insights,
  image,
  bookings,
  rateCodes,
  guestNameFor,
  agencyNameFor,
  rateAssigneesFor,
  onOpenBooking,
}: RoomTypeModalProps) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const [tab, setTab] = useState<TabKey>(
    () => resolveTab(initialTab, TABS.map((x) => x.key), 'overview') as TabKey,
  );
  const [queries, setQueries] = useState<Record<TabKey, string>>({
    overview: '',
    bookings: '',
    rates: '',
  });
  const query = queries[tab];

  const isSplit = width >= SPLIT_MIN_WIDTH;
  const bodyHeight = Math.min(BODY_HEIGHT, height - 160);
  const breakdown = occupancyBreakdown(occupancy, rooms.length);

  const amenities = useMemo(
    () =>
      roomType.amenities.filter((a) =>
        matchesQuery(queries.overview, [t(`inventory.amenity.${a}`, { defaultValue: a })]),
      ),
    [roomType.amenities, queries.overview, t],
  );

  const visibleBookings = useMemo(
    () =>
      bookings.filter((b) =>
        matchesQuery(queries.bookings, [
          guestNameFor(b),
          b.humanId,
          b.agencyId ? agencyNameFor(b.agencyId) : undefined,
        ]),
      ),
    [bookings, queries.bookings, guestNameFor, agencyNameFor],
  );

  const visibleRates = useMemo(
    () => rateCodes.filter((rc) => matchesQuery(queries.rates, [rc.code, rc.name])),
    [rateCodes, queries.rates],
  );

  const losTitle = t('inventory.avgLengthOfStay');
  const allocationTitle = t('inventory.roomAvailabilityVsAllocation');

  const tabContent = (
    <View className="gap-4.5">
      <SearchBar
        variant="pill"
        value={query}
        onChangeText={(text) => setQueries((q) => ({ ...q, [tab]: text }))}
        placeholder={SEARCH_PLACEHOLDER[tab]}
      />

      {tab === 'overview' && (
        <>
          <View className="flex-row flex-wrap gap-4">
            <View className="h-[160px] min-w-[220px] flex-1 overflow-hidden rounded-md">
              <Image
                source={image}
                resizeMode="cover"
                accessibilityRole="image"
                accessibilityLabel={t('inventory.roomDetail.roomPhoto', { name: roomType.name })}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            {insights && (
              <>
                <View className="h-[160px] min-w-[220px] flex-1">
                  <ChartCard title={losTitle} subtitle={t('common.today')}>
                    <ColumnChart
                      accessibilityLabel={t('inventory.roomDetail.chartSummary', {
                        title: losTitle,
                        values: insights.lengthOfStayBySegment
                          .map((s) => `${t(`inventory.staySegment.${s.segment}`)} ${s.averageNights}`)
                          .join(', '),
                      })}
                      series={[{ labelKey: 'inventory.avgLengthOfStay', colorClassName: 'bg-chart-series' }]}
                      categories={insights.lengthOfStayBySegment.map((s) => ({
                        labelKey: `inventory.staySegment.${s.segment}`,
                        values: [s.averageNights],
                      }))}
                    />
                  </ChartCard>
                </View>
                <View className="h-[160px] min-w-[220px] flex-1">
                  <ChartCard
                    title={allocationTitle}
                    subtitle={t('inventory.roomDetail.allocationSubtitle')}
                  >
                    <ColumnChart
                      plotHeight={76}
                      gridLines={4}
                      accessibilityLabel={t('inventory.roomDetail.chartSummary', {
                        title: allocationTitle,
                        values: insights.allocationByChannel
                          .map((c) => `${t(`inventory.channel.${c.channel}`)} ${c.current} / ${c.previous}`)
                          .join(', '),
                      })}
                      series={[
                        { labelKey: 'inventory.roomDetail.thisWeek', colorClassName: 'bg-chart-current' },
                        { labelKey: 'inventory.roomDetail.lastWeek', colorClassName: 'bg-chart-comparison' },
                      ]}
                      categories={insights.allocationByChannel.map((c) => ({
                        labelKey: `inventory.channel.${c.channel}`,
                        values: [c.current, c.previous],
                      }))}
                    />
                  </ChartCard>
                </View>
              </>
            )}
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-semibold text-fg">{t('inventory.description')}</Text>
            <Text className="text-sm leading-[18px] text-fg-muted">{roomType.description}</Text>
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-semibold text-fg">{t('inventory.amenities')}</Text>
            {amenities.length > 0 ? (
              <View className="flex-row flex-wrap gap-1.5">
                {amenities.map((a) => (
                  <Tag
                    key={a}
                    labelKey={`inventory.amenity.${a}`}
                    params={{ defaultValue: a }}
                    tone="surface"
                  />
                ))}
              </View>
            ) : (
              <Text className="text-sm text-fg-muted">
                {t('inventory.roomDetail.noAmenityMatches')}
              </Text>
            )}
          </View>
        </>
      )}

      {tab === 'bookings' && (
        <View className="gap-2">
          {visibleBookings.map((b) => (
            <BookingRow
              key={b.id}
              guestName={guestNameFor(b)}
              bookingRef={b.humanId}
              guestCount={b.adults + b.children}
              stayDates={formatStayRange(b.checkIn, b.checkOut)}
              amount={formatMoney(b.totalAmount, b.currency)}
              channel={
                (b.agencyId && agencyNameFor(b.agencyId)) ||
                t('agent.independent')
              }
              status={bookingStateBadge(b.state)}
              onPress={onOpenBooking ? () => onOpenBooking(b) : undefined}
            />
          ))}
          {visibleBookings.length === 0 && (
            <Text className="py-6 text-center text-sm text-fg-muted">
              {t(query ? 'common.noResults' : 'inventory.noBookings')}
            </Text>
          )}
        </View>
      )}

      {tab === 'rates' && (
        <View className="gap-2">
          {visibleRates.map((rc) => {
            const view = buildRateCardView(rc, roomType, rateAssigneesFor(rc.id));
            const money = (n: number) => formatMoney(n, view.currency);
            const detail =
              view.detail.kind === 'occupancy'
                ? {
                    kind: 'text' as const,
                    text: t('inventory.roomDetail.occupancyPricing', {
                      adults: view.detail.baseAdults,
                      base: money(view.detail.base),
                      extraAdult: money(view.detail.extraAdult),
                      extraChild: money(view.detail.extraChild),
                    }),
                  }
                : view.detail.kind === 'assigned'
                  ? {
                      kind: 'assigned' as const,
                      prefix:
                        view.detail.names.length === 1
                          ? t('inventory.roomDetail.assignedTo')
                          : t('inventory.roomDetail.assignedToCount', {
                              count: view.detail.names.length,
                            }),
                      names: view.detail.names.join(t('inventory.roomDetail.assigneeSeparator')),
                    }
                  : { kind: 'text' as const, text: t('inventory.roomDetail.notAssigned') };

            return (
              <RateCodeCard
                key={rc.id}
                code={rc.code}
                name={rc.name}
                price={money(view.nightly)}
                detail={detail}
                tags={view.tags}
              />
            );
          })}
          {visibleRates.length === 0 && (
            <Text className="py-6 text-center text-sm text-fg-muted">
              {t(query ? 'common.noResults' : 'inventory.noRateCodes')}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const occupancyPane = (
    <View
      className={`rounded-2xl bg-surface-glass px-5.5 py-4.5 shadow-md ${isSplit ? 'w-[280px]' : 'w-full'}`}
    >
      <OccupancySummaryPanel breakdown={breakdown} />
    </View>
  );

  const detailHeader = (
    <View className="gap-4">
      <SegmentedTabs
        variant="pill"
        tabs={TABS}
        selected={tab}
        onSelect={(key) => setTab(key as TabKey)}
      />
      <View className="h-px w-full bg-surface" />
    </View>
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      variant="sheet"
      title={t('inventory.roomDetail.title', { name: roomType.name, code: roomType.code })}
      subtitle={t('inventory.roomDetail.subtitle', {
        category: t(`inventory.categoryLabel.${roomType.category}`),
        sleeps: roomType.maxOccupancy,
      })}
    >
      {isSplit ? (
        <View className="flex-row gap-4" style={{ height: bodyHeight }}>
          {occupancyPane}
          <View className="flex-1 gap-4 overflow-hidden rounded-2xl bg-surface-glass px-[26px] py-[21px] shadow-md">
            {detailHeader}
            <ScrollView className="flex-1" showsVerticalScrollIndicator>
              {tabContent}
            </ScrollView>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-4">
          {occupancyPane}
          <View className="gap-5 rounded-2xl bg-surface-glass p-4 shadow-md">
            {detailHeader}
            {tabContent}
          </View>
        </ScrollView>
      )}
    </Modal>
  );
}
