import { View, Text } from 'react-native';

const TONE_STYLES = {
  brand: { bg: 'bg-brand-10', dot: 'bg-brand', title: 'text-fg' },
  caution: { bg: 'bg-chip-cautionBg', dot: 'bg-chip-cautionFg', title: 'text-chip-cautionFg' },
} as const;

type InfoBannerProps = {
  /** Resolved strings. */
  title: string;
  body?: string;
  tone?: keyof typeof TONE_STYLES;
};

/** One-line notice with a status dot; optional second line of detail. */
export function InfoBanner({ title, body, tone = 'brand' }: InfoBannerProps) {
  const style = TONE_STYLES[tone];
  return (
    <View className={`flex-row items-start gap-2.5 rounded-md px-3 py-2.5 ${style.bg}`}>
      <View className={`mt-1.5 h-1.5 w-1.5 rounded-pill ${style.dot}`} />
      <View className="flex-1 gap-0.5">
        <Text className={`text-[11px] ${body ? 'font-semibold' : ''} ${style.title}`}>{title}</Text>
        {body && <Text className="text-[10px] text-fg">{body}</Text>}
      </View>
    </View>
  );
}
