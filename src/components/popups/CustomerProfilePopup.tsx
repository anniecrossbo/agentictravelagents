import { type FormEvent, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronLeft, ChevronRight, ExternalLink, FileText, Plus, TriangleAlert } from 'lucide-react';
import { useOverlay } from '@/app/useOverlay';
import type { ActivityStep, AgentId, Customer, CustomerBooking, Enquiry, Tone } from '@/contracts';
import { actions, useAgents, useCustomer } from '@/data/hooks';
import { activityState } from '@/lib/customers';
import type { ProfileTab } from '@/lib/overlay';
import { Popup } from '../Popup';
import { Portrait } from '../Portrait';
import { BackButton, Button, Chip, CloseButton, CustomerAvatar, EmptyNote, Eyebrow, FilterChips, InlineAddField, StatusChip, cx } from '../Primitives';
import { useToast } from '../Toast';

const TABS: ProfileTab[] = ['team', 'travel', 'notes', 'enquiries', 'timeline', 'documents'];
const AGENT_ORDER: AgentId[] = ['sales', 'designer', 'supplier', 'reservations', 'finance', 'marketing'];

function ActivityCard({ step }: { step: ActivityStep }) {
  const { t } = useTranslation();
  const idle = step.state === 'not-started';
  return (
    <li className={cx('rounded-tile border p-3', idle ? 'border-dashed border-border-strong bg-surface-tint' : 'border-border bg-surface shadow-card')}>
      <Eyebrow tone="muted">{step.stage}</Eyebrow>
      <p className={cx('mt-0.5 text-sm font-semibold', idle && 'text-fg-muted')}>{step.title}</p>
      <p className="text-xs text-fg-muted">{step.detail}</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs">
        {step.state === 'done' && (
          <>
            <span className="flex size-4 items-center justify-center rounded-chip bg-accent text-fg-inverse">
              <Check size={11} aria-hidden />
            </span>
            {step.when ?? t('plan.done')}
          </>
        )}
        {step.state === 'needs-you' && (
          <>
            <TriangleAlert size={14} aria-hidden className="text-danger" />
            <span className="text-danger">{t('plan.needs-you')}</span>
          </>
        )}
        {step.state === 'working' && (
          <>
            <span className="size-3.5 rounded-pill border-2 border-accent" />
            {t('plan.working')}
          </>
        )}
        {idle && (
          <>
            <span className="size-3.5 rounded-pill border border-dashed border-fg-muted" />
            <span className="text-fg-muted">{t('plan.not-started')}</span>
          </>
        )}
      </p>
    </li>
  );
}

