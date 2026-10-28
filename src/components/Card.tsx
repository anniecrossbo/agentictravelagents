import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge } from './Badge';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  count?: number;
  onPress?: () => void;
};

function CardInner({ children, className, title, count }: Omit<CardProps, 'onPress'>) {
  const { t } = useTranslation();

  return (
    <View className={`bg-surface rounded-2xl p-5.5 shadow-sm ${className ?? ''}`}>
      {title && (
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-fg">{t(title)}</Text>
          {count != null && (
            <Badge label={String(count)} variant="brand" size="sm" />
          )}
        </View>
      )}
      {children}
    </View>
  );
}

export function Card({ children, className, title, count, onPress }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title ? undefined : undefined}
      >
        <CardInner className={className} title={title} count={count}>
          {children}
        </CardInner>
      </Pressable>
    );
  }

  return (
    <CardInner className={className} title={title} count={count}>
      {children}
    </CardInner>
  );
}
