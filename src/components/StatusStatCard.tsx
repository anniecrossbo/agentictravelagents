import { View, Text } from 'react-native';

const TONE = {
  occupied: { bg: 'bg-roomStatus-occupiedBg', text: 'text-roomStatus-occupied' },
  available: { bg: 'bg-roomStatus-availableBg', text: 'text-roomStatus-availableFg' },
  outOfOrder: { bg: 'bg-roomStatus-outOfOrderBg', text: 'text-roomStatus-outOfOrderFg' },
} as const;

export type RoomStatusTone = keyof typeof TONE;

type StatusStatCardProps = {
  /** Resolved strings. */
  label: string;
  value: string;
  caption?: string;
  tone: RoomStatusTone;
};

/** Tinted count card for one room status, e.g. "Occupied 24 · 71% of total rooms". */
export function StatusStatCard({ label, value, caption, tone }: StatusStatCardProps) {
  const style = TONE[tone];
  return (
    <View className={`gap-1.5 rounded-md px-3 py-2 ${style.bg}`}>
      <View className="flex-row items-center justify-between">
        <Text className={`text-xs font-semibold ${style.text}`}>{label}</Text>
        <Text className={`text-xl font-bold ${style.text}`}>{value}</Text>
      </View>
      {caption && <Text className="text-[11px] text-fg-muted">{caption}</Text>}
    </View>
  );
}
