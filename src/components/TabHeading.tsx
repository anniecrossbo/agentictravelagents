import { View, Text } from 'react-native';

type TabHeadingProps = {
  /** Resolved strings. */
  title: string;
  subtitle?: string;
  /** Optional control on the right, e.g. an upload button. */
  action?: React.ReactNode;
};

export function TabHeading({ title, subtitle, action }: TabHeadingProps) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1 gap-1">
        <Text className="text-lg font-semibold text-fg">{title}</Text>
        {subtitle && <Text className="text-xs text-fg-muted">{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}
