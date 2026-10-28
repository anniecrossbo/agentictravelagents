import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { timeOfDay, type Briefing, type BriefingStatement } from '../../lib/ai-briefing';
import type { NeedsYouSeverity } from '../../lib/types';

type AIBriefingModalProps = {
  visible: boolean;
  onClose: () => void;
  briefing: Briefing;
  userName: string;
  hour: number;
  refreshedMinutesAgo: number;
  onOpenSource?: (statement: BriefingStatement) => void;
};

const SEVERITY_VARIANT: Record<NeedsYouSeverity, 'danger' | 'warning' | 'brand' | 'neutral'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'brand',
  low: 'neutral',
};

export function AIBriefingModal({
  visible,
  onClose,
  briefing,
  userName,
  hour,
  refreshedMinutesAgo,
  onOpenSource,
}: AIBriefingModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="aiBriefing.title"
      subtitle={t('aiBriefing.greeting', {
        timeOfDay: t(`aiBriefing.timeOfDay.${timeOfDay(hour)}`),
        name: userName,
      })}
    >
      <View className="w-[620px] max-w-full gap-4">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text className="text-xs text-fg-muted">
            {t('aiBriefing.businessDate', { date: briefing.businessDate })}
          </Text>
          <Text className="text-xs text-fg-muted">·</Text>
          <Text className="text-xs text-fg-muted">
            {t('aiBriefing.freshness', { minutes: refreshedMinutesAgo })}
          </Text>
        </View>

        {/* §9.2 — the workspace stays usable when generation fails */}
        {!briefing.generated && (
          <View className="gap-1 rounded-lg bg-warning-bg p-3">
            <Text className="text-xs font-semibold text-warning">
              {t('aiBriefing.unavailable')}
            </Text>
            <Text className="text-xs text-warning">{t('aiBriefing.fallback')}</Text>
          </View>
        )}

        {briefing.total === 0 ? (
          <Text className="py-6 text-center text-sm text-fg-muted">
            {t('aiBriefing.noSignals')}
          </Text>
        ) : briefing.generated ? (
          <View className="gap-3">
            <Text className="text-sm text-fg">{t('aiBriefing.summary')}</Text>
            {briefing.statements.map((s) => (
              <View key={s.id} className="gap-2 rounded-xl border border-border p-3">
                <View className="flex-row items-start gap-2">
                  <Badge
                    label={`aiBriefing.severity.${s.severity}`}
                    variant={SEVERITY_VARIANT[s.severity]}
                  />
                  <Text className="flex-1 text-sm text-fg">
                    {t(s.labelKey, { ...s.params, reason: t(String(s.params.reason)) })}
                  </Text>
                </View>
                <Text className="text-xs text-fg-muted">
                  {t('aiBriefing.recommended')}: {t(s.recommendedAction)}
                </Text>
                {/* §9.2 — every statement links to its source context */}
                <Pressable
                  onPress={() => onOpenSource?.(s)}
                  accessibilityRole="button"
                  accessibilityLabel={t('aiBriefing.openSource')}
                  className="flex-row items-center gap-1.5 self-start active:opacity-70"
                  hitSlop={{ top: 6, bottom: 6 }}
                >
                  <Text className="text-xs font-semibold text-brand">
                    {t('aiBriefing.openSource')}
                  </Text>
                  <Text className="text-[10px] text-fg-muted">
                    {s.source.entityType} · {s.source.entityId}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          /* Deterministic fallback */
          <View className="gap-2">
            <Text className="text-[10px] font-semibold uppercase text-fg-muted">
              {t('aiBriefing.priorityList')}
            </Text>
            {briefing.priority.map((p) => (
              <View
                key={p.severity}
                className="flex-row items-center justify-between rounded-lg border border-border px-3 py-2.5"
              >
                <Badge
                  label={`aiBriefing.severity.${p.severity}`}
                  variant={SEVERITY_VARIANT[p.severity]}
                />
                <Text className="text-sm font-semibold text-fg">{p.count}</Text>
              </View>
            ))}
          </View>
        )}

        {briefing.withheld > 0 && (
          <Text className="text-xs text-fg-muted">
            {t('aiBriefing.withheld', { count: briefing.withheld })}
          </Text>
        )}

        {/* §9.2 — AI may not change any record */}
        <Text className="border-t border-border pt-3 text-xs text-fg-muted">
          {t('aiBriefing.boundaryNotice')}
        </Text>

        <View className="flex-row gap-2">
          <Button label="common.close" variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
