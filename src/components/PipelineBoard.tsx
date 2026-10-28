import { Fragment } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '../theme/tokens';
import type { PipelineChipTone } from '../lib/booking-view';

export type PipelineItem = {
  id: string;
  name: string;
  /** Pre-formatted stay range, e.g. '12–16 Oct'. */
  stay: string;
  nights: number;
  /** Pre-formatted compact value, e.g. '$3.2k'. */
  amount: string;
  avatarLabel: string;
  avatarColor?: string;
  chip?: { labelKey: string; tone: PipelineChipTone };
};

export type PipelineColumn = {
  key: string;
  labelKey: string;
  count: number;
  items: PipelineItem[];
};

type PipelineBoardProps = {
  columns: PipelineColumn[];
  onItemPress?: (item: PipelineItem) => void;
};

/** Columns share the width, never narrower than this; the board scrolls sideways past that. */
const MIN_COLUMN_WIDTH = 118;

const CHIP_STYLE: Record<PipelineChipTone, { bg: string; text: string }> = {
  neutral: { bg: 'bg-chip-neutralBg', text: 'text-chip-neutralFg' },
  caution: { bg: 'bg-chip-cautionBg', text: 'text-chip-cautionFg' },
  positive: { bg: 'bg-chip-positiveBg', text: 'text-chip-positiveFg' },
  danger: { bg: 'bg-chip-dangerBg', text: 'text-chip-dangerFg' },
};

function PipelineCard({
  item,
  onPress,
}: {
  item: PipelineItem;
  onPress?: (item: PipelineItem) => void;
}) {
  const { t } = useTranslation();
  const stay = t('pipeline.stay', { range: item.stay, nights: item.nights });
  const chipStyle = item.chip ? CHIP_STYLE[item.chip.tone] : undefined;

  return (
    <Pressable
      onPress={onPress ? () => onPress(item) : undefined}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={t('pipeline.cardLabel', {
        name: item.name,
        stay: t('pipeline.stayLabel', { range: item.stay, count: item.nights }),
        amount: item.amount,
        status: item.chip ? t(item.chip.labelKey) : '',
      })}
      className="gap-[3px] rounded-sm border border-border-muted bg-surface p-2 active:opacity-80"
    >
      <View className="flex-row items-center gap-1">
        <View
          className="h-4 w-4 items-center justify-center rounded-pill"
          style={{ backgroundColor: item.avatarColor ?? tokens.color.avatar.brown }}
        >
          <Text className="text-[7px] font-bold text-fg-inverse">{item.avatarLabel}</Text>
        </View>
        <Text className="flex-1 text-[10px] font-medium text-fg-alt" numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      <Text className="text-[9px] text-pipeline-label" numberOfLines={1}>
        {stay}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] font-bold text-fg-alt">{item.amount}</Text>
        {item.chip && chipStyle && (
          <View className={`rounded-pill px-1.5 py-0.5 ${chipStyle.bg}`}>
            <Text className={`text-[8px] font-medium ${chipStyle.text}`}>{t(item.chip.labelKey)}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export function PipelineBoard({ columns, onItemPress }: PipelineBoardProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="min-w-full flex-row"
    >
      {columns.map((column, i) => (
        <Fragment key={column.key}>
          {i > 0 && <View className="mx-2 w-px self-stretch bg-border-light" />}
          <View className="flex-1 gap-2" style={{ minWidth: MIN_COLUMN_WIDTH }}>
            <View className="flex-row items-center gap-1.5">
              <Text className="flex-1 text-[10px] font-medium text-fg" numberOfLines={1}>
                {t(column.labelKey)}
              </Text>
              <View className="rounded-xs bg-border-light px-1.5 py-0.5">
                <Text className="text-[9px] font-medium text-pipeline-label">{column.count}</Text>
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-2">
              {column.items.map((item) => (
                <PipelineCard key={item.id} item={item} onPress={onItemPress} />
              ))}
            </ScrollView>
          </View>
        </Fragment>
      ))}
    </ScrollView>
  );
}
