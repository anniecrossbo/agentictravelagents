import { View, Text } from 'react-native';
import { Tag } from './Tag';
import type { DocumentTag } from '../lib/agent-profile';

type DocumentCardProps = {
  title: string;
  /** Resolved, e.g. 'trade-license.pdf · Uploaded 12 Jan 2026'. */
  fileLine: string;
  status: DocumentTag;
  tags: readonly DocumentTag[];
};

export function DocumentCard({ title, fileLine, status, tags }: DocumentCardProps) {
  return (
    <View className="gap-3 rounded-lg bg-surface-glassStrong p-3">
      <View className="flex-row items-start gap-2">
        <View className="flex-1 gap-1">
          <Text className="text-base font-bold text-fg" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-sm text-fg-muted" numberOfLines={1}>
            {fileLine}
          </Text>
        </View>
        <Tag labelKey={status.labelKey} params={status.params} tone={status.tone} />
      </View>
      <View className="flex-row flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Tag key={tag.labelKey} labelKey={tag.labelKey} params={tag.params} tone={tag.tone} />
        ))}
      </View>
    </View>
  );
}
