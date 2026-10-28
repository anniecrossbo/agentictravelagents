import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LunaSignalIcon } from './LunaSignalIcon';
import { ChannelBadge } from './ChannelBadge';
import { shortDateTime } from '../lib/dates';
import type { SummaryView } from '../lib/conversation-view';

type AiSummaryCardProps = {
  view: SummaryView;
  /** 'compact' drops the key points, for narrow panels. */
  size?: 'regular' | 'compact';
};

/** Luna's digest of a conversation, or a rule-based digest when AI has none. */
export function AiSummaryCard({ view, size = 'regular' }: AiSummaryCardProps) {
  const { t } = useTranslation();
  const isCompact = size === 'compact';
  const channelNames = view.channels.map((c) => t(`communication.channel.${c}`)).join(', ');

  return (
    <View className={`gap-2 rounded-md bg-brand-10 ${isCompact ? 'p-2.5' : 'px-4 py-3.5'}`}>
      <View className="flex-row items-center gap-2">
        <LunaSignalIcon size={isCompact ? 20 : 24} />
        <Text className="flex-1 text-[11px] font-semibold uppercase text-brand">
          {t(view.kind === 'ai' ? 'communication.aiSummary.title' : 'communication.aiSummary.fallbackTitle')}
        </Text>
        <View
          className="flex-row gap-1"
          accessible
          accessibilityLabel={t('communication.aiSummary.channelList', { channels: channelNames })}
        >
          {view.channels.map((c) => (
            <ChannelBadge key={c} channel={c} variant="icon" />
          ))}
        </View>
      </View>

      {view.kind === 'ai' ? (
        <>
          <Text className={`${isCompact ? 'text-[11px]' : 'text-xs'} leading-[17px] text-fg`}>
            {view.summary}
          </Text>
          {!isCompact && view.keyPoints.length > 0 && (
            <View className="gap-1">
              {view.keyPoints.map((point) => (
                <View key={point} className="flex-row items-start gap-2">
                  <View className="mt-1.5 h-1 w-1 rounded-pill bg-brand" />
                  <Text className="flex-1 text-[11px] text-fg">{point}</Text>
                </View>
              ))}
            </View>
          )}
          {view.suggestedNextStep && (
            <Text className="text-[11px] text-fg">
              <Text className="font-semibold text-brand">{t('communication.aiSummary.nextStep')}: </Text>
              {view.suggestedNextStep}
            </Text>
          )}
          <Text className="text-[10px] text-fg-muted">
            {view.isStale
              ? t('communication.aiSummary.stale')
              : t('communication.aiSummary.generated', { date: shortDateTime(view.generatedAt) })}
          </Text>
        </>
      ) : (
        <>
          <Text className="text-[11px] text-fg">
            {t('communication.aiSummary.fallbackBody', {
              count: view.messageCount,
              channels: channelNames,
            })}
          </Text>
          {view.lastAt && (
            <Text className="text-[11px] text-fg">
              {t(
                view.lastFrom === 'hotel'
                  ? 'communication.aiSummary.lastFromHotel'
                  : 'communication.aiSummary.lastFromCounterpart',
                { date: shortDateTime(view.lastAt) },
              )}
            </Text>
          )}
          <Text className="text-[10px] text-fg-muted">{t('communication.aiSummary.fallbackNote')}</Text>
        </>
      )}
    </View>
  );
}
