import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

const VARIANT_STYLES = {
  primary: {
    container: 'bg-brand',
    containerPressed: 'bg-brand-dark',
    text: 'text-fg-inverse',
    spinnerColor: tokens.color.fg.inverse,
  },
  secondary: {
    container: 'bg-transparent border border-border-input',
    containerPressed: 'bg-surface-page',
    text: 'text-fg',
    spinnerColor: tokens.color.fg.DEFAULT,
  },
  ghost: {
    container: 'bg-transparent',
    containerPressed: 'bg-surface-page',
    text: 'text-brand',
    spinnerColor: tokens.color.brand.DEFAULT,
  },
  danger: {
    container: 'bg-danger',
    containerPressed: 'bg-danger',
    text: 'text-fg-inverse',
    spinnerColor: tokens.color.fg.inverse,
  },
} as const;

const SIZE_STYLES = {
  sm: { container: 'px-3 py-1.5 rounded-sm', text: 'text-xs', iconSize: 14 },
  md: { container: 'px-4 py-2.5 rounded-md', text: 'text-sm', iconSize: 16 },
  lg: { container: 'px-5 py-3 rounded-md', text: 'text-base', iconSize: 18 },
} as const;

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: keyof typeof VARIANT_STYLES;
  size?: keyof typeof SIZE_STYLES;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  accessibilityLabel?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  accessibilityLabel: a11yLabel,
}: ButtonProps) {
  const { t } = useTranslation();
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const translatedLabel = t(label);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? translatedLabel}
      accessibilityState={{ disabled: disabled || loading }}
      className={`flex-row items-center justify-center ${sizeStyle.container} ${variantStyle.container} ${disabled ? 'opacity-50' : ''}`}
      // PROTO: hitSlop ensures 44pt minimum touch target on small buttons
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.spinnerColor} />
      ) : (
        <View className="flex-row items-center gap-1.5">
          {Icon && (
            <Icon
              size={sizeStyle.iconSize}
              color={variantStyle.spinnerColor}
            />
          )}
          <Text className={`${variantStyle.text} ${sizeStyle.text} font-semibold`}>
            {translatedLabel}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
