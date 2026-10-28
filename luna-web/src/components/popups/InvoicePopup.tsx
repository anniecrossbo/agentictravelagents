import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { useOverlay } from '@/app/useOverlay';
import { printPage } from '@/adapters/download';
import { actions, useInvoice, useSettings } from '@/data/hooks';
import { Popup } from '../Popup';
import { BackButton, Button, CloseButton } from '../Primitives';
import { useToast } from '../Toast';
import { InvoiceDocument } from './InvoiceDocument';

export function InvoicePopup({ id }: { id: string }) {
  const { t } = useTranslation();
  const overlay = useOverlay();
  const toast = useToast();
  const invoice = useInvoice(id);
  const settings = useSettings();
  if (!invoice || !settings) return null;
  const isCustomer = invoice.kind === 'customer';

  const send = async () => {
    await actions.sendInvoice(id);
    toast(t('invoice.sentToast', { name: invoice.billTo.name }));
  };

  return (
    <Popup label={`${invoice.number}.pdf`} onClose={overlay.close} width="max-w-[56rem]" tone="surface">
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4">
        {overlay.hasFrom && <BackButton onClick={overlay.back} />}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold">{`${invoice.number}.pdf`}</h1>
          <p className="text-xs text-fg-muted">{t('invoice.subtitle', { name: invoice.billTo.name, kind: t(`invoice.kind.${invoice.kind}`) })}</p>
        </div>
        <Button size="sm" onClick={printPage}>
          {t('invoice.download')}
        </Button>
        {isCustomer && (
          <Button variant="secondary" size="sm" disabled={invoice.sent} onClick={() => void send()}>
            {invoice.sent && <Check size={14} aria-hidden />}
            {invoice.sent ? t('invoice.sent') : t('invoice.send')}
          </Button>
        )}
        <CloseButton onClick={overlay.close} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-sunken p-4 sm:p-6">
        <InvoiceDocument invoice={invoice} template={settings.invoiceTemplate} />
      </div>
    </Popup>
  );
}
