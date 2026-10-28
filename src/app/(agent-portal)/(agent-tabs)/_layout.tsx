import { Tabs } from 'expo-router';
import { AgentPortalBottomNav } from '../../../components/AgentPortalBottomNav';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ROUTE_TO_TAB: Record<string, string> = {
  index: 'dashboard',
  bookings: 'bookings',
  finance: 'finance',
  properties: 'properties',
  messages: 'messages',
  account: 'account',
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

  return <AgentPortalBottomNav activeTab={activeTab} onTabPress={onTabPress} />;
}

export default function AgentTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBarAdapter {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="finance" options={{ title: 'Finance' }} />
      <Tabs.Screen name="properties" options={{ title: 'Properties' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
