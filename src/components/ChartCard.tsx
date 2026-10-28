import { View, Text } from 'react-native';

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

/** Compact titled tile for a small chart. Takes resolved strings. */
export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <View className="flex-1 gap-2 rounded-md bg-surface-glassStrong px-3 py-2.5">
      <View className="gap-0.5">
        <Text className="text-xs font-semibold text-fg" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-[10px] text-fg-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}
