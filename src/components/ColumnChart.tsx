import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

type ColumnSeries = {
  labelKey: string;
  /** NativeWind background class, e.g. 'bg-chart-current'. */
  colorClassName: string;
};

type ColumnCategory = {
  labelKey: string;
  /** One value per series, in series order. */
  values: readonly number[];
  /** Overrides the series colour for this category, e.g. to set apart a partial month. */
  colorClassName?: string;
};

type ColumnChartProps = {
  categories: readonly ColumnCategory[];
  series: readonly ColumnSeries[];
  /** Screen-reader summary of the data, since the bars themselves aren't readable. */
  accessibilityLabel: string;
  plotHeight?: number;
  gridLines?: number;
};

/** Tallest bar reaches this share of the plot, leaving room for its value label. */
const HEADROOM = 0.88;

/**
 * Vertical column chart with gridlines. One series shows a value label on each
 * bar; several series render grouped bars with a legend.
 */
export function ColumnChart({
  categories,
  series,
  accessibilityLabel,
  plotHeight = 86,
  gridLines = 5,
}: ColumnChartProps) {
  const { t } = useTranslation();
  const isGrouped = series.length > 1;
  const max = Math.max(1, ...categories.flatMap((c) => c.values));
  const barWidth = isGrouped ? 9 : 27;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <View>
        <View
          className="absolute left-0 right-0 top-0 justify-between"
          style={{ height: plotHeight }}
        >
          {Array.from({ length: gridLines }, (_, i) => (
            <View key={i} className="h-px w-full bg-chart-grid" />
          ))}
        </View>

        <View className="flex-row justify-between">
          {categories.map((category) => (
            <View key={category.labelKey} className="items-center gap-1">
              <View className="flex-row items-end gap-[3px]" style={{ height: plotHeight }}>
                {category.values.map((value, i) => (
                  <View key={series[i]?.labelKey ?? i} className="items-center gap-0.5">
                    {!isGrouped && (
                      <Text className="text-[8px] font-semibold text-fg-secondary">{value}</Text>
                    )}
                    <View
                      className={`${isGrouped ? 'rounded-t-xs' : 'rounded-t-[5px]'} ${
                        category.colorClassName ?? series[i]?.colorClassName ?? ''
                      }`}
                      style={{ width: barWidth, height: (value / max) * plotHeight * HEADROOM }}
                    />
                  </View>
                ))}
              </View>
              <Text className="text-[8px] font-semibold text-fg-muted" numberOfLines={1}>
                {t(category.labelKey)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {isGrouped && (
        <View className="mt-2 flex-row gap-3">
          {series.map((s) => (
            <View key={s.labelKey} className="flex-row items-center gap-1">
              <View className={`h-1.5 w-1.5 rounded-pill ${s.colorClassName}`} />
              <Text className="text-[8px] font-semibold text-fg-secondary">{t(s.labelKey)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
