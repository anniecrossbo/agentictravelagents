import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  Briefcase,
  TrendingUp,
  Building2,
  MessageSquare,
  CircleUserRound,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

type TabConfig = {
  key: string;
  labelKey: string;
  icon: LucideIcon;
};

const TABS: TabConfig[] = [
  { key: 'dashboard', labelKey: 'agentPortal.nav.dashboard', icon: LayoutGrid },
  { key: 'bookings', labelKey: 'agentPortal.nav.bookings', icon: Briefcase },
  { key: 'finance', labelKey: 'agentPortal.nav.finance', icon: TrendingUp },
  { key: 'properties', labelKey: 'agentPortal.nav.properties', icon: Building2 },
  { key: 'messages', labelKey: 'agentPortal.nav.messages', icon: MessageSquare },
  { key: 'account', labelKey: 'agentPortal.nav.account', icon: CircleUserRound },
];

const containerShadow = {
  shadowColor: tokens.shadow.xs,
  shadowOffset: { width: 0, height: 12 },
  shadowRadius: 30,
  shadowOpacity: 1,
  elevation: 8,
};

const activePillShadow = {
  shadowColor: tokens.shadow.nav,
  shadowOffset: { width: 3, height: 3 },
  shadowRadius: 8,
  shadowOpacity: 1,
  elevation: 4,
};

const tabSize = { height: tokens.size.navTab, width: tokens.size.navTab };
const activeTabHeight = { height: tokens.size.navTab };

type AgentPortalBottomNavProps = {
  activeTab: string;
  onTabPress: (tab: string) => void;
};

export function AgentPortalBottomNav({ activeTab, onTabPress }: AgentPortalBottomNavProps) {
  const { t } = useTranslation();

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      <View
        className="flex-row items-center rounded-pill bg-surface-nav px-2 py-1.75"
        style={containerShadow}
      >
        <View className="flex-row items-center gap-2 rounded-pill bg-brand-10 p-1.25">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            const Icon = tab.icon;
            const label = t(tab.labelKey);

            return (
              <Pressable
                key={tab.key}
                onPress={() => onTabPress(tab.key)}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected: isActive }}
                aria-selected={isActive}
                className={`flex-row items-center justify-center rounded-pill ${
                  isActive ? 'gap-3 bg-brand-nav px-3.5' : ''
                }`}
                style={[isActive ? activeTabHeight : tabSize, isActive ? activePillShadow : null]}
              >
                <Icon
                  size={isActive ? tokens.size.navIconActive : tokens.size.navIcon}
                  color={isActive ? tokens.color.fg.inverse : tokens.color.brand.nav}
                />
                {isActive && (
                  <Text className="text-sm font-medium leading-tight text-fg-inverse">
                    {label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