function TeamActivity({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  const agents = useAgents() ?? [];
  const enquiry = customer.enquiries[0];
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <h3 className="text-lg font-semibold">{t('profile.teamTitle', { trip: enquiry?.title })}</h3>
      <p className="text-xs text-fg-muted">{t('profile.teamSubtitle', { name: customer.name.split(' ')[0] })}</p>
      <div className="mt-4 flex divide-x divide-border overflow-x-auto">
        {AGENT_ORDER.map((id) => {
          const agent = agents.find((a) => a.id === id);
          const steps = customer.activity[id] ?? [];
          if (!agent) return null;
          const state = activityState(steps);
          return (
            <section key={id} aria-label={agent.name} className="min-w-[13rem] flex-1 px-3 first:pl-0 last:pr-0">
              <div className="mb-3 flex items-center gap-2 rounded-card border border-border p-2.5">
                <Portrait spec={agent.portrait} size={34} />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold leading-tight">{agent.name}</span>
                  <StatusChip status={state} />
                </span>
              </div>
              <ul className="space-y-2.5">
                {steps.map((s) => (
                  <ActivityCard key={s.title} step={s} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function NotesTab({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const submit = () => {
    void actions.addNote(customer.id, text.trim());
    setText('');
  };
  return (
    <div className="space-y-3">
      <InlineAddField value={text} onChange={setText} onSubmit={submit} placeholder={t('profile.addNote')} buttonLabel={t('common.add')} />
      <ul className="space-y-2">
        {customer.notes.map((n) => (
          <li key={n.id} className="rounded-card border border-border bg-surface p-3.5">
            <p className="text-sm">{n.text}</p>
            <p className="mt-1.5 text-xs text-fg-muted">
              {n.author} · {n.at}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TabCard({ title, subtitle, actions, children }: { title: string; subtitle: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-xs text-fg-muted">{subtitle}</p>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SectionHeading({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <span className="text-xs text-fg-muted">{note}</span>
    </div>
  );
}

function TravelProfileTab({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [traveller, setTraveller] = useState('');
  const [role, setRole] = useState('partner');
  const submit = () => {
    void actions.addPreference(customer.id, text.trim());
    setText('');
  };
  const addTraveller = () => {
    void actions.addTraveller(customer.id, { name: traveller.trim(), role: t(`profile.role.${role}`) });
    setTraveller('');
  };
  return (
    <TabCard title={t('profile.travelTitle')} subtitle={t('profile.travelSubtitle', { name: customer.name })}>
      <SectionHeading title={t('profile.prefsTitle')} note={t('profile.prefsSaved', { count: customer.preferences.length })} />
      <ul className="divide-y divide-border rounded-card border border-border">
        {customer.preferences.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 text-sm">
            <span className="min-w-0 flex-1">{p.text}</span>
            {p.source === 'noticed' ? (
              <>
                <Chip tone="warning">{p.note ?? t('profile.prefReview')}</Chip>
                <button type="button" onClick={() => void actions.resolvePreference(customer.id, p.id, 'confirm')} className="min-h-11 px-2 text-xs font-semibold text-brand hover:underline">
                  {t('profile.prefConfirm')}
                </button>
                <button type="button" onClick={() => void actions.resolvePreference(customer.id, p.id, 'dismiss')} className="min-h-11 px-2 text-xs text-fg-muted hover:underline">
                  {t('profile.prefDismiss')}
                </button>
              </>
            ) : (
              <Chip>{t(p.source === 'customer' ? 'profile.prefCustomer' : 'profile.prefAgency')}</Chip>
            )}
          </li>
        ))}
        {customer.preferences.length === 0 && (
          <li className="px-4 py-3">
            <EmptyNote>{t('profile.noPrefs')}</EmptyNote>
          </li>
        )}
      </ul>
      <div className="mt-3">
        <InlineAddField value={text} onChange={setText} onSubmit={submit} placeholder={t('profile.prefPlaceholder')} buttonLabel={t('common.add')} />
      </div>

      <div className="mt-6">
        <SectionHeading title={t('profile.partyTitle')} note={t('profile.partyNote')} />
        <ul className="divide-y divide-border rounded-card border border-border">
          {customer.party.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <CustomerAvatar initials={m.initials} tone={m.tone} size="sm" />
              <span className="min-w-0 flex-1">{m.name}</span>
              <Chip tone={m.role === 'Lead traveller' ? 'positive' : 'neutral'}>{m.role}</Chip>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <InlineAddField value={traveller} onChange={setTraveller} onSubmit={addTraveller} placeholder={t('profile.partyPlaceholder')} buttonLabel={t('common.add')}>
            <select value={role} onChange={(e) => setRole(e.target.value)} aria-label={t('profile.roleLabel')} className="min-h-10 shrink-0 cursor-pointer rounded-pill border border-border bg-surface px-3 text-xs font-medium">
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`profile.role.${r}`)}
                </option>
              ))}
            </select>
          </InlineAddField>
        </div>
      </div>
    </TabCard>
  );
}

const ROLES = ['partner', 'child', 'parent', 'friend', 'other'] as const;

type Adding = { kind: 'enquiry' } | { kind: 'booking' };

const fieldClass = 'min-h-11 w-full rounded-tile border border-border bg-surface px-3 text-sm outline-none placeholder:text-fg-muted';
const labelClass = 'block text-xs text-fg-muted';

function FormShell({ title, canSave, onSubmit, onCancel, children }: { title: string; canSave: boolean; onSubmit: () => void; onCancel: () => void; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSave) onSubmit();
      }}
      className="rounded-card border border-brand bg-brand-tint p-4"
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          {t('profile.formCancel')}
        </Button>
        <Button type="submit" size="sm" disabled={!canSave}>
          {t('profile.formSave')}
        </Button>
      </div>
    </form>
  );
}

function TripForm({ customerId, kind, onDone }: { customerId: string; kind: 'enquiry' | 'booking'; onDone: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ title: '', location: '', dates: '', nights: '', amount: '' });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const save = () => {
    const base = { title: form.title.trim(), location: form.location.trim(), dates: form.dates.trim(), nights: Number(form.nights) || 0 };
    if (kind === 'enquiry') void actions.addEnquiry(customerId, base);
    else void actions.addBooking(customerId, { ...base, amount: form.amount.trim() || t('profile.amountTbc') });
    onDone();
  };
  return (
    <FormShell title={t(kind === 'enquiry' ? 'profile.newEnquiry' : 'profile.newBooking')} canSave={!!form.title.trim()} onSubmit={save} onCancel={onDone}>
      <label className={cx(labelClass, 'sm:col-span-2')}>
        {t('profile.formTitle')}
        <input value={form.title} onChange={set('title')} required aria-required="true" className={cx(fieldClass, 'mt-1')} />
      </label>
      <label className={labelClass}>
        {t('profile.formWhere')}
        <input value={form.location} onChange={set('location')} className={cx(fieldClass, 'mt-1')} />
      </label>
      <label className={labelClass}>
        {t('profile.formDates')}
        <input value={form.dates} onChange={set('dates')} placeholder={t('profile.formDatesHint')} className={cx(fieldClass, 'mt-1')} />
      </label>
      <label className={labelClass}>
        {t('profile.formNights')}
        <input value={form.nights} onChange={set('nights')} inputMode="numeric" className={cx(fieldClass, 'mt-1')} />
      </label>
      {kind === 'booking' && (
        <label className={labelClass}>
          {t('profile.formPrice')}
          <input value={form.amount} onChange={set('amount')} placeholder={t('profile.formPriceHint')} className={cx(fieldClass, 'mt-1')} />
        </label>
      )}
    </FormShell>
  );
}

type ItinerarySource = { kind: 'enquiry' | 'booking'; id: string };

/** View the itinerary when one exists, otherwise start one. */
function ItineraryAction({ customerId, source, itineraryId, variant = 'primary' }: { customerId: string; source: ItinerarySource; itineraryId?: string; variant?: 'primary' | 'secondary' }) {
  const { t } = useTranslation();
  const overlay = useOverlay();
  const go = async () => {
    const id = itineraryId ?? (await actions.createItinerary(customerId, source));
    if (id) overlay.open({ kind: 'itinerary', id });
  };
  return (
    <Button size="sm" variant={variant} onClick={() => void go()}>
      {t(itineraryId ? 'profile.viewItinerary' : 'profile.createItinerary')}
    </Button>
  );
}

interface DetailModel {
  badge: string;
  title: string;
  status: string;
  tone: Tone;
  amount?: string;
  rows: [string, string][];
  summary: string;
  source: ItinerarySource;
  itineraryId?: string;
  financeBookingId?: string;
  invoiceIds?: string[];
  extra?: ReactNode;
}

function DetailView({ customer, model, onBack }: { customer: Customer; model: DetailModel; onBack: () => void }) {
  const { t } = useTranslation();
  const overlay = useOverlay();
  return (
    <section className="rounded-card border border-border bg-surface p-5">
      <button type="button" onClick={onBack} className="-ml-2 flex min-h-11 items-center gap-1 rounded-pill px-2 text-xs font-medium text-brand hover:bg-surface-tint">
        <ChevronLeft size={16} aria-hidden />
        {t('profile.detailBack')}
      </button>
      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2">
            <Chip>{model.badge}</Chip>
            <Chip tone={model.tone}>{model.status}</Chip>
          </p>
          <h2 className="mt-2 text-lg font-semibold">{model.title}</h2>
          <p className="text-xs text-fg-muted">{t('profile.detailFor', { name: customer.name })}</p>
        </div>
        {model.amount && <p className="text-xl font-semibold">{model.amount}</p>}
      </div>
      <dl className="mt-4 grid gap-3 rounded-card bg-surface-tint p-4 sm:grid-cols-3">
        {model.rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-fg-muted">{k}</dt>
            <dd className="text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm">{model.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <ItineraryAction customerId={customer.id} source={model.source} itineraryId={model.itineraryId} />
        {model.financeBookingId && (
          <Button size="sm" variant="secondary" onClick={() => overlay.open({ kind: 'agent', agentId: 'finance', itemId: model.financeBookingId })}>
            {t('profile.viewBooking')}
          </Button>
        )}
        {(model.invoiceIds ?? []).map((id) => (
          <Button key={id} size="sm" variant="secondary" onClick={() => overlay.open({ kind: 'invoice', id })}>
            {t('profile.viewInvoice')}
          </Button>
        ))}
        {model.extra}
      </div>
    </section>
  );
}

type Selection = { type: 'enquiry'; id: string } | { type: 'booking'; id: string };
type ListFilter = 'all' | 'enquiries' | 'bookings';

function CardShell({ customerId, source, itineraryId, children }: { customerId: string; source: ItinerarySource; itineraryId?: string; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <li className="overflow-hidden rounded-card border border-border bg-surface">
      {children}
      <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-tint px-4 py-2">
        <span className="text-xs text-fg-muted">{t(itineraryId ? 'profile.hasItinerary' : 'profile.noItineraryYet')}</span>
        <ItineraryAction customerId={customerId} source={source} itineraryId={itineraryId} variant="secondary" />
      </div>
    </li>
  );
}

function EnquiryCard({ customerId, enquiry, onOpen }: { customerId: string; enquiry: Enquiry; onOpen: (s: Selection) => void }) {
  const { t } = useTranslation();
  return (
    <CardShell customerId={customerId} source={{ kind: 'enquiry', id: enquiry.id }} itineraryId={enquiry.itineraryId}>
      <button type="button" onClick={() => onOpen({ type: 'enquiry', id: enquiry.id })} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-tint">
        <Chip tone="brand">{t('profile.kindEnquiry')}</Chip>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{enquiry.title}</span>
          <span className="block truncate text-xs text-fg-muted">{t('profile.tripMeta', { ref: enquiry.ref, dates: enquiry.dates || '—', nights: enquiry.nights })}</span>
          <span className="block truncate text-xs text-fg-muted">{enquiry.location}</span>
        </span>
        <Chip tone={enquiry.tone}>{enquiry.status}</Chip>
        <ChevronRight size={16} aria-hidden className="shrink-0 text-fg-muted" />
      </button>
    </CardShell>
  );
}

function EnquiriesBookingsTab({ customer, adding, setAdding }: { customer: Customer; adding: Adding | undefined; setAdding: (a: Adding | undefined) => void }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ListFilter>('all');
  const [selected, setSelected] = useState<Selection | undefined>(undefined);
  const { enquiries, bookings } = customer;

  if (selected) {
    const back = () => setSelected(undefined);
    let model: DetailModel | undefined;
    if (selected.type === 'booking') {
      const b: CustomerBooking | undefined = bookings.find((x) => x.id === selected.id);
      if (b)
        model = {
          badge: t('profile.kindBooking'), title: b.title, status: b.status, tone: b.tone, amount: b.amount, summary: b.summary,
          rows: [[t('profile.detailRef'), b.ref], [t('profile.detailDates'), b.dates || '—'], [t('profile.detailNights'), b.nights ? String(b.nights) : '—'], [t('profile.detailWhere'), b.location || '—'], [t('profile.detailWho'), b.travellers], [t('profile.detailPrice'), b.amount]],
          source: { kind: 'booking', id: b.id }, itineraryId: b.itineraryId, financeBookingId: b.financeBookingId, invoiceIds: b.invoiceIds,
        };
    } else {
      const e = enquiries.find((x) => x.id === selected.id);
      if (e)
        model = {
          badge: t('profile.kindEnquiry'), title: e.title, status: e.status, tone: e.tone, summary: e.summary,
          rows: [[t('profile.detailRef'), e.ref], [t('profile.detailDates'), e.dates || '—'], [t('profile.detailNights'), e.nights ? String(e.nights) : '—'], [t('profile.detailWhere'), e.location || '—'], [t('profile.detailWho'), e.travellers]],
          source: { kind: 'enquiry', id: e.id }, itineraryId: e.itineraryId,
          extra:
            e.status === 'Booked' ? undefined : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  void actions.convertToBooking(customer.id, e.id);
                  setSelected(undefined);
                  setFilter('bookings');
                }}
              >
                {t('profile.convert')}
              </Button>
            ),
        };
    }
    if (model) return <DetailView customer={customer} model={model} onBack={back} />;
  }

  return (
    <TabCard
      title={t('profile.enquiriesTitle')}
      subtitle={`${t('profile.enquiryCount', { count: enquiries.length })} · ${t('profile.bookingCount', { count: bookings.length })}`}
      actions={
        <>
          <Button size="sm" variant="secondary" onClick={() => setAdding({ kind: 'enquiry' })}>
            <Plus size={14} aria-hidden />
            {t('profile.addEnquiry')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setAdding({ kind: 'booking' })}>
            <Plus size={14} aria-hidden />
            {t('profile.addBooking')}
          </Button>
        </>
      }
    >
      {(adding?.kind === 'enquiry' || adding?.kind === 'booking') && (
        <div className="mb-4">
          <TripForm key={adding.kind} customerId={customer.id} kind={adding.kind} onDone={() => setAdding(undefined)} />
        </div>
      )}
      <div className="mb-3">
        <FilterChips<ListFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: t('profile.filterAll', { count: enquiries.length + bookings.length }) },
            { key: 'enquiries', label: t('profile.filterEnquiries', { count: enquiries.length }) },
            { key: 'bookings', label: t('profile.filterBookings', { count: bookings.length }) },
          ]}
        />
      </div>
      {enquiries.length + bookings.length === 0 && <EmptyNote>{t('profile.noEnquiries')}</EmptyNote>}
      <ul className="space-y-3">
        {filter !== 'bookings' && enquiries.map((e) => <EnquiryCard key={e.id} customerId={customer.id} enquiry={e} onOpen={setSelected} />)}
        {filter !== 'enquiries' &&
          bookings.map((b) => (
            <CardShell key={b.id} customerId={customer.id} source={{ kind: 'booking', id: b.id }} itineraryId={b.itineraryId}>
              <button type="button" onClick={() => setSelected({ type: 'booking', id: b.id })} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-tint">
                <Chip tone="positive">{t('profile.kindBooking')}</Chip>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{b.title}</span>
                  <span className="block truncate text-xs text-fg-muted">{t('profile.tripMeta', { ref: b.ref, dates: b.dates || '—', nights: b.nights })}</span>
                  <span className="block truncate text-xs text-fg-muted">{b.location}</span>
                </span>
                <span className="text-sm font-semibold">{b.amount}</span>
                <Chip tone={b.tone}>{b.status}</Chip>
                <ChevronRight size={16} aria-hidden className="shrink-0 text-fg-muted" />
              </button>
            </CardShell>
          ))}
      </ul>
    </TabCard>
  );
}

const timelineDot = { done: 'bg-accent', waiting: 'bg-warning-dot', received: 'bg-fg-subtle' } as const;

function TimelineTab({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  const agents = useAgents() ?? [];
  const entries = [...customer.timeline].reverse();
  return (
    <TabCard title={t('profile.timelineTitle')} subtitle={t('profile.timelineSubtitle', { name: customer.name })}>
      <ol className="relative rounded-card border border-border bg-surface px-5 py-5">
        <span aria-hidden className="absolute bottom-8 left-[1.55rem] top-8 w-px bg-border-strong" />
        {entries.map((e, i) => {
          const agent = agents.find((a) => a.id === e.agentId);
          return (
            <li key={e.id} className={cx('relative pl-7', i < entries.length - 1 && 'pb-5')}>
              <span aria-hidden className={cx('absolute left-0 top-1 size-2.5 rounded-pill', timelineDot[e.state ?? 'done'])} />
              <p className="text-xs text-fg-muted">{e.at}</p>
              <p className="text-sm font-semibold">{e.text}</p>
              {agent && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-fg-muted">
                  <Portrait spec={agent.portrait} size={18} />
                  {agent.name}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </TabCard>
  );
}

export function CustomerProfilePopup({ customerId, tab }: { customerId: string; tab: ProfileTab }) {
  const { t } = useTranslation();
  const overlay = useOverlay();
  const toast = useToast();
  const customer = useCustomer(customerId);
  const [adding, setAdding] = useState<Adding | undefined>(undefined);
  if (!customer) return null;
  const enquiry = customer.enquiries[0];

  const proto = (key: string) => () => toast(t(key));

  return (
    <Popup label={customer.name} onClose={overlay.close} tone="surface" width="max-w-[1280px]">
      <header className="flex items-start gap-3 px-6 pb-3 pt-5">
        {overlay.hasFrom && <BackButton onClick={overlay.back} />}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <p className="text-xs text-fg-muted">{customer.location}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={proto('profile.protoEdit')}>
          {t('profile.edit')}
        </Button>
        <Button variant="secondary" size="sm" onClick={proto('profile.protoMessage')}>
          {t('profile.message')}
        </Button>
        <CloseButton onClick={overlay.close} />
      </header>
      <div className="grid min-h-0 flex-1 gap-4 px-6 pb-6 lg:h-[36rem] lg:grid-cols-[17rem_1fr]">
        <aside className="overflow-y-auto rounded-card border border-border bg-surface p-4">
          <Eyebrow tone="muted">{t('profile.contact')}</Eyebrow>
          <p className="mt-1 text-sm">{customer.phone}</p>
          <p className="text-sm text-fg-muted">{customer.email}</p>
          {enquiry && (
            <div className="mt-4 rounded-card bg-brand-soft p-3.5">
              <Eyebrow tone="muted">{t('profile.currentEnquiry')}</Eyebrow>
              <p className="mt-1 font-semibold">{enquiry.title}</p>
              <p className="text-xs text-fg-muted">{t('profile.enquiryMeta', { dates: enquiry.dates, nights: enquiry.nights, status: enquiry.status })}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => {
                  void (async () => {
                    const id = customer.itineraryId ?? (await actions.createItinerary(customer.id, { kind: 'enquiry', id: enquiry.id }));
                    if (id) overlay.open({ kind: 'itinerary', id });
                  })();
                }}
              >
                {t('profile.openEnquiry')}
              </Button>
            </div>
          )}
          <div className="mt-4 border-t border-border pt-3">
            <Eyebrow tone="muted">{t('profile.history')}</Eyebrow>
            <p className="mt-1 text-sm text-fg-subtle">{customer.history}</p>
          </div>
        </aside>
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <div role="tablist" className="flex gap-1 overflow-x-auto rounded-pill bg-surface-sunken p-1">
            {TABS.map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => overlay.swap({ kind: 'profile', customerId, tab: k })}
                className={cx('min-h-9 flex-1 whitespace-nowrap rounded-pill px-3 text-xs font-medium', tab === k ? 'bg-brand text-fg-inverse' : 'text-fg-muted hover:text-fg')}
              >
                {t(`profile.tab.${k}`)}
              </button>
            ))}
          </div>
          {tab === 'team' && (
            <div className="rounded-card bg-brand-tint p-4">
              <Eyebrow>{t('profile.overviewLabel')}</Eyebrow>
              <p className="mt-1 text-sm">{customer.overview}</p>
            </div>
          )}

          {tab === 'team' && <TeamActivity customer={customer} />}

          {tab === 'travel' && <TravelProfileTab customer={customer} />}

          {tab === 'notes' && <NotesTab customer={customer} />}

          {tab === 'enquiries' && <EnquiriesBookingsTab customer={customer} adding={adding} setAdding={setAdding} />}

          {tab === 'timeline' && <TimelineTab customer={customer} />}

          {tab === 'documents' && (
            <ul className="space-y-2">
              {customer.documents.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    disabled={!d.invoiceId}
                    onClick={() => d.invoiceId && overlay.open({ kind: 'invoice', id: d.invoiceId })}
                    className="flex min-h-14 w-full items-center gap-3 rounded-card border border-border bg-surface p-3.5 text-left enabled:hover:bg-surface-tint"
                  >
                    <FileText size={18} aria-hidden className="text-brand" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{d.name}</span>
                      <span className="block text-xs text-fg-muted">
                        {d.kind} · {d.added}
                      </span>
                    </span>
                    {d.invoiceId && <ExternalLink size={14} aria-hidden className="text-brand" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Popup>
  );
}
