import { Pressable, Text } from 'react-native';

type PillButtonProps = {
  /** Resolved string. */
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/** Compact rounded action used in panel headers and inline bars. */
export function PillButton({ label, onPress, disabled, accessibilityLabel }: PillButtonProps) {
  const isDisabled = disabled || !onPress;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
      hitSlop={{ top: 6, bottom: 6 }}
      className={`min-h-[32px] items-center justify-center rounded-pill px-4.5 ${
        isDisabled ? 'bg-surface-track' : 'bg-brand active:bg-brand-dark'
      }`}
    >
      <Text className={`text-[11px] font-semibold ${isDisabled ? 'text-fg-muted' : 'text-fg-inverse'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
