import { View, Text } from 'react-native';

type RevenueStatCardProps = {
  /** Resolved strings. */
  period: string;
  bookings: string;
  amount: string;
};

/** Period label over a booking count and revenue figure. */
export function RevenueStatCard({ period, bookings, amount }: RevenueStatCardProps) {
  return (
    <View className="w-full gap-1 rounded-md bg-surface-glassStrong px-3 py-2.5">
      <Text className="text-[10px] font-semibold uppercase tracking-[0.5px] text-fg">{period}</Text>
      <View className="flex-row items-end justify-between">
        <Text className="text-[10px] font-semibold tracking-[0.5px] text-fg-muted">{bookings}</Text>
        <Text className="text-base font-semibold text-brand">{amount}</Text>
      </View>
    </View>
  );
}
