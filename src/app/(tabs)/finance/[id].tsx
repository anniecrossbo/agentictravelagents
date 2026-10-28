import { useLocalSearchParams } from 'expo-router';
import { FinanceWorkspace } from '../../../screens/FinanceWorkspace';

/** Canonical obligation workspace — addressable per §22.2. */
export default function ObligationDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FinanceWorkspace openObligationId={id} />;
}
