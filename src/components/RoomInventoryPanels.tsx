import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatusStatCard } from './StatusStatCard';
import { RoomBreakdownRow } from './RoomBreakdownRow';
import type { RoomStatusCounts } from '../lib/inventory-view';

type RoomInventoryPanelsProps = {
  snapshot: RoomStatusCounts;
  breakdown: readonly (RoomStatusCounts & { roomTypeId: string; name: string })[];
};

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** Portfolio snapshot beside the per-room-type status breakdown. */
export function RoomInventoryPanels({ snapshot, breakdown }: RoomInventoryPanelsProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 flex-row gap-4 pt-4">
      <View className="w-[220px] gap-2.5 rounded-lg border border-border-light bg-surface-panel p-3.5">
        <Text className="text-xs font-semibold text-fg-muted">{t('inventory.page.snapshot')}</Text>
        <View className="h-px w-full bg-border-light" />
        <StatusStatCard
          tone="occupied"
          label={t('inventory.page.occupied')}
          value={String(snapshot.occupied)}
          caption={t('inventory.page.pctOfTotal', { pct: pct(snapshot.occupied, snapshot.total) })}
        />
        <StatusStatCard
          tone="available"
          label={t('inventory.page.availableLabel')}
          value={String(snapshot.available)}
          caption={t('inventory.page.pctOfTotal', { pct: pct(snapshot.available, snapshot.total) })}
        />
        <StatusStatCard
          tone="outOfOrder"
          label={t('inventory.page.outOfOrderLabel')}
          value={String(snapshot.outOfOrder)}
        />
      </View>

      <View className="flex-1 gap-3 rounded-lg border border-border-light bg-surface p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-fg-muted">{t('inventory.page.breakdown')}</Text>
          <Text className="text-[11px] text-fg-muted">{t('inventory.page.breakdownLegend')}</Text>
        </View>
        <View className="h-px w-full bg-border-light" />
        <ScrollView className="flex-1" contentContainerClassName="gap-3">
          {breakdown.map((row) => (
            <RoomBreakdownRow
              key={row.roomTypeId}
              name={row.name}
              totalLabel={t('inventory.page.typeTotal', { count: row.total })}
              items={[
                { tone: 'occupied' as const, label: t('inventory.page.countOccupied', { count: row.occupied }) },
                { tone: 'available' as const, label: t('inventory.page.countAvailable', { count: row.available }) },
                ...(row.outOfOrder > 0
                  ? [{ tone: 'outOfOrder' as const, label: t('inventory.page.countOutOfOrder', { count: row.outOfOrder }) }]
                  : []),
              ]}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
