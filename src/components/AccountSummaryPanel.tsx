import { View, Text, Pressable, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mail, Phone } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { RevenueStatCard } from './RevenueStatCard';

type AccountSummaryPanelProps = {
  email: string;
  phone: string;
  /** Resolved strings, one card per reporting period. */
  revenue: readonly { key: string; period: string; bookings: string; amount: string }[];
};

/** Contact details and revenue-by-period for an agent or agency account. */
export function AccountSummaryPanel({ email, phone, revenue }: AccountSummaryPanelProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-4">
      <View className="gap-1.25">
        <Pressable
          onPress={() => Linking.openURL(`mailto:${email}`)}
          accessibilityRole="link"
          accessibilityLabel={t('agent.profile.emailLabel', { email })}
          hitSlop={{ top: 12, bottom: 4 }}
          className="flex-row items-center gap-1.25"
        >
          <Mail size={16} color={tokens.color.brand.DEFAULT} />
          <Text className="flex-1 text-xs font-semibold text-fg" numberOfLines={1}>
            {email}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL(`tel:${phone}`)}
          accessibilityRole="link"
          accessibilityLabel={t('agent.profile.phoneLabel', { phone })}
          hitSlop={{ top: 4, bottom: 12 }}
          className="flex-row items-center gap-1"
        >
          <Phone size={16} color={tokens.color.brand.DEFAULT} />
          <Text className="text-xs text-fg-muted">{phone}</Text>
        </Pressable>
      </View>

      <View className="h-px w-full bg-surface" />

      <View className="gap-2">
        {revenue.map((r) => (
          <RevenueStatCard key={r.key} period={r.period} bookings={r.bookings} amount={r.amount} />
        ))}
      </View>
    </View>
  );
}
