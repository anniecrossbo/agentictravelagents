import { useLocalSearchParams } from 'expo-router';
import { AgentsWorkspace } from '../../../screens/AgentsWorkspace';

/** Agent or agency workspace — both are canonical entities here (§22.3). */
export default function AgentDetailRoute() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  return <AgentsWorkspace openEntityId={id} initialTab={tab} />;
}
