import { useState } from 'react';
import { BookingDetailModal, GenerateVoucherModal } from '../components/modals';
import {
  useAgents,
  useBookings,
  useCommunications,
  useDocuments,
  useGuests,
  useInventory,
  useProperty,
  useVouchers,
} from '../lib/hooks';

type BookingDetailHostProps = {
  bookingId: string;
  onClose: () => void;
  /** Tab to open on (§22.2); unknown values fall back to Stay. */
  initialTab?: string;
  /** Hide without unmounting, e.g. while another sheet sits on top. */
  visible?: boolean;
};

/**
 * The one way to open a booking. Resolves everything the booking sheet shows
 * from the data layer, so every screen gets the same, complete popup.
 */
export function BookingDetailHost({ bookingId, onClose, initialTab, visible = true }: BookingDetailHostProps) {
  const { all: allBookings } = useBookings();
  const { byId: guestById } = useGuests();
  const { byId: agentById, agencyById } = useAgents();
  const inventory = useInventory();
  const documents = useDocuments();
  const vouchers = useVouchers();
  const comms = useCommunications();
  const property = useProperty();
  const [generatingVoucher, setGeneratingVoucher] = useState(false);

  const booking = allBookings.find((b) => b.id === bookingId);
  if (!booking) return null;

  const guest = booking.guestId ? guestById(booking.guestId) : undefined;
  const agent = booking.agentId ? agentById(booking.agentId) : undefined;
  const agencyName = agent?.agencyId ? agencyById(agent.agencyId)?.name : undefined;
  const roomTypeName = inventory.roomTypes.find((rt) => rt.id === booking.roomTypeId)?.name;
  const guestName = guest ? `${guest.firstName} ${guest.lastName}` : booking.humanId;
  const bookingConversationIds = new Set(
    comms.all.filter((c) => c.bookingId === booking.id).map((c) => c.id),
  );

  return (
    <>
      <BookingDetailModal
        visible={visible && !generatingVoucher}
        onClose={onClose}
        booking={booking}
        guest={guest}
        agencyName={agencyName}
        agentName={agent ? `${agent.firstName} ${agent.lastName}` : undefined}
        roomTypeName={roomTypeName}
        rateCodeName={inventory.rateCodes.find((rc) => rc.id === booking.rateCodeId)?.name}
        documents={documents.byBooking(booking.id)}
        documentTypes={documents.documentTypes}
        messages={comms.messages.filter((m) => bookingConversationIds.has(m.conversationId))}
        voucher={vouchers.byBooking(booking.id)[0]}
        initialTab={initialTab}
        businessDate={property.businessDate}
        guestStayCount={
          booking.guestId ? allBookings.filter((b) => b.guestId === booking.guestId).length : undefined
        }
        threadSummary={comms.bookingThreadSummary(booking.id)}
        onGenerateVoucher={() => setGeneratingVoucher(true)}
      />
      {generatingVoucher && (
        <GenerateVoucherModal
          visible={visible}
          onClose={() => setGeneratingVoucher(false)}
          booking={booking}
          guestName={guestName}
          roomTypeName={roomTypeName}
          templates={vouchers.templates}
          existingVoucher={vouchers.byBooking(booking.id)[0]}
        />
      )}
    </>
  );
}
