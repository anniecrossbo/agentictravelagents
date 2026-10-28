import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { TopNotchBar } from './TopNotchBar';
import { AIBriefingModal } from './modals/AIBriefingModal';
import { useAuth } from '../lib/auth-context';
import { useNeedsYou, useProperty } from '../lib/hooks';
import { buildBriefing } from '../lib/ai-briefing';
import type { Capability } from '../lib/types';

type WorkspaceHeaderProps = {
  /** Formatted business date shown in the notch. */
  businessDate: string;
  refreshedMinutesAgo?: number;
};

/**
 * The notch bar plus the briefing it opens. PRD v6 §9.2 puts the AI briefing
 * behind the user-name control, so it lives here rather than on each screen.
 */
export function WorkspaceHeader({
  businessDate,
  refreshedMinutesAgo = 2,
}: WorkspaceHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user, role } = useAuth();
  const property = useProperty();
  const signals = useNeedsYou();
  const [briefingOpen, setBriefingOpen] = useState(false);

  const userName = `${user.firstName} ${user.lastName}`;

  const capabilities = useMemo(
    () =>
      new Set<Capability>(
        user.permissions.filter((p) => p.granted).map((p) => p.capability),
      ),
    [user.permissions],
  );

  const briefing = useMemo(
    () =>
      buildBriefing({
        signals: signals.all,
        role,
        capabilities,
        businessDate: property.businessDate,
      }),
    [signals.all, role, capabilities, property.businessDate],
  );

  // PROTO: static clock; production resolves the property timezone
  const hour = 9;

  return (
    <>
      <View style={{ paddingTop: insets.top }}>
        <TopNotchBar
          refreshedMinutesAgo={refreshedMinutesAgo}
          businessDate={businessDate}
          userName={userName}
          onProfilePress={() => setBriefingOpen(true)}
        />
      </View>

      <AIBriefingModal
        visible={briefingOpen}
        onClose={() => setBriefingOpen(false)}
        briefing={briefing}
        userName={user.firstName}
        hour={hour}
        refreshedMinutesAgo={refreshedMinutesAgo}
      />
    </>
  );
}
