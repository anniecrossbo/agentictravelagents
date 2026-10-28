import { View, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** 'pill' is the borderless white field used inside glass panels. */
  variant?: 'default' | 'pill';
  /** 'pill' only: hairline border, for pills sitting on a white surface. */
  bordered?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'common.search',
  variant = 'default',
  bordered = false,
}: SearchBarProps) {
  const { t } = useTranslation();
  const isPill = variant === 'pill';

  return (
    <View
      className={
        isPill
          ? `flex-row items-center rounded-3xl bg-surface px-3.5 ${
              bordered ? 'min-h-[37px] border border-border-input' : 'min-h-[28px]'
            }`
          : 'flex-row items-center gap-2 rounded-md bg-surface-search px-3 py-2.5'
      }
    >
      {!isPill && <Search size={16} color={tokens.color.fg.muted} />}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t(placeholder)}
        placeholderTextColor={isPill ? tokens.color.fg.muted : tokens.color.fg.placeholder}
        className={`flex-1 text-fg ${isPill ? 'py-1 text-xs' : 'text-sm'}`}
        accessibilityRole="search"
        accessibilityLabel={t(placeholder)}
      />
    </View>
  );
}
