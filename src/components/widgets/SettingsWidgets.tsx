import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOverlay } from '@/app/useOverlay';
import type { UserProfile } from '@/contracts';
import { actions, useAgents, useSettings } from '@/data/hooks';
import { Portrait } from '../Portrait';
import { Button, Chip, Toggle, WidgetCard } from '../Primitives';
import { useToast } from '../Toast';

export function YourTeamWidget({ className }: { className?: string }) {
  const { t } = useTranslation();
  const agents = useAgents() ?? [];
  return (
    <WidgetCard title={t('settings.teamTitle')} subtitle={t('settings.teamSubtitle')} className={className}>
      <ul className="divide-y divide-border">
        {agents.map((a) => (
          <li key={a.id} className="flex min-h-16 items-center gap-3 py-2.5">
            <Portrait spec={a.portrait} size={44} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{a.name}</span>
              <span className="block text-xs text-fg-muted">{t(`settings.autonomy.${a.id}`)}</span>
            </span>
            <Toggle checked={a.enabled} label={t('settings.switchLabel', { name: a.name })} onChange={(v) => void actions.setAgentEnabled(a.id, v)} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-fg-muted">{t('settings.teamFootnote')}</p>
    </WidgetCard>
  );
}

const FIELDS: { key: keyof Omit<UserProfile, 'alertOnDecision'>; label: string; type?: string }[] = [
  { key: 'fullName', label: 'settings.fullName' },
  { key: 'email', label: 'settings.email', type: 'email' },
  { key: 'phone', label: 'settings.phone', type: 'tel' },
  { key: 'agency', label: 'settings.agency' },
];

export function UserSettingsWidget({ className }: { className?: string }) {
  const { t } = useTranslation();
  const settings = useSettings();
  const toast = useToast();
  const [draft, setDraft] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (settings && draft === null) setDraft(settings.profile);
  }, [settings, draft]);

  if (!draft || !settings) return null;
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings.profile);

  const save = async () => {
    await actions.saveSettings({ profile: draft });
    toast(t('settings.saved'));
  };

  const field = 'mt-1 min-h-11 w-full rounded-tile border border-border bg-surface-tint px-3 text-sm text-fg';

  return (
    <WidgetCard
      title={t('settings.userTitle')}
      subtitle={t('settings.userSubtitle')}
      className={className}
      actions={
        <Button variant="secondary" size="sm" disabled={!dirty} onClick={() => void save()}>
          {t('settings.save')}
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="text-xs text-fg-muted">
            {t(f.label)}
            <input type={f.type ?? 'text'} value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} className={field} />
          </label>
        ))}
        <label className="text-xs text-fg-muted">
          {t('settings.currency')}
          <select value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} className={field}>
            {['Euro (€)', 'US dollar ($)', 'UAE dirham (AED)', 'Pound sterling (£)'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-fg-muted">
          {t('settings.timeZone')}
          <select value={draft.timeZone} onChange={(e) => setDraft({ ...draft, timeZone: e.target.value })} className={field}>
            {['Dubai (GMT+4)', 'London (GMT+0)', 'Mumbai (GMT+5:30)', 'Tokyo (GMT+9)'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{t('settings.alertTitle')}</p>
          <p className="text-xs text-fg-muted">{t('settings.alertHint')}</p>
        </div>
        <Toggle checked={draft.alertOnDecision} label={t('settings.alertTitle')} onChange={(v) => setDraft({ ...draft, alertOnDecision: v })} />
      </div>
    </WidgetCard>
  );
}

export function TemplatesWidget({ className }: { className?: string }) {
  const { t } = useTranslation();
  const settings = useSettings();
  const overlay = useOverlay();
  const cards = [
    { which: 'invoice' as const, badge: 'PDF', badgeClass: 'bg-tone-3', lines: ['settings.invoiceLine1', 'settings.invoiceLine2', 'settings.invoiceLine3'], edited: settings?.templatesEdited.invoice },
    { which: 'itinerary' as const, badge: 'IT', badgeClass: 'bg-tone-2', lines: ['settings.itineraryLine1', 'settings.itineraryLine2', 'settings.itineraryLine3'], edited: settings?.templatesEdited.itinerary },
  ];
  return (
    <WidgetCard title={t('settings.templatesTitle')} subtitle={t('settings.templatesSubtitle')} className={className}>
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.which} className="flex flex-col rounded-card border border-border bg-surface-tint p-4">
            <div className="flex items-center gap-3">
              <span className={`flex size-10 items-center justify-center rounded-tile text-xs font-semibold text-fg-inverse ${c.badgeClass}`}>{c.badge}</span>
              <span>
                <span className="block text-sm font-semibold">{t(`settings.${c.which}Template`)}</span>
                <span className="block text-xs text-fg-muted">{t('settings.lastEdited', { date: c.edited })}</span>
              </span>
            </div>
            <ul className="mt-3 flex-1 space-y-1 text-xs text-fg-subtle">
              {c.lines.map((l) => (
                <li key={l}>{t(l)}</li>
              ))}
            </ul>
            <Button size="sm" className="mt-4 self-start" onClick={() => overlay.open({ kind: 'template', which: c.which })}>
              {t('settings.editTemplate')}
            </Button>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

export function WhatsAppWidget({ className }: { className?: string }) {
  const { t } = useTranslation();
  const settings = useSettings();
  const overlay = useOverlay();
  const connected = settings?.whatsapp.connected ?? false;
  return (
    <WidgetCard title={t('settings.whatsappTitle')} subtitle={t('settings.whatsappSubtitle')} className={className}>
      <Chip tone={connected ? 'positive' : 'warning'} className="self-start">
        {connected ? t('settings.connected') : t('settings.notConnected')}
      </Chip>
      <p className="mt-3 flex-1 text-xs text-fg-subtle">{connected ? t('settings.whatsappConnectedBody', { number: settings?.whatsapp.number }) : t('settings.whatsappBody')}</p>
      <Button size="sm" variant={connected ? 'secondary' : 'primary'} className="mt-4 self-start" onClick={() => overlay.open({ kind: 'whatsapp' })}>
        {connected ? t('settings.manageWhatsapp') : t('settings.connectWhatsapp')}
      </Button>
    </WidgetCard>
  );
}

export function EmailWidget({ className }: { className?: string }) {
  const { t } = useTranslation();
  const settings = useSettings();
  const overlay = useOverlay();
  const connected = settings?.email.connected ?? false;
  return (
    <WidgetCard title={t('settings.emailTitle')} subtitle={t('settings.emailSubtitle')} className={className}>
      <Chip tone={connected ? 'positive' : 'warning'} className="self-start">
        {connected ? t('settings.connected') : t('settings.notConnected')}
      </Chip>
      {connected && <p className="mt-3 text-sm font-semibold">{settings?.email.address}</p>}
      <p className="mt-2 flex-1 text-xs text-fg-subtle">{t('settings.emailBody')}</p>
      <Button size="sm" variant="secondary" className="mt-4 self-start" onClick={() => overlay.open({ kind: 'email' })}>
        {connected ? t('settings.manageEmail') : t('settings.connectEmail')}
      </Button>
    </WidgetCard>
  );
}
