import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

type StatRowProps = {
  labelKey: string;
  value: string;
  /** NativeWind background class for an optional legend dot, e.g. 'bg-occupancy-occupied'. */
  dotClassName?: string;
};

/** Label + figure on a translucent row; doubles as a chart legend when given a dot. */
export function StatRow({ labelKey, value, dotClassName }: StatRowProps) {
  const { t } = useTranslation();

  return (
    <View className="min-h-[28px] w-full flex-row items-center justify-between rounded-md bg-surface-glassStrong px-3 py-1">
      <View className="flex-row items-center gap-1">
        {dotClassName && <View className={`h-2 w-2 rounded-pill ${dotClassName}`} />}
        <Text className="text-xs font-semibold tracking-[0.6px] text-fg-muted">{t(labelKey)}</Text>
      </View>
      <Text className="text-base font-semibold text-fg">{value}</Text>
    </View>
  );
}
