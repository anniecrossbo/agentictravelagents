import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

type GuestRowProps = {
  avatar: string;
  guestName: string;
  subtitle: string;
  dateLabel: string;
  dateBadgeVariant?: 'positive' | 'warning' | 'neutral';
  onPress?: () => void;
};

export function GuestRow({
  avatar,
  guestName,
  subtitle,
  dateLabel,
  dateBadgeVariant = 'neutral',
  onPress,
}: GuestRowProps) {
  const content = (
    <View className="flex-row items-center border-b border-border px-4 py-3">
      <Avatar name={avatar} size="md" />
      <View className="ml-3 flex-1">
        <Text className="text-sm font-medium text-fg" numberOfLines={1}>
          {guestName}
        </Text>
        <Text className="mt-0.5 text-xs text-fg-muted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View className="ml-3 flex-row items-center gap-2">
        <Badge label={dateLabel} variant={dateBadgeVariant} size="sm" />
        {onPress && <ChevronRight size={16} color={tokens.color.fg.muted} />}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={guestName}
        className="active:bg-surface-page"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
