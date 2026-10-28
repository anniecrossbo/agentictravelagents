import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { useOverlay } from '@/app/useOverlay';
import { downloadText } from '@/adapters/download';
import { useAgents, useCustomerSnapshot, useCustomers } from '@/data/hooks';
import { type CustomerFilter, filterCustomers, stageTone } from '@/lib/customers';
import { toCsv } from '@/lib/csv';
import { num } from '@/lib/format';
import { Portrait } from '../Portrait';
import { Button, Chip, CustomerAvatar, EmptyNote, FilterChips, SearchField, WidgetCard } from '../Primitives';
import { useToast } from '../Toast';

export function CustomersWidget({ className }: { className?: string }) {
  const { t } = useTranslation();
  const customers = useCustomers() ?? [];
  const snapshot = useCustomerSnapshot();
  const agents = useAgents() ?? [];
  const overlay = useOverlay();
  const toast = useToast();
  const [filter, setFilter] = useState<CustomerFilter>('all');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const found = filterCustomers(customers, filter, query);
    return query.trim() ? found : found.slice(0, 5);
  }, [customers, filter, query]);
  const counts = snapshot?.chipCounts;

  const exportCsv = () => {
    downloadText('customers.csv', toCsv([[t('customers.csvName'), t('customers.csvStage'), t('customers.csvLocation')], ...customers.map((c) => [c.name, c.stage, c.location])]));
    toast(t('customers.exported'));
  };

  return (
    <WidgetCard
      title={t('customers.title')}
      subtitle={t('customers.subtitle')}
      className={className}
      actions={
        <>
          <p className="flex items-baseline gap-2 pr-2">
            <span className="text-xs text-fg-muted">{t('customers.repeatGuests')}</span>
            <span className="text-xl font-semibold">{snapshot?.repeatGuests}</span>
          </p>
          <Button variant="secondary" size="sm" onClick={() => toast(t('common.protoImport'))}>
            {t('common.import')}
          </Button>
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            {t('common.export')}
          </Button>
          <Button size="sm" onClick={() => overlay.open({ kind: 'all', what: 'customers' })}>
            {t('customers.viewAll', { count: num(counts?.all ?? 0) })}
          </Button>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterChips<CustomerFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: t('customers.chipAll', { count: num(counts?.all ?? 0) }) },
            { key: 'upcoming', label: t('customers.chipUpcoming', { count: counts?.upcoming ?? 0 }) },
            { key: 'travelling', label: t('customers.chipTravelling', { count: counts?.travelling ?? 0 }) },
            { key: 'needs', label: t('customers.chipNeeds', { count: counts?.needs ?? 0 }), tone: 'danger' },
            { key: 'vip', label: t('customers.chipVip', { count: counts?.vip ?? 0 }) },
          ]}
        />
        <SearchField value={query} onChange={setQuery} placeholder={t('customers.search')} className="min-w-48 flex-1" />
      </div>
      {rows.length === 0 && <EmptyNote>{t('customers.none')}</EmptyNote>}
      <ul className="divide-y divide-border">
        {rows.map((c) => {
          const agent = agents.find((a) => a.id === c.agentId);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => overlay.open({ kind: 'profile', customerId: c.id, tab: 'team' })}
                className="flex min-h-14 w-full items-center gap-3 py-2 text-left hover:bg-surface-tint"
              >
                <CustomerAvatar initials={c.initials} tone={c.tone} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{c.name}</span>
                  <span className="block truncate text-xs text-fg-muted">{c.headline}</span>
                </span>
                <Chip tone={stageTone(c.stage)}>{c.stage}</Chip>
                {agent && <Portrait spec={agent.portrait} size={28} label={agent.name} />}
                <ChevronRight size={16} aria-hidden className="text-fg-muted" />
              </button>
            </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
}
