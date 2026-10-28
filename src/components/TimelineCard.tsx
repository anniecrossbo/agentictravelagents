import { View, Text } from 'react-native';

type TimelineItem = {
  key: string;
  kind: 'done' | 'next';
  /** Resolved strings. */
  title: string;
  detail?: string;
};

type TimelineCardProps = {
  items: readonly TimelineItem[];
};

/** Vertical history: filled dots for completed steps, a hollow dot for what's next. */
export function TimelineCard({ items }: TimelineCardProps) {
  return (
    <View className="rounded-md bg-surface px-4 py-4">
      {items.map((item, i) => {
        const isNext = item.kind === 'next';
        const isLast = i === items.length - 1;
        return (
          <View key={item.key} className="flex-row gap-3">
            <View className="w-2.5 items-center">
              <View
                className={`mt-1 h-2.5 w-2.5 rounded-pill ${
                  isNext ? 'border border-border-input bg-surface' : 'bg-brand'
                }`}
              />
              {!isLast && <View className="w-px flex-1 bg-border-input" />}
            </View>
            <View className={`flex-1 gap-0.5 ${isLast ? '' : 'pb-4'}`}>
              <Text className={`text-xs font-semibold ${isNext ? 'text-fg-muted' : 'text-fg'}`}>
                {item.title}
              </Text>
              {item.detail && <Text className="text-[10px] text-fg-muted">{item.detail}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}
