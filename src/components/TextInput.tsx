import { TextInput as RNTextInput, type TextInputProps as RNTextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '../theme/tokens';

type TextInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: boolean;
} & Omit<RNTextInputProps, 'value' | 'onChangeText' | 'placeholder'>;

export function TextInput({
  value,
  onChangeText,
  placeholder,
  error = false,
  ...rest
}: TextInputProps) {
  const { t } = useTranslation();

  return (
    <RNTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder ? t(placeholder) : undefined}
      placeholderTextColor={tokens.color.fg.placeholder}
      className={`rounded-md border bg-surface px-3 py-2.5 text-sm text-fg ${
        error ? 'border-danger' : 'border-border-input'
      }`}
      accessibilityRole="text"
      {...rest}
    />
  );
}
