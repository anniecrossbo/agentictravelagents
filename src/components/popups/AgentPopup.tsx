import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, Check, ExternalLink, TriangleAlert } from 'lucide-react';
import { useOverlay } from '@/app/useOverlay';
import type { Agent, AgentCase, AgentId, Booking, CashflowStep, PlanStep } from '@/contracts';
import { actions, useAgentCases, useAgents, useBooking, useBookings, useCustomers } from '@/data/hooks';
import { money } from '@/lib/format';
import { paidSoFar, stepsPaidShare, stillToCollect } from '@/lib/finance';
import { caseNeedsYou } from '@/lib/plan';
import { SplitBar } from '../Charts';
import { ChatPanel } from './ChatPanel';
import { Popup } from '../Popup';
import { Portrait } from '../Portrait';
import { BackButton, Button, Chip, CloseButton, Dot, EmptyNote, Eyebrow, SearchField, SelectChip, StatusChip, cx } from '../Primitives';
import { textToneClass } from '../tones';
import { useToast } from '../Toast';

const stateIcon: Record<PlanStep['state'], string> = { done: 'done', working: 'working', 'needs-you': 'needs', 'not-started': 'idle' };

function PlanRow({ step }: { step: PlanStep }) {
  const { t } = useTranslation();
  const kind = stateIcon[step.state];
  return (
    <li className={cx('flex items-start gap-3 rounded-tile px-3 py-2.5', step.state === 'needs-you' && 'bg-danger-soft')}>
      <span className="mt-0.5 shrink-0">
        {kind === 'done' && (
          <span className="flex size-5 items-center justify-center rounded-chip bg-accent text-fg-inverse">
            <Check size={13} aria-hidden />
          </span>
        )}
        {kind === 'needs' && <TriangleAlert size={20} aria-hidden className="text-danger" />}
        {kind === 'working' && <span className="block size-5 rounded-pill border-2 border-accent" />}
        {kind === 'idle' && <span className="block size-5 rounded-pill border-2 border-dashed border-border-strong" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cx('block text-sm font-medium', step.state === 'not-started' && 'text-fg-muted')}>{step.title}</span>
        <span className="block text-xs text-fg-muted">{step.detail}</span>
      </span>
      <span className={cx('shrink-0 text-xs', step.state === 'needs-you' ? 'font-medium text-danger' : 'text-fg-muted')}>
        {step.state === 'done' ? step.when : t(`plan.${step.state}`)}
      </span>
    </li>
  );
}

