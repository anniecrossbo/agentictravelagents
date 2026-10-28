import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react-native';
import { Inbox } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

type EmptyStateProps = {
  messageKey: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  messageKey,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <View className="items-center justify-center px-6 py-12">
      <Icon size={40} color={tokens.color.fg.muted} strokeWidth={1.5} />
      <Text className="mt-3 text-center text-sm text-fg-muted">
        {t(messageKey)}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={t(actionLabel)}
          className="mt-4 rounded-md bg-brand px-4 py-2 active:bg-brand-dark"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text className="text-sm font-semibold text-fg-inverse">
            {t(actionLabel)}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
