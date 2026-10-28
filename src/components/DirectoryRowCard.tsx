import { useTranslation } from 'react-i18next';
import { ListRowCard } from './ListRowCard';

type DirectoryRowCardProps = {
  name: string;
  /** Primary contact, or a role line for independents. */
  subtitle: string;
  activeBookings: number;
  inactiveBookings: number;
  /** Pre-formatted revenue, e.g. '$18,450'. */
  revenue: string;
  onPress: () => void;
};

/** One agency (or independent agent) in the Agents directory. */
export function DirectoryRowCard({
  name,
  subtitle,
  activeBookings,
  inactiveBookings,
  revenue,
  onPress,
}: DirectoryRowCardProps) {
  const { t } = useTranslation();
  return (
    <ListRowCard
      title={name}
      subtitle={subtitle}
      chips={[
        ...(activeBookings > 0
          ? [{ labelKey: 'agent.directoryPage.activeCount', params: { count: activeBookings }, tone: 'brand' as const }]
          : []),
        ...(inactiveBookings > 0
          ? [{ labelKey: 'agent.directoryPage.inactiveCount', params: { count: inactiveBookings }, tone: 'muted' as const }]
          : []),
      ]}
      value={revenue}
      valueSuffix={t('agent.directoryPage.generated')}
      onPress={onPress}
      accessibilityLabel={t('agent.directoryPage.openProfile', { name })}
    />
  );
}
