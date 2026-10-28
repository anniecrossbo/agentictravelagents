import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Tag } from './Tag';
import type { RateTag } from '../lib/room-detail';

type RateCodeCardProps = {
  code: string;
  name: string;
  /** Pre-formatted nightly price, e.g. '€285'. */
  price: string;
  /** Right-hand context line: occupancy pricing or assignment. Omitted when there's nothing to say. */
  detail?:
    | { kind: 'text'; text: string }
    | { kind: 'assigned'; prefix: string; names: string };
  tags: readonly RateTag[];
};

export function RateCodeCard({ code, name, price, detail, tags }: RateCodeCardProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2 rounded-lg bg-surface-glassStrong px-3 py-2.5">
      <View className="flex-row items-start gap-2">
        <View className="flex-1 gap-0.5">
          <Text className="text-xl font-bold text-fg" numberOfLines={1}>
            {code}
          </Text>
          <Text className="text-sm text-fg-muted" numberOfLines={1}>
            {name}
          </Text>
        </View>
        <View className="shrink items-end gap-1">
          <View className="flex-row items-center gap-1">
            <Text className="text-xl font-bold text-brand">{price}</Text>
            <Text className="text-[13px] text-fg-muted">{t('inventory.perNight')}</Text>
          </View>
          {!detail ? null : detail.kind === 'text' ? (
            <Text className="text-right text-sm text-fg-muted">{detail.text}</Text>
          ) : (
            <Text className="text-right text-sm text-fg-muted">
              {detail.prefix}
              <Text className="text-fg">{detail.names}</Text>
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Tag key={tag.labelKey} labelKey={tag.labelKey} params={tag.params} tone={tag.tone} />
        ))}
      </View>
    </View>
  );
}
