import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  Users,
  Briefcase,
  ChartNoAxesCombined,
  Warehouse,
  Settings,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

type TabConfig = {
  key: string;
  labelKey: string;
  icon: LucideIcon;
};

const TABS: TabConfig[] = [
  { key: 'dashboard', labelKey: 'nav.home', icon: LayoutGrid },
  { key: 'agents', labelKey: 'nav.agents', icon: Users },
  { key: 'bookings', labelKey: 'nav.bookings', icon: Briefcase },
  { key: 'finance', labelKey: 'nav.finance', icon: ChartNoAxesCombined },
  { key: 'rooms', labelKey: 'nav.rooms', icon: Warehouse },
  { key: 'settings', labelKey: 'nav.settings', icon: Settings },
];

/** Glass container drop shadow — Figma: blur 30, y 12, black 2%. */
const containerShadow = {
  shadowColor: tokens.shadow.xs,
  shadowOffset: { width: 0, height: 12 },
  shadowRadius: 30,
  shadowOpacity: 1,
  elevation: 8,
};

/** Active pill drop shadow — Figma: blur 8.3, offset 3/3, black 30%. */
const activePillShadow = {
  shadowColor: tokens.shadow.nav,
  shadowOffset: { width: 3, height: 3 },
  shadowRadius: 8,
  shadowOpacity: 1,
  elevation: 4,
};

const tabSize = { height: tokens.size.navTab, width: tokens.size.navTab };
const activeTabHeight = { height: tokens.size.navTab };

type BottomNavProps = {
  activeTab: string;
  onTabPress: (tab: string) => void;
};

export function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  const { t } = useTranslation();

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      {/* PROTO: Figma uses a backdrop blur; expo-blur is not installed, so the
          77% white fill stands in for the glass effect. */}
      <View
        className="flex-row items-center rounded-pill bg-surface-nav px-2 py-1.75"
        style={containerShadow}
      >
        {/* Tinted track holding the tabs */}
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
