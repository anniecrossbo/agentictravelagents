import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RefreshCw, CircleUserRound } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

type TopNotchBarProps = {
  refreshedMinutesAgo: number;
  businessDate: string;
  userName: string;
  onRefresh?: () => void;
  onProfilePress?: () => void;
};

/** minHeight rather than a fixed height: the pill holds the design's 38pt at
 *  default text size but still grows when the OS font scale increases. */
const pillHeight = { minHeight: tokens.size.notchPill };

const PILL_BASE = 'flex-row items-center justify-center rounded-pill';

export function TopNotchBar({
  refreshedMinutesAgo,
  businessDate,
  userName,
  onRefresh,
  onProfilePress,
}: TopNotchBarProps) {
  const { t } = useTranslation();

  const RefreshPill = onRefresh ? Pressable : View;
  const UserPill = onProfilePress ? Pressable : View;

  return (
    <View className="items-center px-4 pt-2">
      <View className="flex-row items-center gap-2.25 rounded-notch bg-surface p-2">
        {/* Freshness */}
        <RefreshPill
          {...(onRefresh
            ? {
                onPress: onRefresh,
                accessibilityRole: 'button' as const,
                accessibilityLabel: t('common.refresh'),
                hitSlop: { top: 6, bottom: 6, left: 6, right: 6 },
              }
            : {})}
          className={`${PILL_BASE} gap-2.25 bg-positive-bg px-3`}
          style={pillHeight}
        >
          <RefreshCw
            size={tokens.size.notchIcon}
            color={tokens.color.brand.DEFAULT}
          />
          <Text className="text-sm font-medium leading-tight text-fg">
            {t('common.refreshedAgo', { minutes: refreshedMinutesAgo })}
          </Text>
        </RefreshPill>

        {/* Business date */}
        <View
          className={`${PILL_BASE} bg-surface-page px-3`}
          style={pillHeight}
        >
          <Text className="text-sm font-medium leading-tight text-fg">
            {businessDate}
          </Text>
        </View>

        {/* User */}
        <UserPill
          {...(onProfilePress
            ? {
                onPress: onProfilePress,
                accessibilityRole: 'button' as const,
                accessibilityLabel: userName,
                hitSlop: { top: 6, bottom: 6, left: 6, right: 6 },
              }
            : {})}
          className={`${PILL_BASE} gap-2.25 bg-surface-page pl-3 pr-1.5`}
          style={pillHeight}
        >
          <Text className="text-sm font-medium leading-tight text-fg">
            {userName}
          </Text>
          <CircleUserRound
            size={tokens.size.notchAvatar}
            color={tokens.color.brand.nav}
          />
        </UserPill>
      </View>
    </View>
  );
}
