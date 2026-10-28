import { useLocalSearchParams } from 'expo-router';
import { RoomsWorkspace } from '../../../screens/RoomsWorkspace';

/** Canonical room type workspace — addressable per §22.2. */
export default function RoomTypeDetailRoute() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  return <RoomsWorkspace openRoomTypeId={id} initialTab={tab} />;
}
