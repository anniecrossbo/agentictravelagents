import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LunaSignalIcon } from './LunaSignalIcon';

type ActionBannerProps = {
  /** Resolved strings. */
  title: string;
  meta?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Replaces the button once the action has been taken. */
  doneLabel?: string;
};

/** Luna-flagged item that needs a decision, with one primary action. */
export function ActionBanner({ title, meta, actionLabel, onAction, doneLabel }: ActionBannerProps) {
  const { t } = useTranslation();

  return (
    <View className="min-h-[54px] flex-row flex-wrap items-center justify-between gap-3 rounded-md bg-brand-10 px-3 py-2.5">
      <View className="shrink flex-row items-center gap-2.5">
        <LunaSignalIcon />
        <View className="shrink gap-1">
          <Text className="text-[10px] font-semibold uppercase text-brand">
            {t('agent.actionRequired')}
          </Text>
          <Text className="text-xs font-semibold text-fg">{title}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        {meta && <Text className="text-xs text-fg-muted">{meta}</Text>}
        {doneLabel ? (
          <Text className="min-w-[132px] text-center text-[11px] font-semibold text-brand">
            {doneLabel}
          </Text>
        ) : (
          actionLabel &&
          onAction && (
            <Pressable
              onPress={onAction}
              accessibilityRole="button"
              className="min-h-[34px] min-w-[132px] items-center justify-center rounded-pill bg-brand px-4 active:bg-brand-dark"
              hitSlop={{ top: 5, bottom: 5 }}
            >
              <Text className="text-[11px] font-semibold text-fg-inverse">{actionLabel}</Text>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}
