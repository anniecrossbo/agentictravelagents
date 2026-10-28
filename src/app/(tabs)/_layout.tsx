import { Tabs } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

/**
 * Maps Expo Router route names to BottomNav tab keys.
 * The BottomNav component uses its own key namespace (e.g. 'dashboard')
 * while Expo Router uses file-based names (e.g. 'index').
 */
const ROUTE_TO_TAB: Record<string, string> = {
  index: 'dashboard',
  agents: 'agents',
  bookings: 'bookings',
  finance: 'finance',
  rooms: 'rooms',
  settings: 'settings',
};

const TAB_TO_ROUTE: Record<string, string> = Object.fromEntries(
  Object.entries(ROUTE_TO_TAB).map(([route, tab]) => [tab, route]),
);

function TabBarAdapter({ state, navigation }: BottomTabBarProps) {
  const activeRoute = state.routes[state.index]?.name ?? 'index';
  const activeTab = ROUTE_TO_TAB[activeRoute] ?? 'dashboard';

  const onTabPress = (tab: string) => {
    const routeName = TAB_TO_ROUTE[tab];
    if (routeName && routeName !== activeRoute) {
      navigation.navigate(routeName);
    }
  };

  return <BottomNav activeTab={activeTab} onTabPress={onTabPress} />;
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBarAdapter {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="agents" options={{ title: 'Agents' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="finance" options={{ title: 'Finance' }} />
      <Tabs.Screen name="rooms" options={{ title: 'Rooms' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
