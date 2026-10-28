import { Stack } from 'expo-router';
import { AgentPortalAuthProvider, useAgentPortalAuth } from '../../lib/agent-portal-auth-context';
import { AgentPortalLogin } from '../../screens/AgentPortalLogin';

function AgentPortalGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAgentPortalAuth();

  if (!isAuthenticated) {
    return <AgentPortalLogin />;
  }

  return <>{children}</>;
}

export default function AgentPortalLayout() {
  return (
    <AgentPortalAuthProvider>
      <AgentPortalGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(agent-tabs)" />
        </Stack>
      </AgentPortalGate>
    </AgentPortalAuthProvider>
  );
}
