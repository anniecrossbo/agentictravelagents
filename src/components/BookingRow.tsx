import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

type BookingRowProps = {
  guestName: string;
  bookingRef: string;
  guestCount: number;
  /** Pre-formatted, e.g. 'Sep 12–16'. */
  stayDates: string;
  /** Pre-formatted, e.g. '€285'. */
  amount: string;
  /** Agency name, or the independent-agent label. */
  channel: string;
  status: { label: string; variant: 'brand' | 'positive' | 'warning' | 'danger' | 'neutral' };
  onPress?: () => void;
};

export function BookingRow({
  guestName,
  bookingRef,
  guestCount,
  stayDates,
  amount,
  channel,
  status,
  onPress,
}: BookingRowProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={t('inventory.roomDetail.openBooking', { id: bookingRef, guest: guestName })}
      className="flex-row items-center gap-3 rounded-lg bg-surface-glassStrong px-3 py-2 active:opacity-80"
    >
      <View className="flex-1 flex-row items-center gap-1.5">
        <Avatar name={guestName} size="sm" color="bg-avatar-ink" />
        <View className="flex-1 gap-1">
          <Text className="text-[13px] font-semibold text-fg" numberOfLines={1}>
            {guestName}
          </Text>
          <Text className="text-[11px] text-fg-muted" numberOfLines={1}>
            {bookingRef} · {t('inventory.roomDetail.guestCount', { count: guestCount })}
          </Text>
        </View>
      </View>

      <Text className="w-[84px] text-xs text-fg" numberOfLines={1}>
        {stayDates}
      </Text>
      <Text className="w-[64px] text-xs font-semibold text-brand-dark" numberOfLines={1}>
        {amount}
      </Text>
      <Text className="w-[120px] text-xs font-semibold text-brand-dark" numberOfLines={1}>
        {channel}
      </Text>
      <View className="w-[120px] items-center">
        <Badge label={status.label} variant={status.variant} size="lg" />
      </View>
      <ChevronRight size={18} color={tokens.color.brand.DEFAULT} />
    </Pressable>
  );
}
