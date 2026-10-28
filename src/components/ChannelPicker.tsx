import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CHANNEL_STYLE } from './ChannelBadge';
import type { MessageChannel } from '../lib/types';

const ALL_CHANNELS: readonly MessageChannel[] = ['chat', 'whatsapp', 'email'];

type ChannelPickerProps = {
  value: MessageChannel;
  onChange: (channel: MessageChannel) => void;
  channels?: readonly MessageChannel[];
  /** Icon-only chips (names stay as accessibility labels), for narrow panels. */
  compact?: boolean;
};

/** "Reply via" selector: one tappable chip per channel. */
export function ChannelPicker({
  value,
  onChange,
  channels = ALL_CHANNELS,
  compact = false,
}: ChannelPickerProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row flex-wrap items-center gap-1.5" accessibilityRole="radiogroup">
      <Text className="text-[10px] font-semibold text-fg-muted">{t('communication.replyVia')}</Text>
      {channels.map((ch) => {
        const style = CHANNEL_STYLE[ch];
        const Icon = style.icon;
        const selected = ch === value;
        return (
          <Pressable
            key={ch}
            onPress={() => onChange(ch)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t(style.labelKey)}
            hitSlop={{ top: 10, bottom: 10, left: 2, right: 2 }}
            className={`flex-row items-center gap-1 rounded-pill border px-2 py-1 ${
              selected ? `border-transparent ${style.bg}` : 'border-border-input bg-surface'
            }`}
          >
            <Icon size={11} color={style.color} />
            {(!compact || selected) && (
              <Text className={`text-[10px] font-semibold ${selected ? style.text : 'text-fg-muted'}`}>
                {t(style.labelKey)}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
