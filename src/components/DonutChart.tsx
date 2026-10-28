import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { tokens } from '../theme/tokens';

type DonutSegment = {
  value: number;
  color: string;
  labelKey: string;
};

type DonutChartProps = {
  segments: DonutSegment[];
  centerValue: string;
  centerLabelKey?: string;
  size?: number;
  strokeWidth?: number;
  /** Hide the built-in legend when the caller renders its own. */
  showLegend?: boolean;
  /** Round segment ends; flat ends read better when segments touch. */
  roundCaps?: boolean;
};

export function DonutChart({
  segments,
  centerValue,
  centerLabelKey,
  size = 120,
  strokeWidth = 14,
  showLegend = true,
  roundCaps = true,
}: DonutChartProps) {
  const { t } = useTranslation();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let cumulativeOffset = 0;

  return (
    <View className="items-center">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tokens.color.surface.track}
            strokeWidth={strokeWidth}
          />
          {segments.map((segment, index) => {
            const segmentLength = total > 0
              ? (segment.value / total) * circumference
              : 0;
            const offset = cumulativeOffset;
            cumulativeOffset += segmentLength;

            return (
              <Circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-offset}
                strokeLinecap={roundCaps ? 'round' : 'butt'}
                // Rotate -90 degrees so the chart starts from the top
                transform={`rotate(-90, ${size / 2}, ${size / 2})`}
              />
            );
          })}
        </Svg>

        {/* Center text */}
        <View
          className="absolute items-center justify-center"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Text className="text-xl font-bold text-fg">{centerValue}</Text>
          {centerLabelKey && (
            <Text className="text-[10px] text-fg-muted">{t(centerLabelKey)}</Text>
          )}
        </View>
      </View>

      {showLegend && (
        <View className="mt-3 flex-row flex-wrap justify-center gap-3">
          {segments.map((segment, index) => (
            <View key={index} className="flex-row items-center gap-1">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <Text className="text-[10px] text-fg-muted">
                {t(segment.labelKey)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
