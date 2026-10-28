import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const VARIANT_STYLES = {
  brand: { bg: 'bg-brand-light', text: 'text-brand' },
  positive: { bg: 'bg-positive-bg', text: 'text-positive' },
  warning: { bg: 'bg-warning-bg', text: 'text-warning' },
  danger: { bg: 'bg-danger', text: 'text-fg-inverse' },
  neutral: { bg: 'bg-surface-page', text: 'text-fg-muted' },
  vip: { bg: 'bg-warning-vipBg', text: 'text-warning-vip' },
} as const;

const SIZE_STYLES = {
  sm: { container: 'self-start px-2 py-0.5', text: 'text-[10px]' },
  md: { container: 'self-start px-2.5 py-1', text: 'text-xs' },
  lg: { container: 'min-w-[80px] items-center self-center px-3 py-2', text: 'text-[11px]' },
} as const;

type BadgeProps = {
  label: string;
  variant?: keyof typeof VARIANT_STYLES;
  size?: keyof typeof SIZE_STYLES;
};

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const { t } = useTranslation();
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View className={`rounded-pill ${variantStyle.bg} ${sizeStyle.container}`}>
      <Text className={`${variantStyle.text} ${sizeStyle.text} font-semibold`}>
        {t(label)}
      </Text>
    </View>
  );
}
