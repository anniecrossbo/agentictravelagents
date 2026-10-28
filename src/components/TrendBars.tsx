import { View, Text } from 'react-native';

type TrendBar = {
  key: string;
  /** Resolved axis label, e.g. '21'. */
  label: string;
  /** 0–1 */
  fraction: number;
  /** Draw in the solid brand colour, e.g. tonight. */
  highlight?: boolean;
};

type TrendBarsProps = {
  bars: readonly TrendBar[];
  /** Screen-reader summary of the series. */
  accessibilityLabel: string;
  height?: number;
};

/** Compact day-by-day bar strip scaled to 0–100%, with a hairline at full. */
export function TrendBars({ bars, accessibilityLabel, height = 72 }: TrendBarsProps) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} className="gap-1">
      <View style={{ height }} className="flex-row items-end gap-[3px] border-t border-border-light">
        {bars.map((bar) => (
          <View
            key={bar.key}
            className={`flex-1 rounded-t-xs ${bar.highlight ? 'bg-brand' : 'bg-chart-series'}`}
            style={{ height: Math.max(Math.min(bar.fraction, 1), 0.02) * height }}
          />
        ))}
      </View>
      <View className="flex-row gap-[3px]">
        {bars.map((bar) => (
          <Text
            key={bar.key}
            className={`flex-1 text-center text-[8px] ${bar.highlight ? 'font-semibold text-brand' : 'text-fg-muted'}`}
          >
            {bar.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
