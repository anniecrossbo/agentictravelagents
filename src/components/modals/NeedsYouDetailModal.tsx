import { useState } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import type { NeedsYouSignal } from '../../lib/types';

type NeedsYouDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  signal: NeedsYouSignal;
  onOpenEntity?: () => void;
  onSnooze?: (signalId: string) => void;
  onDismiss?: (signalId: string) => void;
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[150px] flex-1 gap-1">
      <Text className="text-[10px] font-semibold uppercase text-fg-muted">{label}</Text>
      <Text className="text-sm text-fg">{value}</Text>
    </View>
  );
}

export function NeedsYouDetailModal({
  visible,
  onClose,
  signal,
  onOpenEntity,
  onSnooze,
  onDismiss,
}: NeedsYouDetailModalProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'detail' | 'snooze' | 'dismiss'>('detail');

  const close = () => {
    setMode('detail');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={close}
      title="needsYou.detailTitle"
      subtitle={t(signal.reason)}
      badge={{ label: `needsYou.severity.${signal.severity}`, variant: signal.severity === 'critical' ? 'danger' : 'warning' }}
    >
      <View className="w-[620px] max-w-full gap-5">
        {mode === 'detail' && (
          <>
            <View className="gap-2 rounded-xl bg-surface-page p-4">
              <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                {t('needsYou.evidence')}
              </Text>
              <Text className="text-sm leading-5 text-fg">{signal.evidence}</Text>
            </View>

            <View className="flex-row flex-wrap gap-4">
              <Fact label={t('needsYou.entity')} value={`${signal.entityType} · ${signal.entityId}`} />
              <Fact label={t('needsYou.rule')} value={signal.rule.replaceAll('_', ' ')} />
              <Fact label={t('needsYou.owner')} value={signal.ownerRole.replaceAll('_', ' ')} />
              <Fact label={t('needsYou.created')} value={signal.createdAt.slice(0, 16).replace('T', ' ')} />
            </View>

            <View className="gap-2 border-t border-border pt-4">
              <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                {t('needsYou.recommendedAction')}
              </Text>
              <View className="flex-row items-center gap-2">
                <Badge label={signal.recommendedAction} variant="brand" />
                <Text className="flex-1 text-xs text-fg-muted">
                  {t('needsYou.sourceNotice')}
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2 border-t border-border pt-4">
              {onOpenEntity && (
                <Button label="needsYou.openSource" onPress={onOpenEntity} />
              )}
              <Button label="needsYou.snooze" variant="secondary" onPress={() => setMode('snooze')} />
              <Button label="needsYou.dismiss" variant="ghost" onPress={() => setMode('dismiss')} />
            </View>
          </>
        )}

        {mode === 'snooze' && (
          <View className="gap-4">
            <View className="rounded-xl bg-warning-bg p-4">
              <Text className="text-sm font-semibold text-warning">{t('needsYou.snoozeTitle')}</Text>
              <Text className="mt-1 text-xs leading-5 text-warning">{t('needsYou.snoozeNotice')}</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {['2 hours', 'Tomorrow morning', '24 hours'].map((duration) => (
                <Button
                  key={duration}
                  label={duration}
                  variant="secondary"
                  onPress={() => {
                    onSnooze?.(signal.id);
                    close();
                  }}
                />
              ))}
            </View>
            <Button label="common.back" variant="ghost" onPress={() => setMode('detail')} />
          </View>
        )}

        {mode === 'dismiss' && (
          <View className="gap-4">
            <View className="rounded-xl bg-warning-bg p-4">
              <Text className="text-sm font-semibold text-warning">{t('needsYou.dismissTitle')}</Text>
              <Text className="mt-1 text-xs leading-5 text-warning">{t('needsYou.dismissNotice')}</Text>
            </View>
            <View className="flex-row gap-2">
              <Button
                label="needsYou.confirmDismiss"
                variant="danger"
                onPress={() => {
                  onDismiss?.(signal.id);
                  close();
                }}
              />
              <Button label="common.cancel" variant="secondary" onPress={() => setMode('detail')} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
