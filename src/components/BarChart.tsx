import { View, Text } from 'react-native';
import { tokens } from '../theme/tokens';

type BarChartItem = {
  label: string;
  value: number;
  color?: string;
};

type BarChartProps = {
  data: BarChartItem[];
  direction?: 'horizontal' | 'vertical';
  maxValue?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  showLabels?: boolean;
};

export function BarChart({
  data,
  direction = 'vertical',
  maxValue: maxValueProp,
  valuePrefix = '',
  valueSuffix = '',
  showLabels = true,
}: BarChartProps) {
  const maxValue = maxValueProp ?? Math.max(...data.map((d) => d.value), 1);
  const defaultColor = tokens.color.brand.DEFAULT;

  if (direction === 'horizontal') {
    return (
      <View className="gap-3">
        {data.map((item, index) => {
          const widthPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <View key={index} className="gap-1">
              {showLabels && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-fg-muted">{item.label}</Text>
                  <Text className="text-xs font-semibold text-fg">
                    {valuePrefix}{item.value}{valueSuffix}
                  </Text>
                </View>
              )}
              <View className="h-3 overflow-hidden rounded-pill bg-surface-track">
                <View
                  className="h-full rounded-pill"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: item.color ?? defaultColor,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // Vertical bars
  const BAR_HEIGHT = 120;

  return (
    <View className="flex-row items-end justify-around gap-2">
      {data.map((item, index) => {
        const heightPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const barHeight = (heightPct / 100) * BAR_HEIGHT;
        return (
          <View key={index} className="flex-1 items-center">
            <Text className="mb-1 text-[10px] font-semibold text-fg">
              {valuePrefix}{item.value}{valueSuffix}
            </Text>
            <View
              style={{ height: BAR_HEIGHT }}
              className="w-full items-center justify-end"
            >
              <View
                className="w-full max-w-[32px] rounded-t-sm"
                style={{
                  height: Math.max(barHeight, 2),
                  backgroundColor: item.color ?? defaultColor,
                }}
              />
            </View>
            {showLabels && (
              <Text
                className="mt-1.5 text-center text-[10px] text-fg-muted"
                numberOfLines={1}
              >
                {item.label}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
