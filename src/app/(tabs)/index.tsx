import { View } from 'react-native';
import { WorkspaceHeader } from '../../components/WorkspaceHeader';
import { tokens } from '../../theme/tokens';
import { useAuth } from '../../lib/auth-context';
import type { UserRole } from '../../lib/types';
import {
  ReservationManagerDashboard,
  RevenueManagerDashboard,
  GMDashboard,
} from '../../screens/dashboards';

function DashboardForRole({ role }: { role: UserRole }) {
  switch (role) {
    case 'reservation_manager':
      return <ReservationManagerDashboard />;
    case 'revenue_manager':
      return <RevenueManagerDashboard />;
    case 'general_manager':
      return <GMDashboard />;
  }
}

export default function DashboardScreen() {
  const { user, role } = useAuth();

  // PROTO: static business date and freshness — real implementation fetches from server
  const businessDate = '21 Sep 2026';

  return (
    <View className="flex-1 bg-surface-page">
      <WorkspaceHeader businessDate="21 Sep 2026" />

      <View
        className="flex-1"
        style={{
          paddingHorizontal: tokens.size.pageGutter,
          paddingTop: tokens.space['5'],
          paddingBottom: tokens.size.navClearance,
        }}
      >
        <DashboardForRole role={role} />
      </View>
    </View>
  );
}
