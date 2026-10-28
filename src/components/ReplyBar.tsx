import { View, TextInput } from 'react-native';
import { tokens } from '../theme/tokens';
import { PillButton } from './PillButton';

type ReplyBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  /** Resolved strings. */
  placeholder: string;
  sendLabel: string;
};

export function ReplyBar({ value, onChangeText, onSend, placeholder, sendLabel }: ReplyBarProps) {
  return (
    <View className="min-h-[44px] flex-row items-center gap-2.5 rounded-3xl bg-surface py-1.5 pl-4 pr-1.5">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens.color.fg.muted}
        accessibilityLabel={placeholder}
        onSubmitEditing={onSend}
        className="flex-1 py-1 text-xs text-fg"
      />
      <PillButton label={sendLabel} onPress={value.trim() ? onSend : undefined} />
    </View>
  );
}
