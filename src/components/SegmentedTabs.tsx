import { View, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

type Tab = {
  key: string;
  labelKey: string;
};

type SegmentedTabsProps = {
  tabs: Tab[];
  selected: string;
  onSelect: (key: string) => void;
  /** 'pill' renders fixed-width rounded segments on a translucent track. */
  variant?: 'default' | 'pill';
  /** 'pill' only: segments share the full width instead of a fixed 144pt each. */
  fill?: boolean;
};

export function SegmentedTabs({
  tabs,
  selected,
  onSelect,
  variant = 'default',
  fill = false,
}: SegmentedTabsProps) {
  const { t } = useTranslation();
  const isPill = variant === 'pill';

  return (
    <View
      className={
        isPill
          ? `flex-row rounded-pill bg-surface-page/20 p-[3px] ${fill ? 'self-stretch' : 'self-start'}`
          : 'flex-row rounded-xl bg-surface-page p-0.5'
      }
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === selected;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            accessibilityRole="tab"
            accessibilityLabel={t(tab.labelKey)}
            accessibilityState={{ selected: isActive }}
            aria-selected={isActive}
            className={`items-center justify-center ${
              isPill
                ? `min-h-[35px] rounded-pill px-3.5 py-1 ${fill ? 'flex-1' : 'w-[144px]'}`
                : 'flex-1 rounded-xl px-3 py-2'
            } ${isActive ? 'bg-surface shadow-sm' : 'bg-transparent'}`}
            hitSlop={{ top: 4, bottom: 4 }}
          >
            <Text
              className={`${isPill ? 'text-sm' : 'text-xs'} font-semibold ${
                isActive ? 'text-fg' : 'text-fg-muted'
              }`}
            >
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
