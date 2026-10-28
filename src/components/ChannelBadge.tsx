import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mail, MessageCircle, MessageSquare, type LucideIcon } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import type { MessageChannel } from '../lib/types';

export const CHANNEL_STYLE: Record<
  MessageChannel,
  { icon: LucideIcon; bg: string; text: string; color: string; labelKey: string }
> = {
  chat: {
    icon: MessageSquare,
    bg: 'bg-channel-chatBg',
    text: 'text-channel-chatFg',
    color: tokens.color.channel.chatFg,
    labelKey: 'communication.channel.chat',
  },
  whatsapp: {
    icon: MessageCircle,
    bg: 'bg-channel-whatsappBg',
    text: 'text-channel-whatsappFg',
    color: tokens.color.channel.whatsappFg,
    labelKey: 'communication.channel.whatsapp',
  },
  email: {
    icon: Mail,
    bg: 'bg-channel-emailBg',
    text: 'text-channel-emailFg',
    color: tokens.color.channel.emailFg,
    labelKey: 'communication.channel.email',
  },
};

type ChannelBadgeProps = {
  channel: MessageChannel;
  /** 'chip' shows icon + name; 'icon' is a small tinted disc for tight rows. */
  variant?: 'chip' | 'icon';
};

/** How a message travelled: Chat, WhatsApp or Email. */
export function ChannelBadge({ channel, variant = 'chip' }: ChannelBadgeProps) {
  const { t } = useTranslation();
  const style = CHANNEL_STYLE[channel];
  const Icon = style.icon;
  const label = t(style.labelKey);

  if (variant === 'icon') {
    return (
      <View
        className={`h-4.5 w-4.5 items-center justify-center rounded-pill ${style.bg}`}
        accessible
        accessibilityLabel={label}
      >
        <Icon size={10} color={style.color} />
      </View>
    );
  }

  return (
    <View
      className={`flex-row items-center gap-1 self-start rounded-pill px-2 py-0.5 ${style.bg}`}
      accessible
      accessibilityLabel={t('communication.viaChannel', { channel: label })}
    >
      <Icon size={11} color={style.color} />
      <Text className={`text-[10px] font-semibold ${style.text}`}>{label}</Text>
    </View>
  );
}
