import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { Avatar } from './Avatar';

type ListRowProps = {
  avatar?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  leftBorderColor?: string;
};

export function ListRow({
  avatar,
  title,
  subtitle,
  trailing,
  onPress,
  leftBorderColor,
}: ListRowProps) {
  const { t } = useTranslation();

  const content = (
    <View
      className={`flex-row items-center border-b border-border px-4 py-3 ${
        leftBorderColor ? 'border-l-4' : ''
      }`}
      style={leftBorderColor ? { borderLeftColor: leftBorderColor } : undefined}
    >
      {avatar && (
        <View className="mr-3">
          <Avatar name={avatar} size="md" />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-sm font-medium text-fg" numberOfLines={1}>
          {t(title)}
        </Text>
        {subtitle && (
          <Text className="mt-0.5 text-xs text-fg-muted" numberOfLines={1}>
            {t(subtitle)}
          </Text>
        )}
      </View>
      {trailing && <View className="ml-3">{trailing}</View>}
      {onPress && !trailing && (
        <ChevronRight size={16} color={tokens.color.fg.muted} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        className="active:bg-surface-page"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
