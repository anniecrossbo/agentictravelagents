import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '../theme/tokens';

type StatCardProps = {
  value: string;
  labelKey: string;
  progressPercent?: number;
  progressColor?: string;
};

export function StatCard({
  value,
  labelKey,
  progressPercent,
  progressColor,
}: StatCardProps) {
  const { t } = useTranslation();
  const barColor = progressColor ?? tokens.color.brand.DEFAULT;

  return (
    <View className="rounded-2xl bg-surface p-5 shadow-sm">
      <Text className="text-[32px] font-bold leading-tight text-fg">
        {value}
      </Text>
      <Text className="mt-1 text-xs text-fg-muted">{t(labelKey)}</Text>
      {progressPercent != null && (
        <View className="mt-3 h-2 overflow-hidden rounded-pill bg-surface-track">
          <View
            className="h-full rounded-pill"
            style={{
              width: `${Math.min(Math.max(progressPercent, 0), 100)}%`,
              backgroundColor: barColor,
            }}
          />
        </View>
      )}
    </View>
  );
}
