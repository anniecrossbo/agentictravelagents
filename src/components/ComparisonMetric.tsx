import { View, Text } from 'react-native';

type ComparisonMetricProps = {
  /** Resolved strings. */
  value: string;
  label: string;
  /** Short name of the comparison period, shown under its marker, e.g. 'Aug'. */
  previousLabel: string;
  /** 0–1 positions on the shared track. */
  fill: number;
  marker: number;
  /** NativeWind background class for the fill, e.g. 'bg-chart-seriesPositive'. */
  fillClassName: string;
  accessibilityLabel: string;
};

/** Headline figure with a bar showing this period against a marker for the last. */
export function ComparisonMetric({
  value,
  label,
  previousLabel,
  fill,
  marker,
  fillClassName,
  accessibilityLabel,
}: ComparisonMetricProps) {
  const pct = (n: number) => `${Math.min(Math.max(n, 0), 1) * 100}%` as const;

  return (
    <View className="gap-2.5" accessible accessibilityLabel={accessibilityLabel}>
      <View className="flex-row items-baseline gap-2">
        <Text className="text-[28px] font-medium leading-8 text-fg">{value}</Text>
        <Text className="text-xs font-medium text-fg">{label}</Text>
      </View>
      <View className="gap-1">
        <View className="h-2.5 w-full rounded-pill bg-surface-track">
          <View
            className={`absolute bottom-0 left-0 top-0 rounded-pill ${fillClassName}`}
            style={{ width: pct(fill) }}
          />
          <View className="absolute bottom-0 top-0 w-0.5 bg-fg" style={{ left: pct(marker) }} />
        </View>
        <View className="h-3">
          <Text
            className="absolute text-[10px] font-medium text-fg opacity-70"
            style={{ left: pct(marker), transform: [{ translateX: -8 }] }}
          >
            {previousLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
