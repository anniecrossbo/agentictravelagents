import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { Badge } from './Badge';

type AgentListRowProps = {
  agencyName: string;
  agentName: string;
  activeBookings: number;
  revenue: string;
  onPress?: () => void;
};

export function AgentListRow({
  agencyName,
  agentName,
  activeBookings,
  revenue,
  onPress,
}: AgentListRowProps) {
  const { t } = useTranslation();

  const content = (
    <View className="flex-row items-center border-b border-border px-4 py-3">
      <View className="flex-1">
        <Text className="text-sm font-semibold text-fg" numberOfLines={1}>
          {agencyName}
        </Text>
        <Text className="mt-0.5 text-xs text-fg-muted" numberOfLines={1}>
          {agentName}
        </Text>
        <View className="mt-1.5 flex-row items-center gap-2">
          <Badge
            label={t('agent.activeBookings') + ': ' + activeBookings}
            variant="brand"
            size="sm"
          />
        </View>
      </View>
      <View className="ml-3 items-end">
        <Text className="text-sm font-semibold text-fg">{revenue}</Text>
        <Text className="mt-0.5 text-[10px] text-fg-muted">
          {t('agent.totalRevenue')}
        </Text>
      </View>
      {onPress && (
        <View className="ml-2">
          <ChevronRight size={16} color={tokens.color.fg.muted} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={agencyName}
        className="active:bg-surface-page"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
