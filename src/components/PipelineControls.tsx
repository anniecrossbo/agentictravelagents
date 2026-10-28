import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

type PipelineControlsProps = {
  /** Resolved name of the current agency filter, e.g. 'All agencies'. */
  agencyLabel: string;
  onCycleAgency: () => void;
  /** Resolved, e.g. 'Week 39 · 21–27 Sep'. */
  weekLabel: string;
};

/** Source filter and week label shown in pipeline widget headers. */
export function PipelineControls({ agencyLabel, onCycleAgency, weekLabel }: PipelineControlsProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row gap-1.5">
      <Pressable
        onPress={onCycleAgency}
        accessibilityRole="button"
        accessibilityLabel={t('pipeline.agencyFilter', { agency: agencyLabel })}
        className="min-h-[36px] flex-row items-center gap-1.5 rounded-pill border border-border-input bg-surface px-3 active:bg-surface-page"
      >
        <Text className="text-xs font-semibold text-fg-secondary" numberOfLines={1}>
          {agencyLabel}
        </Text>
        <ChevronDown size={12} color={tokens.color.fg.muted} />
      </Pressable>
      {/* PROTO: the pipeline isn't week-scoped yet; the pill names the current week only */}
      <View className="min-h-[36px] flex-row items-center gap-1.5 rounded-pill border border-border-input bg-surface px-3">
        <Text className="text-xs font-semibold text-fg-secondary">{weekLabel}</Text>
        <ChevronDown size={12} color={tokens.color.fg.muted} />
      </View>
    </View>
  );
}
