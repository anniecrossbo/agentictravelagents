import { View, Text } from 'react-native';

type EmptyCardProps = {
  /** Resolved strings. */
  title: string;
  body?: string;
};

/** Dashed placeholder for a list with nothing in it yet. */
export function EmptyCard({ title, body }: EmptyCardProps) {
  return (
    <View className="items-center gap-1.5 rounded-md border border-dashed border-border-input bg-surface px-6 py-10">
      <Text className="text-center text-[13px] font-semibold text-fg">{title}</Text>
      {body && <Text className="text-center text-[11px] text-fg-muted">{body}</Text>}
    </View>
  );
}
