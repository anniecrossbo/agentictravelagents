import { ScrollView, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type FilterOption = {
  key: string;
  labelKey: string;
  count?: number;
};

type FilterPillsProps = {
  options: FilterOption[];
  selected: string;
  onSelect: (key: string) => void;
};

export function FilterPills({ options, selected, onSelect }: FilterPillsProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-1"
    >
      {options.map((option) => {
        const isActive = option.key === selected;
        return (
          <Pressable
            key={option.key}
            onPress={() => onSelect(option.key)}
            accessibilityRole="button"
            accessibilityLabel={t(option.labelKey)}
            accessibilityState={{ selected: isActive }}
            className={`flex-row items-center rounded-pill border px-3 py-1.5 ${
              isActive
                ? 'border-brand-45 bg-brand-light'
                : 'border-border-muted bg-transparent'
            }`}
            hitSlop={{ top: 6, bottom: 6 }}
          >
            <Text
              className={`text-xs font-medium ${
                isActive ? 'text-brand' : 'text-fg-muted'
              }`}
            >
              {t(option.labelKey)}
            </Text>
            {option.count != null && (
              <View
                className={`ml-1.5 rounded-pill px-1.5 ${
                  isActive ? 'bg-brand-14' : 'bg-surface-page'
                }`}
              >
                <Text
                  className={`text-[10px] font-semibold ${
                    isActive ? 'text-brand' : 'text-fg-muted'
                  }`}
                >
                  {option.count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
