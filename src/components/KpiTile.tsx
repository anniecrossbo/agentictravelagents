import { View, Text } from 'react-native';

type KpiTileProps = {
  /** Resolved strings. */
  label: string;
  value: string;
};

/** Small labelled figure for a KPI row. */
export function KpiTile({ label, value }: KpiTileProps) {
  return (
    <View className="min-w-[45%] flex-1 flex-row items-baseline justify-between gap-2 rounded-md bg-surface-panel px-2.5 py-1.5">
      <Text className="text-[10px] font-semibold uppercase text-fg-muted" numberOfLines={1}>
        {label}
      </Text>
      <Text className="text-sm font-semibold text-fg" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
