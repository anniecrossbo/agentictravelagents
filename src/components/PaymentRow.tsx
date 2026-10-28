import { View, Text, Pressable } from 'react-native';
import { Avatar } from './Avatar';

const AMOUNT_TONE = {
  default: 'text-fg',
  danger: 'text-danger',
  positive: 'text-positive',
} as const;

type PaymentRowProps = {
  /** Resolved strings. */
  name: string;
  subtitle: string;
  amount: string;
  amountTone?: keyof typeof AMOUNT_TONE;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/** Compact money row: who, what for, how much. */
export function PaymentRow({ name, subtitle, amount, amountTone = 'default', onPress, accessibilityLabel }: PaymentRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? name}
      className="min-h-[44px] flex-row items-center gap-2.5 py-1.5 active:opacity-70"
    >
      <Avatar name={name} size="sm" tone="soft" />
      <View className="flex-1 gap-0.5">
        <Text className="text-[13px] font-medium text-fg" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-[11px] text-fg-muted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text className={`text-sm font-semibold ${AMOUNT_TONE[amountTone]}`}>{amount}</Text>
    </Pressable>
  );
}
