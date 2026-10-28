import { View, Text } from 'react-native';

const TONE = {
  teal: { bg: 'bg-tile-tealBg', text: 'text-tile-tealFg' },
  blue: { bg: 'bg-tile-blueBg', text: 'text-tile-blueFg' },
  violet: { bg: 'bg-tile-violetBg', text: 'text-tile-violetFg' },
  amber: { bg: 'bg-tile-amberBg', text: 'text-tile-amberFg' },
} as const;

type SummaryTileProps = {
  /** Resolved strings. */
  label: string;
  value: string;
  unit?: string;
  tone: keyof typeof TONE;
};

/** Tinted KPI tile: small label on top, large figure at the bottom. */
export function SummaryTile({ label, value, unit, tone }: SummaryTileProps) {
  const style = TONE[tone];
  return (
    <View className={`min-h-[110px] flex-1 justify-between rounded-lg border border-border-light p-3.5 ${style.bg}`}>
      <Text className="text-xs text-fg-secondary">{label}</Text>
      <View className="flex-row items-baseline gap-1">
        <Text className={`text-[32px] font-semibold ${style.text}`}>{value}</Text>
        {unit && <Text className={`text-xs ${style.text}`}>{unit}</Text>}
      </View>
    </View>
  );
}
