import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Agent, AgentId, PipelineCard } from '@/contracts';
import { useOverlay } from '@/app/useOverlay';
import { useAgents, usePipeline } from '@/data/hooks';
import { Portrait } from './Portrait';
import { Dot, EmptyNote, SearchField, SelectChip, StatusChip, WidgetCard, cx } from './Primitives';

const toneOf = { ok: 'positive', waiting: 'warning', needs: 'danger' } as const;
const EARLY = /Nov|Dec/;

function Lane({ agent, cards, onOpen, onOpenCard }: { agent: Agent; cards: PipelineCard[]; onOpen: () => void; onOpenCard: (c: PipelineCard) => void }) {
  const { t } = useTranslation();
  return (
    <section aria-label={agent.name} className="flex min-h-0 min-w-[10.5rem] flex-1 flex-col px-3 first:pl-0 last:pr-0">
      <button type="button" onClick={onOpen} className="mb-3 flex w-full shrink-0 items-center gap-3 rounded-card border border-border bg-surface p-3 text-left shadow-card hover:bg-surface-tint">
        <Portrait spec={agent.portrait} size={44} />
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-tight">{agent.name}</span>
          <span className="mt-1.5 inline-block">
            <StatusChip status={agent.status} />
          </span>
        </span>
      </button>
      <ul className="-mx-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 pb-2">
        {cards.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onOpenCard(c)}
              className="w-full rounded-tile border border-border bg-surface p-3 text-left shadow-card transition-colors hover:border-border-strong hover:bg-surface-tint"
            >
              <span className="block text-sm font-semibold">{c.name}</span>
              <span className="block text-xs text-fg-muted">{c.trip}</span>
              <span className="mt-0.5 block text-xs font-semibold text-brand">{c.proposals}</span>
              <span className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-xs text-fg-subtle">
                <Dot tone={toneOf[c.tone]} />
                {c.note}
              </span>
            </button>
          </li>
        ))}
        {cards.length === 0 && (
          <li>
            <EmptyNote>{agent.enabled ? t('lanes.empty') : t('lanes.paused')}</EmptyNote>
          </li>
        )}
      </ul>
    </section>
  );
}

export function AgentLanes({ only, className }: { only?: AgentId[]; className?: string }) {
  const { t } = useTranslation();
  const agents = useAgents() ?? [];
  const pipeline = usePipeline() ?? [];
  const overlay = useOverlay();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [range, setRange] = useState('any');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pipeline.filter((c) => {
      if (q && !`${c.name} ${c.trip} ${c.note} ${c.agentId}`.toLowerCase().includes(q)) return false;
      if (status !== 'all' && c.tone !== status) return false;
      // PROTO: date range matches the month text on each card; real data would filter on trip dates.
      if (range === 'soon' && !EARLY.test(c.trip)) return false;
      if (range === 'later' && EARLY.test(c.trip)) return false;
      return true;
    });
  }, [pipeline, query, status, range]);

  const lanes = agents.filter((a) => !only || only.includes(a.id));
  const total = pipeline.length;

  return (
    <WidgetCard
      title={t('lanes.title')}
      subtitle={t('lanes.subtitle', { count: total })}
      className={className}
      actions={
        <>
        <SearchField value={query} onChange={setQuery} placeholder={t('lanes.search')} className="w-96 max-w-full" />
        <SelectChip
          label={t('lanes.status')}
          value={status}
          onChange={setStatus}
          options={[
            { key: 'all', label: t('lanes.statusAll') },
            { key: 'needs', label: t('lanes.statusNeeds') },
            { key: 'waiting', label: t('lanes.statusWaiting') },
            { key: 'ok', label: t('lanes.statusOk') },
          ]}
        />
        <SelectChip
          label={t('lanes.dateRange')}
          value={range}
          onChange={setRange}
          options={[
            { key: 'any', label: t('lanes.rangeAny') },
            { key: 'soon', label: t('lanes.rangeSoon') },
            { key: 'later', label: t('lanes.rangeLater') },
          ]}
        />
        </>
      }
    >
      <div className={cx('flex min-h-0 flex-1 divide-x divide-border overflow-x-auto overflow-y-hidden border-t border-border pt-4')}>
        {lanes.map((a) => (
          <Lane
            key={a.id}
            agent={a}
            cards={shown.filter((c) => c.agentId === a.id)}
            onOpen={() => overlay.open({ kind: 'agent', agentId: a.id })}
            onOpenCard={(c) => overlay.open({ kind: 'agent', agentId: a.id, itemId: c.customerId })}
          />
        ))}
      </div>
    </WidgetCard>
  );
}
