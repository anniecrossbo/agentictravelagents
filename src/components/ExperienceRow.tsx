import { View, Text, Image, type ImageSourcePropType } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import type { ExperienceCategory } from '../lib/types';

const CATEGORY_STYLE: Record<ExperienceCategory, { bg: string; text: string }> = {
  dining: { bg: 'bg-offering-diningBg', text: 'text-offering-diningFg' },
  wellness: { bg: 'bg-offering-wellnessBg', text: 'text-offering-wellnessFg' },
  activity: { bg: 'bg-offering-activityBg', text: 'text-offering-activityFg' },
  leisure: { bg: 'bg-offering-leisureBg', text: 'text-offering-leisureFg' },
};

type ExperienceRowProps = {
  name: string;
  category: ExperienceCategory;
  description: string;
  /** Resolved, e.g. 'Daily · 12:00–23:00'. */
  schedule: string;
  image?: ImageSourcePropType;
  /** Draws the hairline separating this row from the one above. */
  divider?: boolean;
};

export function ExperienceRow({ name, category, description, schedule, image, divider }: ExperienceRowProps) {
  const { t } = useTranslation();
  const style = CATEGORY_STYLE[category];

  return (
    <View className={`flex-row items-center gap-2.5 py-3 ${divider ? 'border-t border-border-subtle' : ''}`}>
      <View className="h-[60px] w-[60px] overflow-hidden rounded-md bg-surface-track">
        {image && (
          <Image
            source={image}
            resizeMode="cover"
            accessibilityLabel={t('inventory.page.experiencePhoto', { name })}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </View>
      <View className="flex-1 gap-[3px]">
        <View className="flex-row items-center gap-1.75">
          <Text className="shrink text-xs font-bold text-fg" numberOfLines={1}>
            {name}
          </Text>
          <View className={`rounded-pill px-1.75 py-0.5 ${style.bg}`}>
            <Text className={`text-[9px] ${style.text}`}>{t(`inventory.page.category.${category}`)}</Text>
          </View>
        </View>
        <Text className="text-[11px] leading-[14px] text-fg-muted" numberOfLines={1}>
          {description}
        </Text>
        <View className="flex-row items-center gap-1">
          <Clock size={10} color={tokens.color.fg.muted} />
          <Text className="text-[10px] text-fg-muted">{schedule}</Text>
        </View>
      </View>
    </View>
  );
}
