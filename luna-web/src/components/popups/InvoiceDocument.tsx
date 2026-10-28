import { useTranslation } from 'react-i18next';
import type { Invoice, InvoiceTemplate } from '@/contracts';
import { invoiceBalance, invoiceTotal } from '@/lib/finance';
import { money } from '@/lib/format';

/** The printable invoice sheet. `template` overrides the agency header and footer (used by the template editor preview). */
export function InvoiceDocument({ invoice, template }: { invoice: Invoice; template: InvoiceTemplate }) {
  const { t } = useTranslation();
  const title = t(`invoice.title.${invoice.kind}`);
  const balance = invoiceBalance(invoice);
  const isCustomer = invoice.kind === 'customer';
  return (
    <article className="print-area mx-auto w-full max-w-[52rem] rounded-tile bg-surface p-8 text-fg shadow-card sm:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-xl font-semibold">{template.agencyName}</h2>
          <p className="text-xs text-fg-muted">{template.address}</p>
          <p className="text-xs text-fg-muted">{template.contact}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-wide text-brand">{title}</p>
          <p className="text-sm font-semibold">{invoice.number}</p>
          <p className="text-xs text-fg-muted">{t('invoice.issued', { date: invoice.issued })}</p>
        </div>
      </header>
      <div className="grid gap-6 border-b border-border py-6 sm:grid-cols-2">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-fg-muted">{t('invoice.billTo')}</p>
          <p className="font-semibold">{invoice.billTo.name}</p>
          <p className="text-xs text-fg-muted">{invoice.billTo.place}</p>
          <p className="text-xs text-fg-muted">{invoice.billTo.email}</p>
        </div>
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-fg-muted">{t('invoice.booking')}</p>
          <p className="font-semibold">{invoice.bookingRef.name}</p>
          <p className="text-xs text-fg-muted">{`${invoice.bookingRef.ref} · ${invoice.bookingRef.detail}`}</p>
        </div>
      </div>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="text-left text-[0.65rem] font-semibold uppercase tracking-wider text-fg-muted">
            <th className="pb-3 font-semibold">{t('invoice.description')}</th>
            <th className="pb-3 text-right font-semibold">{t('invoice.qty')}</th>
            <th className="pb-3 text-right font-semibold">{t('invoice.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((l) => (
            <tr key={l.description} className="border-t border-border">
              <td className="py-4 pr-4">{l.description}</td>
              <td className="py-4 text-right text-fg-muted">{l.qty}</td>
              <td className="py-4 text-right font-medium">{money(l.amount, { decimals: true })}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="ml-auto mt-4 w-full max-w-xs space-y-1.5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt>{t('invoice.total')}</dt>
          <dd>{money(invoiceTotal(invoice), { decimals: true })}</dd>
        </div>
        {invoice.credits.map((c) => (
          <div key={c.label} className="flex justify-between text-positive">
            <dt>{c.label}</dt>
            <dd>{money(-c.amount, { decimals: true })}</dd>
          </div>
        ))}
        {isCustomer && (
          <div className="flex justify-between text-base font-semibold text-brand">
            <dt>{t('invoice.balanceDue')}</dt>
            <dd>{money(balance, { decimals: true })}</dd>
          </div>
        )}
      </dl>
      <p className="mt-6 rounded-tile bg-brand-tint px-4 py-3 text-sm">{invoice.note}</p>
      <div className="mt-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-fg-muted">{t('invoice.howToPay')}</p>
        <p className="mt-1 whitespace-pre-line text-sm">{isCustomer ? `${template.bankDetails}\n${invoice.howToPay.split('\n')[1] ?? ''}` : invoice.howToPay}</p>
      </div>
      {isCustomer && <p className="mt-6 text-xs text-fg-muted">{template.footer}</p>}
    </article>
  );
}
