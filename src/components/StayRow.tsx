import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DayLabel } from '../lib/dates';

type StayRowProps = {
  name: string;
  /** Secondary line, e.g. 'Sea View Suite • via Sakura Travel'. */
  detail: string;
  initials: string;
  day: DayLabel;
  onPress?: () => void;
};

const DAY_KEY: Record<'today' | 'tomorrow', string> = {
  today: 'common.today',
  tomorrow: 'common.tomorrow',
};

export function StayRow({ name, detail, initials, day, onPress }: StayRowProps) {
  const { t } = useTranslation();
  const isToday = day.kind === 'today';
  const label = day.kind === 'date' ? day.text : t(DAY_KEY[day.kind]);

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      {...(onPress
        ? { onPress, accessibilityRole: 'button' as const, accessibilityLabel: name }
        : {})}
      className="flex-row items-center gap-2.5"
    >
      <View className="h-8 w-8 items-center justify-center rounded-pill bg-brand-light">
        <Text className="text-[11px] font-bold text-brand">{initials}</Text>
      </View>

      <View className="flex-1 gap-px">
        <Text className="text-xs font-semibold text-fg" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-[10px] text-fg-muted" numberOfLines={1}>
          {detail}
        </Text>
      </View>

      <View className={`rounded-pill px-2.5 py-1 ${isToday ? 'bg-positive-bg' : 'bg-brand-light'}`}>
        <Text className={`text-[10px] font-semibold ${isToday ? 'text-positive' : 'text-brand'}`}>
          {label}
        </Text>
      </View>
    </Wrapper>
  );
}
