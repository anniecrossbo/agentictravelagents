import { View, Text } from 'react-native';
import type { RoomStatusTone } from './StatusStatCard';

const DOT: Record<RoomStatusTone, string> = {
  occupied: 'bg-roomStatus-occupied',
  available: 'bg-roomStatus-available',
  outOfOrder: 'bg-roomStatus-outOfOrder',
};

type RoomBreakdownRowProps = {
  /** Resolved strings. */
  name: string;
  totalLabel: string;
  /** Counts to show; zero entries are the caller's to omit. */
  items: readonly { tone: RoomStatusTone; label: string }[];
};

export function RoomBreakdownRow({ name, totalLabel, items }: RoomBreakdownRowProps) {
  return (
    <View className="gap-1 rounded-md bg-surface-panel px-3 py-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-fg-secondary" numberOfLines={1}>
          {name}
        </Text>
        <View className="rounded-pill bg-surface px-2 py-0.5">
          <Text className="text-[10px] font-semibold text-fg-secondary">{totalLabel}</Text>
        </View>
      </View>
      <View className="h-px w-full bg-border-light" />
      <View className="flex-row flex-wrap items-center gap-2">
        {items.map((item) => (
          <View key={item.tone} className="flex-row items-center gap-1.5">
            <View className={`h-2 w-2 rounded-xs ${DOT[item.tone]}`} />
            <Text className={`text-[11px] ${item.tone === 'available' ? 'text-fg' : 'text-fg-muted'}`}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
