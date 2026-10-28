import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { useOverlay } from '@/app/useOverlay';
import { downloadText } from '@/adapters/download';
import type { FinanceRecord, FinanceStage } from '@/contracts';
import { useAgents, useBookings, useCustomers, useFinanceRecords, useFinanceSnapshot } from '@/data/hooks';
import { toCsv } from '@/lib/csv';
import { money } from '@/lib/format';
import { stageTotals } from '@/lib/finance';
import { Portrait } from '../Portrait';
import { Button, Chip, CustomerAvatar, Dot, EmptyNote, FilterChips, SearchField, StatusChip, WidgetCard, cx } from '../Primitives';
import { useToast } from '../Toast';

type RecordFilter = 'all' | FinanceRecord['kind'];

const KIND_TAG: Record<FinanceRecord['kind'], string> = {
  customer: 'finance.tagCustomer',
  supplier: 'finance.tagSupplier',
  payout: 'finance.tagPayout',
  commission: 'finance.tagCommission',
  refund: 'finance.tagRefund',
};

export function FinanceRecordsWidget({ className }: { className?: string }) {
  const { t } = useTranslation();
  const records = useFinanceRecords() ?? [];
  const snapshot = useFinanceSnapshot();
  const customers = useCustomers() ?? [];
  const overlay = useOverlay();
  const toast = useToast();
  const [filter, setFilter] = useState<RecordFilter>('all');
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const found = records.filter((r) => (filter === 'all' || r.kind === filter) && (!q || `${r.title} ${r.sub} ${r.status} ${r.amount}`.toLowerCase().includes(q)));
    return q ? found : found.slice(0, 5);
  }, [records, filter, query]);
  const counts = snapshot?.chipCounts;

  const exportCsv = () => {
    downloadText('financial-records.csv', toCsv([[t('finance.csvRecord'), t('finance.csvAmount'), t('finance.csvStatus')], ...records.map((r) => [r.title, r.amount, r.status])]));
    toast(t('finance.exported'));
  };

  const openRecord = (r: FinanceRecord) => overlay.open({ kind: 'agent', agentId: 'finance', itemId: r.bookingId });

  return (
    <WidgetCard
      title={t('finance.recordsTitle')}
      subtitle={t('finance.recordsSubtitle')}
      className={className}
      actions={
        <>
          {snapshot && (
            <p className="flex items-baseline gap-2 pr-2">
              <span className="text-xl font-semibold">{money(snapshot.paidSoFar)}</span>
              <span className="text-xs text-fg-muted">{t('finance.paidOfBooked', { amount: money(snapshot.booked) })}</span>
            </p>
          )}
          <Button variant="secondary" size="sm" onClick={() => toast(t('common.protoImport'))}>
            {t('common.import')}
          </Button>
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            {t('common.export')}
          </Button>
          <Button size="sm" onClick={() => overlay.open({ kind: 'all', what: 'finance' })}>
            {t('finance.viewAll', { count: counts?.all ?? 0 })}
          </Button>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterChips<RecordFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: t('finance.chipAll', { count: counts?.all ?? 0 }) },
            { key: 'customer', label: t('finance.chipCustomer', { count: counts?.customer ?? 0 }) },
            { key: 'supplier', label: t('finance.chipSupplier', { count: counts?.supplier ?? 0 }) },
            { key: 'payout', label: t('finance.chipPayout', { count: counts?.payout ?? 0 }) },
            { key: 'commission', label: t('finance.chipCommission', { count: counts?.commission ?? 0 }) },
            { key: 'refund', label: t('finance.chipRefund', { count: counts?.refund ?? 0 }) },
          ]}
        />
        <SearchField value={query} onChange={setQuery} placeholder={t('finance.search')} className="min-w-48 flex-1" />
      </div>
      {rows.length === 0 && <EmptyNote>{t('finance.noRecords')}</EmptyNote>}
      <ul className="divide-y divide-border">
        {rows.map((r) => {
          const customer = customers.find((c) => c.id === r.customerId);
          return (
          <li key={r.id}>
            <button type="button" onClick={() => openRecord(r)} className="flex min-h-14 w-full items-center gap-3 py-2 text-left hover:bg-surface-tint">
              {customer && <CustomerAvatar initials={customer.initials} tone={customer.tone} />}
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {r.title}
                  <Chip tone="info" className="!px-2 !py-0 text-[0.65rem]">
                    {t(KIND_TAG[r.kind])}
                  </Chip>
                </span>
                <span className="block truncate text-xs text-fg-muted">{r.sub}</span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-semibold">{r.amount}</span>
                <span className="block text-xs text-fg-muted">{r.date}</span>
              </span>
              <Chip tone={r.tone}>{r.status}</Chip>
              <ChevronRight size={16} aria-hidden className="text-fg-muted" />
            </button>
          </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
}

const STAGES: { key: FinanceStage; title: string; tag: string }[] = [
  { key: 'pending-customer', title: 'finance.stageCustomer', tag: 'finance.tagCustomer' },
  { key: 'pending-hotel', title: 'finance.stageHotel', tag: 'finance.tagCommission' },
  { key: 'to-pay', title: 'finance.stageToPay', tag: 'finance.tagSupplier' },
];

const FILTER_STAGES: Record<RecordFilter, FinanceStage[]> = {
  all: ['pending-customer', 'pending-hotel', 'to-pay'],
  customer: ['pending-customer'],
  supplier: ['to-pay'],
  payout: ['to-pay'],
  commission: ['pending-hotel'],
  refund: [],
};

export function FinanceTeamWidget({ className }: { className?: string }) {
  const { t } = useTranslation();
  const agents = useAgents() ?? [];
  const bookings = (useBookings() ?? []).filter((b) => !b.closed);
  const snapshot = useFinanceSnapshot();
  const overlay = useOverlay();
  const [filter, setFilter] = useState<RecordFilter>('all');
  const agent = agents.find((a) => a.id === 'finance');
  const totals = stageTotals(bookings);
  const counts = snapshot?.chipCounts;
  const visible = STAGES.filter((s) => FILTER_STAGES[filter].includes(s.key));

  return (
    <WidgetCard className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <button type="button" onClick={() => overlay.open({ kind: 'agent', agentId: 'finance' })} className="flex items-center gap-3 rounded-tile text-left hover:opacity-80">
          {agent && <Portrait spec={agent.portrait} size={48} />}
          <span>
            <span className="block text-base font-semibold">{agent?.name}</span>
            {agent && <StatusChip status={agent.status} />}
          </span>
        </button>
        <FilterChips<RecordFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: t('finance.chipAll', { count: counts?.all ?? 0 }) },
            { key: 'customer', label: t('finance.chipCustomer', { count: counts?.customer ?? 0 }) },
            { key: 'supplier', label: t('finance.chipSupplier', { count: counts?.supplier ?? 0 }) },
            { key: 'payout', label: t('finance.chipPayout', { count: counts?.payout ?? 0 }) },
            { key: 'commission', label: t('finance.chipCommission', { count: counts?.commission ?? 0 }) },
            { key: 'refund', label: t('finance.chipRefund', { count: counts?.refund ?? 0 }) },
          ]}
        />
      </div>
      {visible.length === 0 ? (
        <EmptyNote>{t('finance.noStageForFilter')}</EmptyNote>
      ) : (
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-0 divide-x divide-border overflow-x-auto overflow-y-hidden border-t border-border pt-4" style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(15rem, 1fr))` }}>
          {visible.map((stage) => (
            <section key={stage.key} className="flex min-h-0 flex-col px-3 first:pl-0 last:pr-0" aria-label={t(stage.title)}>
              <header className="mb-3 flex shrink-0 items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  {t(stage.title)}
                  <span className="rounded-pill bg-surface-sunken px-2 text-xs text-fg-muted">{totals[stage.key].count}</span>
                </h3>
                <span className="text-xs text-fg-muted">{t('finance.stageTotal', { amount: money(totals[stage.key].total), count: totals[stage.key].count })}</span>
              </header>
              <ul className="-mx-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 pb-2">
                {bookings.map((b) => {
                  const card = b.stages[stage.key];
                  return (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => overlay.open({ kind: 'agent', agentId: 'finance', itemId: b.id })}
                        className="w-full rounded-tile border border-border bg-surface p-3 text-left shadow-card hover:border-border-strong hover:bg-surface-tint"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{b.customerName}</span>
                          <Chip tone="info" className="!px-2 !py-0 text-[0.65rem]">
                            {t(stage.tag)}
                          </Chip>
                        </span>
                        {card.lines.map((l) => (
                          <span key={l.text} className={cx('block text-xs', l.strong ? 'font-semibold text-brand' : 'text-fg-muted')}>
                            {l.text}
                          </span>
                        ))}
                        <span className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-xs text-fg-subtle">
                          <Dot tone={card.chipTone} />
                          {card.chip}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
