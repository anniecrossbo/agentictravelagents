import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { Tag, type TagTone } from './Tag';

type ListRowChip = {
  labelKey: string;
  params?: Record<string, string | number>;
  tone: TagTone;
};

type ListRowCardProps = {
  /** Resolved strings. */
  title: string;
  subtitle: string;
  chips: readonly ListRowChip[];
  value: string;
  valueSuffix?: string;
  /** Greys the value, e.g. a sold-out price. */
  valueMuted?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
};

/** Directory-style row: identity, status chips, a headline value and an open affordance. */
export function ListRowCard({
  title,
  subtitle,
  chips,
  value,
  valueSuffix,
  valueMuted,
  onPress,
  accessibilityLabel,
}: ListRowCardProps) {
  const valueClass = valueMuted ? 'text-fg-muted' : 'text-brand-dark';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="min-h-[52px] flex-row items-center gap-3 rounded-md border border-border-subtle bg-surface-glassStrong px-6 py-2.5 active:opacity-80"
    >
      <View className="w-[190px] gap-1">
        <Text className="text-[13px] font-semibold text-fg" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-[11px] text-fg-muted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View className="w-[200px] flex-row gap-1.5">
        {chips.map((chip) => (
          <Tag key={chip.labelKey} labelKey={chip.labelKey} params={chip.params} tone={chip.tone} shape="chip" />
        ))}
      </View>

      <View className="flex-1 flex-row items-baseline gap-1">
        <Text className={`text-sm font-semibold ${valueClass}`}>{value}</Text>
        {valueSuffix && <Text className={`text-[10px] font-semibold ${valueClass}`}>{valueSuffix}</Text>}
      </View>

      <View className="h-8 w-8 items-center justify-center rounded-pill bg-surface-search">
        <ChevronRight size={16} color={tokens.color.brand.DEFAULT} />
      </View>
    </Pressable>
  );
}
