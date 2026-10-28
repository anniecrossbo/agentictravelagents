import { useLocalSearchParams } from 'expo-router';
import { BookingsWorkspace } from '../../../screens/BookingsWorkspace';

/** Canonical booking workspace — addressable so refresh and copy-link resolve (§22.2). */
export default function BookingDetailRoute() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  return <BookingsWorkspace openBookingId={id} initialTab={tab} />;
}
