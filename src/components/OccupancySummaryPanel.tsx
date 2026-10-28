import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '../theme/tokens';
import { DonutChart } from './DonutChart';
import { StatRow } from './StatRow';
import type { OccupancyBreakdown, OccupancyStatus } from '../lib/room-detail';

const STATUS_STYLE: Record<OccupancyStatus, { labelKey: string; color: string; dot: string }> = {
  occupied: {
    labelKey: 'inventory.occupied',
    color: tokens.color.occupancy.occupied,
    dot: 'bg-occupancy-occupied',
  },
  sellable: {
    labelKey: 'inventory.sellable',
    color: tokens.color.occupancy.sellable,
    dot: 'bg-occupancy-sellable',
  },
  onHold: {
    labelKey: 'inventory.onHold',
    color: tokens.color.occupancy.onHold,
    dot: 'bg-occupancy-onHold',
  },
};

/** Ring order clockwise from 12 o'clock, matching the design. */
const RING_ORDER: readonly OccupancyStatus[] = ['occupied', 'onHold', 'sellable'];

type OccupancySummaryPanelProps = {
  breakdown: OccupancyBreakdown;
};

export function OccupancySummaryPanel({ breakdown }: OccupancySummaryPanelProps) {
  const { t } = useTranslation();
  const countFor = (status: OccupancyStatus) =>
    breakdown.segments.find((s) => s.status === status)?.count ?? 0;
  // Out-of-order / out-of-service rooms aren't charted; leave their share as bare track.
  const charted = breakdown.segments.reduce((sum, s) => sum + s.count, 0);
  const uncharted = Math.max(breakdown.total - charted, 0);

  return (
    <View className="items-center gap-3">
      <Text className="w-full text-center text-base font-semibold text-fg">
        {t('inventory.occupancySummary')}
      </Text>
      <View className="h-px w-full bg-surface" />

      <View className="items-center gap-1.5">
        <DonutChart
          size={96}
          strokeWidth={13.4}
          showLegend={false}
          roundCaps={false}
          centerValue={String(breakdown.total)}
          segments={[
            ...RING_ORDER.map((status) => ({
              value: countFor(status),
              color: STATUS_STYLE[status].color,
              labelKey: STATUS_STYLE[status].labelKey,
            })),
            { value: uncharted, color: tokens.color.surface.track, labelKey: 'inventory.outOfOrder' },
          ]}
        />
        <Text className="text-xs font-semibold text-fg-secondary">
          {t('inventory.roomDetail.occupancyTotal')}
        </Text>
      </View>

      <View className="w-full gap-1.5">
        <StatRow labelKey="inventory.totalRooms" value={String(breakdown.total)} />
        {breakdown.segments.map((s) => (
          <StatRow
            key={s.status}
            labelKey={STATUS_STYLE[s.status].labelKey}
            value={String(s.count)}
            dotClassName={STATUS_STYLE[s.status].dot}
          />
        ))}
      </View>
    </View>
  );
}
