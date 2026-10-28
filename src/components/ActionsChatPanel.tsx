import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

export type PanelTab = 'actions' | 'chat';

type ActionsChatPanelProps = {
  actionCount: number;
  chatCount: number;
  /** Decision cards for the Actions tab. */
  actions: React.ReactNode;
  /** Content of the second tab: an embedded ChatPanel, or e.g. a bookings list. */
  chat: React.ReactNode;
  /** Label for the second tab; defaults to Chat. */
  secondTabLabelKey?: string;
  defaultTab?: PanelTab;
  /** Control the open tab from outside, e.g. a "view all" link elsewhere. */
  tab?: PanelTab;
  onTabChange?: (tab: PanelTab) => void;
};

/** Left-rail panel: things needing a decision, and conversations, one tap apart. */
export function ActionsChatPanel({
  actionCount,
  chatCount,
  actions,
  chat,
  secondTabLabelKey = 'home.chatTab',
  defaultTab = 'actions',
  tab: controlledTab,
  onTabChange,
}: ActionsChatPanelProps) {
  const { t } = useTranslation();
  const [ownTab, setOwnTab] = useState<PanelTab>(defaultTab);
  const tab = controlledTab ?? ownTab;
  const setTab = (next: PanelTab) => {
    setOwnTab(next);
    onTabChange?.(next);
  };
  const tabs: { key: PanelTab; labelKey: string; count: number }[] = [
    { key: 'actions', labelKey: 'home.actionsTab', count: actionCount },
    { key: 'chat', labelKey: secondTabLabelKey, count: chatCount },
  ];

  return (
    <View className="flex-1 gap-4">
      <View className="flex-row rounded-notch bg-surface-page p-[3px]" accessibilityRole="tablist">
        {tabs.map((tb) => {
          const active = tb.key === tab;
          return (
            <Pressable
              key={tb.key}
              onPress={() => setTab(tb.key)}
              accessibilityRole="tab"
              accessibilityLabel={t(tb.labelKey)}
              accessibilityState={{ selected: active }}
              className={`min-h-[43px] flex-1 flex-row items-center justify-center gap-2 rounded-notch px-3.5 ${
                active ? 'bg-surface shadow-sm' : ''
              }`}
            >
              <Text className={`text-sm font-semibold ${active ? 'text-fg' : 'text-fg-muted'}`}>
                {t(tb.labelKey)}
              </Text>
              <View className="min-w-5 items-center rounded-pill bg-warning-bg px-1.5 py-0.5">
                <Text className="text-xs font-bold text-warning">{tb.count}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View className="h-px w-full bg-border" />

      {tab === 'actions' ? (
        <ScrollView className="flex-1" contentContainerClassName="gap-4">
          {actionCount > 0 ? (
            actions
          ) : (
            <Text className="py-6 text-center text-xs text-fg-muted">{t('home.noActions')}</Text>
          )}
        </ScrollView>
      ) : (
        <View className="flex-1">{chat}</View>
      )}
    </View>
  );
}
