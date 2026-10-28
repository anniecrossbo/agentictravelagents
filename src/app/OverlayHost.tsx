import { useOverlay } from './useOverlay';
import { AgentPopup } from '@/components/popups/AgentPopup';
import { AllCustomersPopup, AllFinancePopup, AllSuppliersPopup } from '@/components/popups/AllPopups';
import { AskPopup } from '@/components/popups/AskPopup';
import { CustomerProfilePopup } from '@/components/popups/CustomerProfilePopup';
import { InvoicePopup } from '@/components/popups/InvoicePopup';
import { ItineraryPopup } from '@/components/popups/ItineraryPopup';
import { EmailPopup, InvoiceTemplatePopup, ItineraryTemplatePopup, WhatsAppPopup } from '@/components/popups/SettingsPopups';
import { SupplierPopup } from '@/components/popups/SupplierPopup';

/** Renders whichever popup the URL asks for. Keys force a fresh state when the popup changes. */
export function OverlayHost() {
  const { current } = useOverlay();
  if (!current) return null;
  switch (current.kind) {
    case 'agent':
      return <AgentPopup key={`agent-${current.agentId}`} agentId={current.agentId} itemId={current.itemId} />;
    case 'profile':
      return <CustomerProfilePopup key={`profile-${current.customerId}`} customerId={current.customerId} tab={current.tab} />;
    case 'itinerary':
      return <ItineraryPopup key={`it-${current.id}`} id={current.id} />;
    case 'supplier':
      return <SupplierPopup key={`sup-${current.id}`} id={current.id} tab={current.tab} />;
    case 'invoice':
      return <InvoicePopup key={`inv-${current.id}`} id={current.id} />;
    case 'all':
      return current.what === 'customers' ? <AllCustomersPopup /> : current.what === 'suppliers' ? <AllSuppliersPopup /> : <AllFinancePopup />;
    case 'template':
      return current.which === 'invoice' ? <InvoiceTemplatePopup /> : <ItineraryTemplatePopup />;
    case 'whatsapp':
      return <WhatsAppPopup />;
    case 'email':
      return <EmailPopup />;
    case 'ask':
      return <AskPopup />;
  }
}
