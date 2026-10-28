import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { useOverlay } from '@/app/useOverlay';
import { downloadText } from '@/adapters/download';
import type { SupplierCategory } from '@/contracts';
import { useAgentCases, useAgents, useCommissionSummary, useSuppliers } from '@/data/hooks';
import { compactMoney, money } from '@/lib/format';
import { toCsv } from '@/lib/csv';
import { BarChart } from '../Charts';
import { Portrait } from '../Portrait';
import { Button, Chip, CustomerAvatar, Dot, EmptyNote, FilterChips, SearchField, StatusChip, WidgetCard } from '../Primitives';
import { useToast } from '../Toast';

type SupplierFilter = 'all' | SupplierCategory;

export function SuppliersWidget({ className }: { className?: string }) {
  const { t } = useTranslation();
  const suppliers = useSuppliers() ?? [];
  const summary = useCommissionSummary();
  const overlay = useOverlay();
  const toast = useToast();
  const [filter, setFilter] = useState<SupplierFilter>('all');
  const [query, setQuery] = useState('');
  const counts = summary?.chipCounts;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suppliers.filter((s) => (filter === 'all' || s.category === filter) && (!q || `${s.name} ${s.place}`.toLowerCase().includes(q)));
  }, [suppliers, filter, query]);

  const exportCsv = () => {
    downloadText('suppliers.csv', toCsv([[t('suppliers.csvName'), t('suppliers.csvPlace'), t('suppliers.csvStatus')], ...suppliers.map((s) => [s.name, s.place, s.status])]));
    toast(t('suppliers.exported'));
  };

  return (
    <WidgetCard
      title={t('suppliers.title')}
      subtitle={t('suppliers.subtitle')}
      className={className}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={() => toast(t('common.protoImport'))}>
            {t('common.import')}
          </Button>
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            {t('common.export')}
          </Button>
          <Button size="sm" onClick={() => overlay.open({ kind: 'all', what: 'suppliers' })}>
            {t('suppliers.viewAll', { count: counts?.all ?? 0 })}
          </Button>
        </>
      }
    >
      <div className="mb-3">
        <FilterChips<SupplierFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: t('suppliers.chipAll', { count: counts?.all ?? 0 }) },
            { key: 'hotel', label: t('suppliers.chipHotel', { count: counts?.hotel ?? 0 }) },
            { key: 'transfer', label: t('suppliers.chipTransfer', { count: counts?.transfer ?? 0 }) },
            { key: 'experience', label: t('suppliers.chipExperience', { count: counts?.experience ?? 0 }) },
            { key: 'flight', label: t('suppliers.chipFlight', { count: counts?.flight ?? 0 }) },
            { key: 'cruise', label: t('suppliers.chipCruise', { count: counts?.cruise ?? 0 }) },
            { key: 'dmc', label: t('suppliers.chipDmc', { count: counts?.dmc ?? 0 }) },
          ]}
        />
      </div>
      <SearchField value={query} onChange={setQuery} placeholder={t('suppliers.search')} className="mb-3" />
      {rows.length === 0 && <EmptyNote>{t('suppliers.none')}</EmptyNote>}
      <ul className="flex flex-col gap-2 pr-1">
        {rows.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => overlay.open({ kind: 'supplier', id: s.id, tab: 'first' })}
              className="flex min-h-16 w-full items-center gap-3 rounded-tile border border-border bg-surface p-3 text-left hover:border-border-strong hover:bg-surface-tint"
            >
              <CustomerAvatar initials={s.initials} tone={s.tone} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{s.name}</span>
                <span className="block truncate text-xs text-fg-muted">{s.place}</span>
              </span>
              <Chip tone={s.statusTone}>{s.status}</Chip>
              <span className="w-24 text-right">
                <span className="block text-sm font-semibold">{s.earned === null ? '—' : money(s.earned)}</span>
                <span className="block text-[0.65rem] text-fg-muted">{s.earned === null ? t('suppliers.nothingYet') : t('suppliers.earnedThisYear')}</span>
              </span>
              <ChevronRight size={16} aria-hidden className="text-fg-muted" />
            </button>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}

export function CommissionWidget({ className }: { className?: string }) {
  const { t } = useTranslation();
  const summary = useCommissionSummary();
  if (!summary) return null;
  return (
    <WidgetCard title={t('suppliers.commissionTitle')} subtitle={t('suppliers.commissionSubtitle')} className={className}>
      <p className="flex flex-wrap items-baseline gap-2">
        <span className="text-4xl font-semibold leading-none">{money(summary.total)}</span>
        <span className="text-xs text-fg-muted">{t('suppliers.soFar')}</span>
        <Chip tone="positive">{t('suppliers.thisMonth', { amount: money(summary.thisMonth, { sign: true }) })}</Chip>
      </p>
      <div className="mt-4">
        <BarChart bars={summary.bars} format={(n) => compactMoney(n)} />
      </div>
    </WidgetCard>
  );
}

export function SupplierTeamWidget({ className }: { className?: string }) {
  const { t } = useTranslation();
  const agents = useAgents() ?? [];
  const cases = useAgentCases('supplier') ?? [];
  const overlay = useOverlay();
  const agent = agents.find((a) => a.id === 'supplier');
  return (
    <WidgetCard className={className}>
      {agent && (
        <button type="button" onClick={() => overlay.open({ kind: 'agent', agentId: 'supplier' })} className="mb-4 flex w-full items-center gap-3 rounded-card border border-border p-3 text-left hover:bg-surface-tint">
          <Portrait spec={agent.portrait} size={48} />
          <span>
            <span className="block text-base font-semibold">{agent.name}</span>
            <StatusChip status={agent.status} />
          </span>
        </button>
      )}
      <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {cases.slice(0, 3).map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => overlay.open({ kind: 'agent', agentId: 'supplier', itemId: c.customerId })} className="w-full rounded-tile border border-border p-3 text-left hover:bg-surface-tint">
              <span className="block text-sm font-semibold">{c.title.split(' — ')[0]}</span>
              <span className="block text-xs text-fg-muted">{c.meta.split(' · ').slice(0, 2).join(' · ')}</span>
              <span className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-xs text-fg-subtle">
                <Dot tone={c.status === 'needs-you' ? 'danger' : c.status === 'waiting' ? 'warning' : 'positive'} />
                {c.summary}
              </span>
            </button>
          </li>
        ))}
        {cases.length === 0 && <EmptyNote>{t('lanes.empty')}</EmptyNote>}
      </ul>
    </WidgetCard>
  );
}
