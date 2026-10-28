import { useState } from 'react';
import { View, Text, type LayoutChangeEvent } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { tokens } from '../theme/tokens';

type TrendSeries = {
  key: string;
  /** Resolved legend label. */
  label: string;
  /** Stroke colour — a token value. */
  color: string;
  values: readonly number[];
};

type TrendLineChartProps = {
  series: readonly TrendSeries[];
  /** Resolved x-axis labels keyed by point index; unlabelled points get none. */
  xLabels: Readonly<Record<number, string>>;
  /** Number of points on the x axis (the longest series if omitted). */
  points?: number;
  height?: number;
  gridLines?: number;
  accessibilityLabel: string;
};

/** Minimal multi-series line chart: gridlines, no y axis, sparse x labels and a legend. */
export function TrendLineChart({
  series,
  xLabels,
  points,
  height = 140,
  gridLines = 5,
  accessibilityLabel,
}: TrendLineChartProps) {
  const [width, setWidth] = useState(0);
  const count = points ?? Math.max(1, ...series.map((s) => s.values.length));
  const max = Math.max(1, ...series.flatMap((s) => s.values)) * 1.08;
  const x = (i: number) => (count > 1 ? (i / (count - 1)) * (width - 2) + 1 : width / 2);
  const y = (v: number) => height - 2 - (v / max) * (height - 4);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      className="gap-1.5"
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          {Array.from({ length: gridLines }, (_, i) => {
            const gy = (i / (gridLines - 1)) * (height - 1) + 0.5;
            return (
              <Line key={i} x1={0} x2={width} y1={gy} y2={gy} stroke={tokens.color.chart.grid} strokeWidth={1} />
            );
          })}
          {series.map((s) => (
            <Polyline
              key={s.key}
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </Svg>
      )}

      <View className="h-3.5">
        {width > 0 &&
          Object.entries(xLabels).map(([i, label]) => (
            <Text
              key={i}
              className="absolute text-[10px] text-fg-muted"
              style={{ left: Math.min(Math.max(x(Number(i)) - 8, 0), width - 24) }}
            >
              {label}
            </Text>
          ))}
      </View>

      <View className="flex-row gap-4 pt-1">
        {series.map((s) => (
          <View key={s.key} className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-pill" style={{ backgroundColor: s.color }} />
            <Text className="text-[10px] text-fg-muted">{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
