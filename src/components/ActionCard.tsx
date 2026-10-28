import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

const SEVERITY_EDGE: Record<ActionCardProps['severity'], string> = {
  critical: 'border-danger',
  high: 'border-warning',
  medium: 'border-warning',
  low: 'border-border',
};

type ActionCardProps = {
  title: string;
  subtitle?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  primaryAction?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
};

/** A decision waiting on the user: what's wrong, why, and two ways to act. */
export function ActionCard({ title, subtitle, severity, primaryAction, secondaryAction }: ActionCardProps) {
  const { t } = useTranslation();

  return (
    <View className={`gap-2.5 rounded-md border-l-2 bg-surface px-4 py-3 ${SEVERITY_EDGE[severity]}`}>
      <View className="gap-px">
        <Text className="text-[13px] font-semibold text-fg">{t(title)}</Text>
        {subtitle && <Text className="text-[11px] text-fg-muted">{t(subtitle)}</Text>}
      </View>

      {(primaryAction || secondaryAction) && (
        <View className="flex-row gap-2">
          {primaryAction && (
            <Pressable
              onPress={primaryAction.onPress}
              accessibilityRole="button"
              accessibilityLabel={t(primaryAction.label)}
              className="min-h-[36px] flex-1 items-center justify-center rounded-md bg-brand px-2 active:bg-brand-dark"
              hitSlop={{ top: 4, bottom: 4 }}
            >
              <Text className="text-xs font-semibold text-fg-inverse" numberOfLines={1}>
                {t(primaryAction.label)}
              </Text>
            </Pressable>
          )}
          {secondaryAction && (
            <Pressable
              onPress={secondaryAction.onPress}
              accessibilityRole="button"
              accessibilityLabel={t(secondaryAction.label)}
              className="min-h-[36px] flex-1 items-center justify-center rounded-md border border-border-input px-2 active:bg-surface-page"
              hitSlop={{ top: 4, bottom: 4 }}
            >
              <Text className="text-xs font-semibold text-fg-muted" numberOfLines={1}>
                {t(secondaryAction.label)}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
