import { View, Text } from 'react-native';

type RankedBar = {
  key: string;
  /** Resolved string. */
  label: string;
  value: number;
  /** Shown instead of the raw value, e.g. '4 of 4 · 100%'. */
  valueLabel?: string;
  /** 0–1 bar fill; defaults to value relative to the largest in the list. */
  fraction?: number;
  /** De-emphasised row, e.g. an "Others" roll-up. */
  muted?: boolean;
};

type RankedBarListProps = {
  items: readonly RankedBar[];
};

/** Labelled horizontal bars scaled to the largest value in the list. */
export function RankedBarList({ items }: RankedBarListProps) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <View className="gap-4">
      {items.map((item) => (
        <View key={item.key} className="gap-1.5">
          <View className="flex-row items-center">
            <Text
              className={`flex-1 text-xs text-fg ${item.muted ? '' : 'font-semibold'}`}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            <Text className="text-xs font-semibold text-fg-muted">{item.valueLabel ?? item.value}</Text>
          </View>
          <View className="h-2.5 w-full overflow-hidden rounded-pill bg-surface-track">
            <View
              className="h-full rounded-pill bg-chart-series"
              style={{ width: `${Math.min(item.fraction ?? item.value / max, 1) * 100}%` }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
