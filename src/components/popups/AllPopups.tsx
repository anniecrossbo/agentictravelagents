import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOverlay } from '@/app/useOverlay';
import { downloadText } from '@/adapters/download';
import type { FinanceRecord, SupplierCategory } from '@/contracts';
import { useCustomers, useFinanceRecords, useSuppliers } from '@/data/hooks';
import { type CustomerFilter, filterCustomers, stageTone } from '@/lib/customers';
import { toCsv } from '@/lib/csv';
import { money } from '@/lib/format';
import { Popup } from '../Popup';
import { Button, Chip, CloseButton, CustomerAvatar, EmptyNote, FilterChips, SearchField } from '../Primitives';
import { useToast } from '../Toast';

function TableShell({ title, subtitle, onExport, controls, children }: { title: string; subtitle: string; onExport: () => void; controls: ReactNode; children: ReactNode }) {
  const { t } = useTranslation();
  const overlay = useOverlay();
  return (
    <Popup label={title} onClose={overlay.close} width="max-w-[1100px]" tone="surface">
      <header className="flex flex-wrap items-start gap-3 px-6 pb-3 pt-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-xs text-fg-muted">{subtitle}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onExport}>
          {t('common.export')}
        </Button>
        <CloseButton onClick={overlay.close} />
      </header>
      <div className="space-y-3 px-6 pb-3">{controls}</div>
      <div className="min-h-0 flex-1 overflow-auto px-6 pb-6 lg:max-h-[32rem]">{children}</div>
    </Popup>
  );
}

const th = 'sticky top-0 bg-surface px-3 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-fg-muted';
const td = 'px-3 py-3 text-sm';