function CaseView({ agent, theCase }: { agent: Agent; theCase: AgentCase }) {
  const { t } = useTranslation();
  const overlay = useOverlay();
  const customers = useCustomers() ?? [];
  const customer = customers.find((c) => c.id === theCase.customerId);
  const trip = theCase.meta.split(' · ').slice(0, 2).join(' · ');
  const itineraryId = agent.id === 'designer' ? customer?.itineraryId : undefined;

  return (
    <section className="flex min-h-0 flex-col overflow-y-auto rounded-card bg-canvas p-1">
      <header className="mb-3 flex flex-wrap items-center gap-3">
        <BackButton onClick={() => overlay.swap({ kind: 'agent', agentId: agent.id })} />
        <div className="min-w-0 flex-1">
          <h2 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
            {customer?.name ?? theCase.title}
            <StatusChip status={theCase.status} />
          </h2>
          <p className="text-xs text-fg-muted">{trip}</p>
        </div>
        {itineraryId && (
          <Button variant="secondary" size="sm" onClick={() => overlay.open({ kind: 'itinerary', id: itineraryId })}>
            {t('agent.openItinerary')}
          </Button>
        )}
        <Button size="sm" onClick={() => overlay.open({ kind: 'profile', customerId: theCase.customerId, tab: 'team' })}>
          {t('agent.openProfile')}
          <ExternalLink size={13} aria-hidden />
        </Button>
      </header>
      <div className="rounded-card bg-surface p-4 shadow-card">
        {theCase.need && (
          <div className="mb-4 rounded-tile bg-warning-tint p-4">
            <Eyebrow tone="warning">{theCase.need.heading}</Eyebrow>
            <p className="mt-1 text-sm">{theCase.need.body}</p>
            <p className="mt-1 text-xs text-warning">{theCase.need.next}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {theCase.need.actions.map((a) => (
                <Button key={a.id} variant={a.primary ? 'primary' : 'secondary'} size="sm" onClick={() => void actions.completeCaseStep(theCase.id, a.id)}>
                  {a.label}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="mb-1 flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold">{t('agent.myPlan')}</h3>
          <span className="text-xs text-fg-muted">{t('agent.stepsDone', { done: theCase.plan.filter((s) => s.state === 'done').length, total: theCase.plan.length })}</span>
        </div>
        <ul>
          {theCase.plan.map((s) => (
            <PlanRow key={s.id} step={s} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function CaseList({ agent }: { agent: Agent }) {
  const { t } = useTranslation();
  const cases = useAgentCases(agent.id) ?? [];
  const overlay = useOverlay();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((c) => (status === 'all' || c.status === status) && (!q || `${c.title} ${c.meta} ${c.summary}`.toLowerCase().includes(q)));
  }, [cases, query, status]);

  const needs = cases.filter(caseNeedsYou).length;
  const waiting = cases.filter((c) => c.status === 'waiting').length;

  return (
    <section className="flex min-h-0 flex-col gap-3 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-surface p-4 shadow-card">
        <div className="min-w-0 flex-1">
          <Eyebrow>{t('agent.overview')}</Eyebrow>
          <p className="mt-1 text-sm">{agent.overview}</p>
        </div>
        <dl className="flex gap-5 text-center">
          <div>
            <dd className="text-xl font-semibold">{cases.length}</dd>
            <dt className="text-[0.65rem] text-fg-muted">{t('agent.customers')}</dt>
          </div>
          <div>
            <dd className="text-xl font-semibold">{waiting}</dd>
            <dt className="text-[0.65rem] text-fg-muted">{t('agent.waiting')}</dt>
          </div>
          <div>
            <dd className="text-xl font-semibold text-danger">{needs}</dd>
            <dt className="text-[0.65rem] text-fg-muted">{t('agent.needYou')}</dt>
          </div>
        </dl>
      </div>
      <div className="flex gap-2">
        <SearchField value={query} onChange={setQuery} placeholder={t('agent.search')} className="flex-1" />
        <SelectChip
          label={t('lanes.status')}
          value={status}
          onChange={setStatus}
          options={[
            { key: 'all', label: t('lanes.status') },
            { key: 'needs-you', label: t('status.needs-you') },
            { key: 'waiting', label: t('status.waiting') },
            { key: 'working', label: t('status.working') },
            { key: 'caught-up', label: t('status.caught-up') },
          ]}
        />
      </div>
      {shown.length === 0 && <EmptyNote>{t('agent.noCases')}</EmptyNote>}
      <ul className="grid gap-3 md:grid-cols-2">
        {shown.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => overlay.swap({ kind: 'agent', agentId: agent.id, itemId: c.customerId })}
              className="h-full w-full rounded-card bg-surface p-4 text-left shadow-card transition-colors hover:bg-surface-tint"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold">{c.title}</span>
                <StatusChip status={c.status} />
              </span>
              <span className="mt-0.5 block text-xs text-fg-muted">{c.meta}</span>
              <span className="mt-3 block text-sm text-fg-subtle">{c.summary}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StepRow({ step }: { step: CashflowStep }) {
  const overlay = useOverlay();
  const incoming = step.direction === 'in';
  return (
    <li className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <span className={cx('flex size-9 shrink-0 items-center justify-center rounded-pill', incoming ? 'bg-brand-soft text-brand' : 'bg-warning-soft text-warning')}>
        {incoming ? <ArrowDown size={16} aria-hidden /> : <ArrowUp size={16} aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{step.title}</span>
        <span className="block text-xs text-fg-muted">{step.sub}</span>
        {step.invoiceId && (
          <button type="button" onClick={() => overlay.open({ kind: 'invoice', id: step.invoiceId ?? '' })} className="mt-0.5 inline-flex min-h-6 items-center gap-1 text-xs font-semibold text-brand hover:underline">
            {step.invoiceLabel}
            <ExternalLink size={11} aria-hidden />
          </button>
        )}
      </span>
      <span className={cx('text-sm font-semibold', step.amount < 0 ? 'text-fg' : 'text-fg')}>{money(step.amount, { sign: true })}</span>
      <Chip tone={step.tone}>{step.status}</Chip>
    </li>
  );
}

function CashflowView({ booking, agentId }: { booking: Booking; agentId: AgentId }) {
  const { t } = useTranslation();
  const overlay = useOverlay();
  const toast = useToast();
  const share = stepsPaidShare(booking);
  const paid = paidSoFar(booking);
  const open = stillToCollect(booking);

  const tiles = [
    { label: t('cashflow.bookingValue'), value: money(booking.value), note: t('cashflow.confirmedBooking'), tone: 'neutral' as const },
    { label: t('cashflow.paidSoFar'), value: money(paid), note: t('cashflow.matched'), tone: 'positive' as const },
    { label: t('cashflow.stillToCollect'), value: money(open), note: t('cashflow.fromCustomer'), tone: 'warning' as const },
    { label: t('cashflow.commission'), value: money(booking.commission), note: t('cashflow.commissionNote'), tone: 'brand' as const },
  ];

  return (
    <section className="flex min-h-0 flex-col gap-3 overflow-y-auto">
      <header className="flex flex-wrap items-center gap-3">
        <BackButton onClick={() => overlay.swap({ kind: 'agent', agentId })} />
        <div className="min-w-0 flex-1">
          <h2 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
            {booking.customerName}
            <Chip tone={booking.balanceTone}>{booking.balanceChip}</Chip>
          </h2>
          <p className="text-xs text-fg-muted">{booking.trip}</p>
        </div>
        <Button size="sm" onClick={() => overlay.open({ kind: 'profile', customerId: booking.customerId, tab: 'team' })}>
          {t('agent.openProfile')}
          <ExternalLink size={13} aria-hidden />
        </Button>
      </header>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((x) => (
          <div key={x.label} className="rounded-card bg-surface p-3.5 shadow-card">
            <dt className="text-xs text-fg-muted">{x.label}</dt>
            <dd className={cx('text-2xl font-semibold', textToneClass[x.tone])}>{x.value}</dd>
            <p className="text-[0.65rem] text-fg-muted">{x.note}</p>
          </div>
        ))}
      </dl>
      <div className="rounded-card bg-surface p-4 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{t('cashflow.title')}</h3>
            <p className="text-xs text-fg-muted">{t('cashflow.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => toast(t('common.protoImport'))}>
              {t('common.import')}
            </Button>
            <Button size="sm" onClick={() => toast(t('cashflow.protoAddInvoice'))}>
              {t('cashflow.addInvoice')}
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <SplitBar paid={share.paid} open={share.open} />
          <p className="mt-2 flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <Dot tone="positive" />
              {t('cashflow.legendPaid', { amount: money(paid) })}
            </span>
            <span className="flex items-center gap-1.5">
              <Dot tone="warning" />
              {t('cashflow.legendOpen', { amount: money(open) })}
            </span>
          </p>
        </div>
        <ul className="mt-3 overflow-hidden rounded-tile border border-border">
          {booking.steps.map((s) => (
            <StepRow key={s.id} step={s} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function BookingList() {
  const { t } = useTranslation();
  const bookings = (useBookings() ?? []).filter((b) => !b.closed);
  const overlay = useOverlay();
  return (
    <section className="flex min-h-0 flex-col gap-3 overflow-y-auto">
      <div className="rounded-card bg-surface p-4 shadow-card">
        <Eyebrow>{t('agent.overview')}</Eyebrow>
        <p className="mt-1 text-sm">{t('finance.agentOverview')}</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {bookings.map((b) => (
          <li key={b.id}>
            <button type="button" onClick={() => overlay.swap({ kind: 'agent', agentId: 'finance', itemId: b.id })} className="h-full w-full rounded-card bg-surface p-4 text-left shadow-card hover:bg-surface-tint">
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold">{b.customerName}</span>
                <Chip tone={b.balanceTone}>{b.balanceChip}</Chip>
              </span>
              <span className="mt-0.5 block text-xs text-fg-muted">{b.trip}</span>
              <span className="mt-3 flex justify-between text-sm">
                <span>{t('cashflow.paidSoFar')}</span>
                <span className="font-semibold text-positive">{money(paidSoFar(b))}</span>
              </span>
              <span className="flex justify-between text-sm">
                <span>{t('cashflow.stillToCollect')}</span>
                <span className="font-semibold text-warning">{money(stillToCollect(b))}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AgentPopup({ agentId, itemId }: { agentId: string; itemId?: string }) {
  const overlay = useOverlay();
  const agents = useAgents() ?? [];
  const cases = useAgentCases(agentId as AgentId) ?? [];
  const booking = useBooking(agentId === 'finance' && itemId ? itemId : '');
  const agent = agents.find((a) => a.id === agentId);
  if (!agent) return null;

  const theCase = itemId ? cases.find((c) => c.customerId === itemId) : undefined;
  const isFinance = agent.id === 'finance';
  const quickReplies = isFinance && booking ? booking.quickReplies : agent.quickReplies;
  const threadId = isFinance && booking ? `booking:${booking.id}` : `agent:${agent.id}`;

  return (
    <Popup label={agent.name} onClose={overlay.close}>
      <header className="flex items-start gap-4 px-6 pb-3 pt-5">
        <Portrait spec={agent.portrait} size={56} label={agent.name} />
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">
            {agent.name}
            <StatusChip status={agent.status} />
          </h1>
          <p className="mt-0.5 text-xs text-fg-muted">{agent.tagline}</p>
        </div>
        <CloseButton onClick={overlay.close} />
      </header>
      <div className="grid min-h-0 flex-1 gap-4 px-6 pb-6 lg:h-[34rem] lg:grid-cols-[22rem_1fr]">
        <ChatPanel threadId={threadId} agentId={agent.id} agentName={agent.name} quickReplies={quickReplies} />
        {isFinance ? (
          booking ? <CashflowView booking={booking} agentId="finance" /> : <BookingList />
        ) : theCase ? (
          <CaseView agent={agent} theCase={theCase} />
        ) : (
          <CaseList agent={agent} />
        )}
      </div>
    </Popup>
  );
}
