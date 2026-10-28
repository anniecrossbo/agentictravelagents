import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const TONE_STYLES = {
  neutral: { bg: 'bg-chip-neutralBg', text: 'text-chip-neutralFg' },
  surface: { bg: 'bg-surface', text: 'text-chip-neutralFg' },
  danger: { bg: 'bg-chip-dangerBg', text: 'text-chip-dangerFg' },
  info: { bg: 'bg-chip-infoBg', text: 'text-chip-infoFg' },
  caution: { bg: 'bg-chip-cautionBg', text: 'text-chip-cautionFg' },
  positive: { bg: 'bg-chip-positiveBg', text: 'text-chip-positiveFg' },
  muted: { bg: 'bg-surface-track', text: 'text-fg-muted' },
  brand: { bg: 'bg-brand-light', text: 'text-brand' },
  vip: { bg: 'bg-warning-vipBg', text: 'text-warning-vip' },
} as const;

const SHAPE_STYLES = {
  square: { container: 'rounded-sm px-2 py-1.75', text: 'text-xs' },
  pill: { container: 'rounded-pill px-2.25 py-0.5', text: 'text-[11px]' },
  chip: { container: 'rounded-pill px-3 py-2', text: 'text-[11px]' },
} as const;

export type TagTone = keyof typeof TONE_STYLES;

type TagProps = {
  labelKey: string;
  params?: Record<string, string | number>;
  tone?: TagTone;
  /** 'pill' is the compact status chip used in summaries and headers. */
  shape?: keyof typeof SHAPE_STYLES;
};

/** Square-cornered attribute chip — amenities, rate-code flags. Not a status. */
export function Tag({ labelKey, params, tone = 'neutral', shape = 'square' }: TagProps) {
  const { t } = useTranslation();
  const style = TONE_STYLES[tone];
  const shapeStyle = SHAPE_STYLES[shape];

  return (
    <View className={`self-start ${shapeStyle.container} ${style.bg}`}>
      <Text className={`${shapeStyle.text} font-medium ${style.text}`}>{t(labelKey, params)}</Text>
    </View>
  );
}
