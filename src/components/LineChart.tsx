import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Polyline, Line, Text as SvgText } from 'react-native-svg';
import { tokens } from '../theme/tokens';

type LineData = {
  key: string;
  labelKey: string;
  color: string;
  data: number[];
};

type LineChartProps = {
  lines: LineData[];
  xLabels: string[];
  height?: number;
};

const CHART_PADDING = { top: 12, right: 12, bottom: 24, left: 40 };

export function LineChart({ lines, xLabels, height = 160 }: LineChartProps) {
  const { t } = useTranslation();

  const allValues = lines.flatMap((l) => l.data);
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues, 0);
  const range = maxValue - minValue || 1;

  const width = Math.max(xLabels.length * 60, 280);
  const plotW = width - CHART_PADDING.left - CHART_PADDING.right;
  const plotH = height - CHART_PADDING.top - CHART_PADDING.bottom;

  const GRID_LINES = 4;
  const gridValues = Array.from({ length: GRID_LINES + 1 }, (_, i) =>
    minValue + (range / GRID_LINES) * i,
  );

  function toX(index: number): number {
    const pointCount = xLabels.length > 1 ? xLabels.length - 1 : 1;
    return CHART_PADDING.left + (index / pointCount) * plotW;
  }

  function toY(value: number): number {
    return CHART_PADDING.top + plotH - ((value - minValue) / range) * plotH;
  }

  return (
    <View className="items-center">
      <Svg width={width} height={height}>
        {/* Horizontal grid lines */}
        {gridValues.map((val, i) => {
          const y = toY(val);
          return (
            <Line
              key={`grid-${i}`}
              x1={CHART_PADDING.left}
              y1={y}
              x2={width - CHART_PADDING.right}
              y2={y}
              stroke={tokens.color.border.light}
              strokeWidth={1}
            />
          );
        })}

        {/* Y-axis labels */}
        {gridValues.map((val, i) => (
          <SvgText
            key={`ylabel-${i}`}
            x={CHART_PADDING.left - 6}
            y={toY(val) + 3}
            fontSize={9}
            fill={tokens.color.fg.muted}
            textAnchor="end"
          >
            {Math.round(val)}
          </SvgText>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, i) => (
          <SvgText
            key={`xlabel-${i}`}
            x={toX(i)}
            y={height - 4}
            fontSize={9}
            fill={tokens.color.fg.muted}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}

        {/* Line paths */}
        {lines.map((line) => {
          const points = line.data
            .map((val, i) => `${toX(i)},${toY(val)}`)
            .join(' ');
          return (
            <Polyline
              key={line.key}
              points={points}
              fill="none"
              stroke={line.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
      </Svg>

      {/* Legend */}
      <View className="mt-3 flex-row flex-wrap justify-center gap-4">
        {lines.map((line) => (
          <View key={line.key} className="flex-row items-center gap-1.5">
            <View
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: line.color }}
            />
            <Text className="text-[10px] text-fg-muted">{t(line.labelKey)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
