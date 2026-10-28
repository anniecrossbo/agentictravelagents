import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// PROTO: placeholder screen — properties list to be built

export default function AgentPropertiesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface-page" style={{ paddingTop: insets.top }}>
      <View className="px-5.5 pb-3 pt-5.5">
        <Text className="text-xl font-bold text-fg">
          {t('agentPortal.nav.properties')}
        </Text>
      </View>
    </View>
  );
}
