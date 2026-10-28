import { View, Text, Pressable, ScrollView, Modal as RNModal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { Badge } from './Badge';
import { Tag, type TagTone } from './Tag';

/** Header status chips on the sheet use the compact pill style from the detail designs. */
const SHEET_BADGE_TONE: Record<NonNullable<ModalProps['badge']>['variant'] & string, TagTone> = {
  brand: 'brand',
  positive: 'positive',
  warning: 'caution',
  danger: 'danger',
  neutral: 'muted',
  vip: 'vip',
};

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'brand' | 'positive' | 'warning' | 'danger' | 'neutral' | 'vip';
  };
  children: React.ReactNode;
  /**
   * 'sheet' is the large detail layout: page-tinted card, prominent title,
   * round close button, and a body the caller lays out and scrolls itself.
   */
  variant?: 'default' | 'sheet';
  /** Extra round buttons shown before the close button ('sheet' only). */
  headerActions?: React.ReactNode;
};

export function Modal({
  visible,
  onClose,
  title,
  subtitle,
  badge,
  children,
  variant = 'default',
  headerActions,
}: ModalProps) {
  const { t } = useTranslation();

  if (variant === 'sheet') {
    return (
      <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View
          className="flex-1 items-center justify-center p-4"
          style={{ backgroundColor: tokens.color.scrim }}
        >
          <View className="max-h-full w-[1200px] max-w-full gap-4.5 overflow-hidden rounded-4xl bg-surface-page px-6 py-5 shadow-xl md:px-10 md:py-8">
            <View className="flex-row items-center gap-3">
              <View className="flex-1 gap-0.5">
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-[22px] font-semibold text-fg">{t(title)}</Text>
                  {badge && (
                    <Tag
                      labelKey={badge.label}
                      tone={SHEET_BADGE_TONE[badge.variant ?? 'neutral']}
                      shape="pill"
                    />
                  )}
                </View>
                {subtitle && <Text className="text-sm text-fg-muted">{t(subtitle)}</Text>}
              </View>
              {headerActions}
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                className="h-9 w-9 items-center justify-center rounded-pill bg-surface-track active:opacity-70"
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <X size={18} color={tokens.color.fg.muted} />
              </Pressable>
            </View>
            <View className="shrink">{children}</View>
          </View>
        </View>
      </RNModal>
    );
  }

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 items-center justify-center p-4"
        style={{ backgroundColor: tokens.color.scrim }}
      >
        <View className="max-h-full overflow-hidden rounded-2xl bg-surface shadow-xl">
          {/* Header */}
          <View className="flex-row items-start gap-3 border-b border-border px-5 py-4">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-semibold text-fg">{t(title)}</Text>
                {badge && <Badge label={badge.label} variant={badge.variant} size="md" />}
              </View>
              {subtitle && (
                <Text className="mt-0.5 text-sm text-fg-muted">{t(subtitle)}</Text>
              )}
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              className="rounded-sm p-2 active:bg-surface-page"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={tokens.color.fg.muted} />
            </Pressable>
          </View>

          {/* Body — shrinks within the modal's max height rather than filling it */}
          <ScrollView className="shrink" contentContainerClassName="p-5">
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}
