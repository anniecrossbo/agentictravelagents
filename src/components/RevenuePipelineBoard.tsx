import { Fragment } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar } from './Avatar';

type Tone = 'neutral' | 'caution' | 'danger';

const CHIP: Record<Tone, { bg: string; text: string }> = {
  neutral: { bg: 'bg-chip-neutralBg', text: 'text-chip-neutralFg' },
  caution: { bg: 'bg-chip-cautionBg', text: 'text-chip-cautionFg' },
  danger: { bg: 'bg-chip-dangerBg', text: 'text-chip-dangerFg' },
};
const NOTE: Record<Tone, string> = {
  neutral: 'text-fg-muted',
  caution: 'text-chip-cautionFg',
  danger: 'text-chip-dangerFg',
};

export type RevenueBoardCard = {
  id: string;
  /** Resolved strings. */
  name: string;
  amount: string;
  stay: string;
  chip?: { label: string; tone: Tone };
};

export type RevenueBoardColumn = {
  key: string;
  /** Resolved strings. */
  label: string;
  total: string;
  note?: { text: string; tone: Tone };
  cards: readonly RevenueBoardCard[];
};

type RevenuePipelineBoardProps = {
  columns: readonly RevenueBoardColumn[];
  onCardPress?: (cardId: string) => void;
};

/** Money-stage kanban: each column shows its total and a callout above its cards. */
export function RevenuePipelineBoard({ columns, onCardPress }: RevenuePipelineBoardProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 flex-row">
      {columns.map((col, i) => (
        <Fragment key={col.key}>
          {i > 0 && <View className="mx-2 w-px self-stretch bg-border-light" />}
          <View className="min-w-[140px] flex-1 gap-2">
            <View className="gap-0.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] font-medium text-fg">{col.label}</Text>
                <Text className="text-[9px] text-fg-muted">{col.cards.length}</Text>
              </View>
              <View className="flex-row items-baseline justify-between gap-1">
                <Text className="text-[13px] font-bold text-fg">{col.total}</Text>
                {col.note && (
                  <Text className={`shrink text-right text-[8px] ${NOTE[col.note.tone]}`} numberOfLines={1}>
                    {col.note.text}
                  </Text>
                )}
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-2">
              {col.cards.map((card) => (
                <Pressable
                  key={card.id}
                  onPress={onCardPress ? () => onCardPress(card.id) : undefined}
                  disabled={!onCardPress}
                  accessibilityRole="button"
                  accessibilityLabel={[card.name, card.amount, card.stay, card.chip?.label].filter(Boolean).join(', ')}
                  className="gap-1 rounded-sm border border-border-muted bg-surface p-2 active:opacity-80"
                >
                  <View className="flex-row items-center gap-1">
                    <Avatar name={card.name} size="sm" />
                    <Text className="flex-1 text-[10px] font-medium text-fg-alt" numberOfLines={1}>
                      {card.name}
                    </Text>
                    <Text className="text-[10px] font-bold text-fg-alt">{card.amount}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[9px] text-pipeline-label">{card.stay}</Text>
                    {card.chip && (
                      <View className={`rounded-pill px-1.5 py-0.5 ${CHIP[card.chip.tone].bg}`}>
                        <Text className={`text-[8px] font-medium ${CHIP[card.chip.tone].text}`}>{card.chip.label}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
              {col.cards.length === 0 && <Text className="py-2 text-[10px] text-fg-muted">{t('revenue.emptyList')}</Text>}
            </ScrollView>
          </View>
        </Fragment>
      ))}
    </View>
  );
}
