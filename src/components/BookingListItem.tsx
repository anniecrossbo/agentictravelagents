import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

type BookingListItemProps = {
  /** Resolved strings. */
  guestName: string;
  subtitle: string;
  amount: string;
  status: { label: string; variant: 'brand' | 'positive' | 'warning' | 'danger' | 'neutral' };
  onPress: () => void;
};

/** Narrow booking row for side lists: guest, room and dates, value and state. */
export function BookingListItem({ guestName, subtitle, amount, status, onPress }: BookingListItemProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${guestName}, ${subtitle}, ${amount}, ${t(status.label)}`}
      className="min-h-[52px] flex-row items-center gap-2.5 border-t border-border px-1 py-2.5 active:bg-surface-page"
    >
      <Avatar name={guestName} size="md" />
      <View className="flex-1 gap-[3px]">
        <Text className="text-xs font-bold text-fg" numberOfLines={1}>
          {guestName}
        </Text>
        <Text className="text-[10px] text-fg-muted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text className="text-xs font-semibold text-fg">{amount}</Text>
        <Badge label={status.label} variant={status.variant} size="sm" />
      </View>
    </Pressable>
  );
}