export function AllCustomersPopup() {
  const { t } = useTranslation();
  const customers = useCustomers() ?? [];
  const overlay = useOverlay();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CustomerFilter>('all');
  const rows = useMemo(() => filterCustomers(customers, filter, query), [customers, filter, query]);

  return (
    <TableShell
      title={t('all.customersTitle')}
      subtitle={t('all.customersSubtitle', { count: customers.length })}
      onExport={() => {
        downloadText('all-customers.csv', toCsv([[t('customers.csvName'), t('customers.csvStage'), t('customers.csvLocation')], ...rows.map((c) => [c.name, c.stage, c.location])]));
        toast(t('customers.exported'));
      }}
      controls={
        <>
          <SearchField value={query} onChange={setQuery} placeholder={t('all.customersSearch')} />
          <FilterChips<CustomerFilter>
            value={filter}
            onChange={setFilter}
            options={[
              { key: 'all', label: t('all.chipAll') },
              { key: 'upcoming', label: t('all.chipUpcoming') },
              { key: 'travelling', label: t('all.chipTravelling') },
              { key: 'needs', label: t('all.chipNeeds'), tone: 'danger' },
              { key: 'vip', label: t('all.chipVip') },
            ]}
          />
        </>
      }
    >
      {rows.length === 0 ? (
        <EmptyNote>{t('customers.none')}</EmptyNote>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>{t('all.colCustomer')}</th>
              <th className={th}>{t('all.colTrip')}</th>
              <th className={th}>{t('all.colStage')}</th>
              <th className={th}>{t('all.colLocation')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-surface-tint">
                <td className={td}>
                  <button type="button" onClick={() => overlay.open({ kind: 'profile', customerId: c.id, tab: 'team' })} className="flex min-h-11 items-center gap-3 text-left font-semibold">
                    <CustomerAvatar initials={c.initials} tone={c.tone} size="sm" />
                    {c.name}
                  </button>
                </td>
                <td className={`${td} text-fg-muted`}>{c.enquiries[0]?.title}</td>
                <td className={td}>
                  <Chip tone={stageTone(c.stage)}>{c.stage}</Chip>
                </td>
                <td className={`${td} text-fg-muted`}>{c.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </TableShell>
  );
}

export function AllSuppliersPopup() {
  const { t } = useTranslation();
  const suppliers = useSuppliers() ?? [];
  const overlay = useOverlay();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | SupplierCategory>('all');
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suppliers.filter((s) => (filter === 'all' || s.category === filter) && (!q || `${s.name} ${s.place}`.toLowerCase().includes(q)));
  }, [suppliers, filter, query]);

  return (
    <TableShell
      title={t('all.suppliersTitle')}
      subtitle={t('all.suppliersSubtitle', { count: suppliers.length })}
      onExport={() => {
        downloadText('all-suppliers.csv', toCsv([[t('suppliers.csvName'), t('suppliers.csvPlace'), t('suppliers.csvStatus')], ...rows.map((s) => [s.name, s.place, s.status])]));
        toast(t('suppliers.exported'));
      }}
      controls={
        <>
          <SearchField value={query} onChange={setQuery} placeholder={t('suppliers.search')} />
          <FilterChips<'all' | SupplierCategory>
            value={filter}
            onChange={setFilter}
            options={[
              { key: 'all', label: t('all.chipAll') },
              { key: 'hotel', label: t('all.chipHotels') },
              { key: 'transfer', label: t('all.chipTransfers') },
              { key: 'experience', label: t('all.chipExperiences') },
            ]}
          />
        </>
      }
    >
      {rows.length === 0 ? (
        <EmptyNote>{t('suppliers.none')}</EmptyNote>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>{t('all.colSupplier')}</th>
              <th className={th}>{t('all.colType')}</th>
              <th className={th}>{t('all.colStatus')}</th>
              <th className={`${th} text-right`}>{t('all.colEarned')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-surface-tint">
                <td className={td}>
                  <button type="button" onClick={() => overlay.open({ kind: 'supplier', id: s.id, tab: 'first' })} className="flex min-h-11 items-center gap-3 text-left font-semibold">
                    <CustomerAvatar initials={s.initials} tone={s.tone} size="sm" />
                    {s.name}
                  </button>
                </td>
                <td className={`${td} text-fg-muted`}>{s.place}</td>
                <td className={td}>
                  <Chip tone={s.statusTone}>{s.status}</Chip>
                </td>
                <td className={`${td} text-right font-semibold`}>{s.earned === null ? '—' : money(s.earned)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </TableShell>
  );
}

export function AllFinancePopup() {
  const { t } = useTranslation();
  const records = useFinanceRecords() ?? [];
  const overlay = useOverlay();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | FinanceRecord['kind']>('all');
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => (filter === 'all' || r.kind === filter) && (!q || `${r.title} ${r.sub}`.toLowerCase().includes(q)));
  }, [records, filter, query]);

  return (
    <TableShell
      title={t('all.financeTitle')}
      subtitle={t('all.financeSubtitle', { count: records.length })}
      onExport={() => {
        downloadText('financial-records.csv', toCsv([[t('finance.csvRecord'), t('finance.csvAmount'), t('finance.csvStatus')], ...rows.map((r) => [r.title, r.amount, r.status])]));
        toast(t('finance.exported'));
      }}
      controls={
        <>
          <SearchField value={query} onChange={setQuery} placeholder={t('all.financeSearch')} />
          <FilterChips<'all' | FinanceRecord['kind']>
            value={filter}
            onChange={setFilter}
            options={[
              { key: 'all', label: t('all.chipAll') },
              { key: 'customer', label: t('finance.tagCustomer') },
              { key: 'supplier', label: t('finance.tagSupplier') },
              { key: 'payout', label: t('finance.tagPayout') },
              { key: 'commission', label: t('finance.tagCommission') },
              { key: 'refund', label: t('finance.tagRefund') },
            ]}
          />
        </>
      }
    >
      {rows.length === 0 ? (
        <EmptyNote>{t('finance.noRecords')}</EmptyNote>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>{t('all.colRecord')}</th>
              <th className={th}>{t('all.colTag')}</th>
              <th className={`${th} text-right`}>{t('all.colAmount')}</th>
              <th className={th}>{t('all.colDate')}</th>
              <th className={th}>{t('all.colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-surface-tint">
                <td className={td}>
                  <button type="button" onClick={() => overlay.open({ kind: 'agent', agentId: 'finance', itemId: r.bookingId })} className="min-h-11 text-left">
                    <span className="block font-semibold">{r.title}</span>
                    <span className="block text-xs text-fg-muted">{r.sub}</span>
                  </button>
                </td>
                <td className={td}>
                  <Chip tone="info">{t(`finance.tag${r.kind[0]?.toUpperCase()}${r.kind.slice(1)}`)}</Chip>
                </td>
                <td className={`${td} text-right font-semibold`}>{r.amount}</td>
                <td className={`${td} text-fg-muted`}>{r.date}</td>
                <td className={td}>
                  <Chip tone={r.tone}>{r.status}</Chip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </TableShell>
  );
}
