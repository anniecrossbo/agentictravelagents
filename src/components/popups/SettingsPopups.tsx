import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { useOverlay } from '@/app/useOverlay';
import type { InvoiceTemplate, ItineraryTemplate } from '@/contracts';
import { actions, useInvoice, useSettings } from '@/data/hooks';
import { Popup } from '../Popup';
import { Button, Chip, CloseButton, Eyebrow, Toggle } from '../Primitives';
import { useToast } from '../Toast';
import { InvoiceDocument } from './InvoiceDocument';

const input = 'mt-1 min-h-11 w-full rounded-tile border border-border bg-surface-tint px-3 text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs text-fg-muted">
      {label}
      {children}
    </label>
  );
}

function EditorShell({ title, subtitle, onSave, dirty, left, right }: { title: string; subtitle: string; onSave: () => void; dirty: boolean; left: React.ReactNode; right: React.ReactNode }) {
  const { t } = useTranslation();
  const overlay = useOverlay();
  return (
    <Popup label={title} onClose={overlay.close}>
      <header className="flex flex-wrap items-start gap-3 px-6 pb-3 pt-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-xs text-fg-muted">{subtitle}</p>
        </div>
        <Button size="sm" disabled={!dirty} onClick={onSave}>
          {t('settings.saveTemplate')}
        </Button>
        <CloseButton onClick={overlay.close} />
      </header>
      <div className="grid min-h-0 flex-1 gap-4 px-6 pb-6 lg:h-[36rem] lg:grid-cols-[22rem_1fr]">
        <div className="space-y-3 overflow-y-auto rounded-card bg-surface p-4 shadow-card">{left}</div>
        <div className="overflow-y-auto rounded-card bg-surface-sunken p-4">
          <Eyebrow tone="muted">{t('settings.livePreview')}</Eyebrow>
          <div className="mt-2">{right}</div>
        </div>
      </div>
    </Popup>
  );
}

export function InvoiceTemplatePopup() {
  const { t } = useTranslation();
  const settings = useSettings();
  const toast = useToast();
  const sample = useInvoice('inv-aisha');
  const [draft, setDraft] = useState<InvoiceTemplate | null>(null);
  useEffect(() => {
    if (settings && !draft) setDraft(settings.invoiceTemplate);
  }, [settings, draft]);
  if (!draft || !settings) return null;
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings.invoiceTemplate);
  const set = <K extends keyof InvoiceTemplate>(k: K, v: InvoiceTemplate[K]) => setDraft({ ...draft, [k]: v });

  const save = async () => {
    await actions.saveSettings({ invoiceTemplate: draft, templatesEdited: { ...settings.templatesEdited, invoice: t('settings.today') } });
    toast(t('settings.templateSaved'));
  };

  return (
    <EditorShell
      title={t('settings.invoiceTemplate')}
      subtitle={t('settings.invoiceEditorSubtitle')}
      dirty={dirty}
      onSave={() => void save()}
      left={
        <>
          <Field label={t('settings.agencyName')}>
            <input className={input} value={draft.agencyName} onChange={(e) => set('agencyName', e.target.value)} />
          </Field>
          <Field label={t('settings.address')}>
            <input className={input} value={draft.address} onChange={(e) => set('address', e.target.value)} />
          </Field>
          <Field label={t('settings.contact')}>
            <input className={input} value={draft.contact} onChange={(e) => set('contact', e.target.value)} />
          </Field>
          <Field label={t('settings.bankDetails')}>
            <textarea rows={2} className={`${input} resize-none py-2`} value={draft.bankDetails} onChange={(e) => set('bankDetails', e.target.value)} />
          </Field>
          <Field label={t('settings.numbering')}>
            <input className={input} value={draft.numbering} onChange={(e) => set('numbering', e.target.value)} />
          </Field>
          <Field label={t('settings.footer')}>
            <textarea rows={3} className={`${input} resize-none py-2`} value={draft.footer} onChange={(e) => set('footer', e.target.value)} />
          </Field>
        </>
      }
      right={sample ? <InvoiceDocument invoice={sample} template={draft} /> : null}
    />
  );
}

export function ItineraryTemplatePopup() {
  const { t } = useTranslation();
  const settings = useSettings();
  const toast = useToast();
  const [draft, setDraft] = useState<ItineraryTemplate | null>(null);
  useEffect(() => {
    if (settings && !draft) setDraft(settings.itineraryTemplate);
  }, [settings, draft]);
  if (!draft || !settings) return null;
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings.itineraryTemplate);
  const set = <K extends keyof ItineraryTemplate>(k: K, v: ItineraryTemplate[K]) => setDraft({ ...draft, [k]: v });

  const save = async () => {
    await actions.saveSettings({ itineraryTemplate: draft, templatesEdited: { ...settings.templatesEdited, itinerary: t('settings.today') } });
    toast(t('settings.templateSaved'));
  };

  return (
    <EditorShell
      title={t('settings.itineraryTemplate')}
      subtitle={t('settings.itineraryEditorSubtitle')}
      dirty={dirty}
      onSave={() => void save()}
      left={
        <>
          <Field label={t('settings.opening')}>
            <textarea rows={3} className={`${input} resize-none py-2`} value={draft.opening} onChange={(e) => set('opening', e.target.value)} />
          </Field>
          <Field label={t('settings.signOff')}>
            <input className={input} value={draft.signOff} onChange={(e) => set('signOff', e.target.value)} />
          </Field>
          <Field label={t('settings.estimateNote')}>
            <textarea rows={2} className={`${input} resize-none py-2`} value={draft.estimateNote} onChange={(e) => set('estimateNote', e.target.value)} />
          </Field>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">{t('settings.showPictures')}</span>
            <Toggle checked={draft.showPictures} label={t('settings.showPictures')} onChange={(v) => set('showPictures', v)} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">{t('settings.showPrices')}</span>
            <Toggle checked={draft.showPrices} label={t('settings.showPrices')} onChange={(v) => set('showPrices', v)} />
          </div>
        </>
      }
      right={
        <article className="mx-auto max-w-xl rounded-tile bg-surface p-6 shadow-card">
          <p className="text-sm">{draft.opening}</p>
          <div className="mt-4 rounded-card border border-border p-4">
            <p className="text-xs font-semibold text-brand">{t('settings.previewDay')}</p>
            <p className="mt-1 text-sm font-semibold">{t('settings.previewStay')}</p>
            {draft.showPictures && <div className="mt-2 h-24 rounded-tile bg-linear-to-br from-scene-sky to-scene-sand" aria-hidden />}
            {draft.showPrices && <p className="mt-2 text-sm font-semibold">{t('settings.previewPrice')}</p>}
          </div>
          <p className="mt-3 text-xs text-fg-muted">{draft.estimateNote}</p>
          <p className="mt-4 text-sm">{draft.signOff}</p>
        </article>
      }
    />
  );
}

export function WhatsAppPopup() {
  const { t } = useTranslation();
  const overlay = useOverlay();
  const settings = useSettings();
  const toast = useToast();
  const [number, setNumber] = useState('+971 50 000 0000');
  if (!settings) return null;
  const connected = settings.whatsapp.connected;

  const connect = async () => {
    await actions.saveSettings({ whatsapp: { connected: true, number } });
    toast(t('settings.whatsappConnectedToast'));
  };
  const disconnect = async () => {
    await actions.saveSettings({ whatsapp: { connected: false, number: '' } });
  };

  return (
    <Popup label={t('settings.whatsappTitle')} onClose={overlay.close} width="max-w-[44rem]" tone="surface">
      <header className="flex items-start gap-3 px-6 pb-3 pt-5">
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">
            {t('settings.whatsappTitle')}
            <Chip tone={connected ? 'positive' : 'warning'}>{connected ? t('settings.connected') : t('settings.notConnected')}</Chip>
          </h1>
          <p className="text-xs text-fg-muted">{t('settings.whatsappPopupSubtitle')}</p>
        </div>
        <CloseButton onClick={overlay.close} />
      </header>
      <div className="space-y-4 overflow-y-auto px-6 pb-6">
        {connected ? (
          <>
            <p className="flex items-center gap-2 rounded-tile bg-positive-soft p-4 text-sm text-positive">
              <Check size={16} aria-hidden />
              {t('settings.whatsappConnectedBody', { number: settings.whatsapp.number })}
            </p>
            <p className="text-sm text-fg-subtle">{t('settings.whatsappRules')}</p>
            <Button variant="secondary" onClick={() => void disconnect()}>
              {t('settings.disconnect')}
            </Button>
          </>
        ) : (
          <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
            <ol className="list-decimal space-y-3 pl-5 text-sm text-fg-subtle">
              <li>{t('settings.whatsappStep1')}</li>
              <li>{t('settings.whatsappStep2')}</li>
              <li>{t('settings.whatsappStep3')}</li>
              <li>
                <Field label={t('settings.whatsappNumber')}>
                  <input className={input} value={number} onChange={(e) => setNumber(e.target.value)} />
                </Field>
              </li>
            </ol>
            <div className="flex flex-col items-center gap-2">
              <svg viewBox="0 0 21 21" className="size-44 rounded-tile border border-border bg-surface p-2" role="img" aria-label={t('settings.qrLabel')}>
                {Array.from({ length: 21 * 21 }, (_, i) => {
                  const x = i % 21;
                  const y = Math.floor(i / 21);
                  const inFinder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
                  const fx = x % 14 > 6 ? x - 14 : x;
                  const fy = y % 14 > 6 ? y - 14 : y;
                  const ring = Math.max(Math.abs((fx < 0 ? fx + 14 : fx) - 3), Math.abs((fy < 0 ? fy + 14 : fy) - 3));
                  const on = inFinder ? ring !== 2 : (x * 7 + y * 13 + x * y) % 3 === 0;
                  return on ? <rect key={i} x={x} y={y} width="1" height="1" style={{ fill: 'var(--color-fg)' }} /> : null;
                })}
              </svg>
              <p className="text-center text-[0.65rem] text-fg-muted">{t('settings.qrHint')}</p>
            </div>
          </div>
        )}
        {!connected && (
          <div className="flex justify-end">
            {/* PROTO: no real WhatsApp pairing; this marks the number as connected. */}
            <Button onClick={() => void connect()}>{t('settings.scanned')}</Button>
          </div>
        )}
      </div>
    </Popup>
  );
}

export function EmailPopup() {
  const { t } = useTranslation();
  const overlay = useOverlay();
  const settings = useSettings();
  const toast = useToast();
  const [signature, setSignature] = useState<string | null>(null);
  if (!settings) return null;
  const email = settings.email;
  const sig = signature ?? email.signature;

  const save = async () => {
    await actions.saveSettings({ email: { ...email, signature: sig } });
    toast(t('settings.saved'));
  };

  return (
    <Popup label={t('settings.emailTitle')} onClose={overlay.close} width="max-w-[44rem]" tone="surface">
      <header className="flex items-start gap-3 px-6 pb-3 pt-5">
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">
            {t('settings.emailTitle')}
            <Chip tone={email.connected ? 'positive' : 'warning'}>{email.connected ? t('settings.connected') : t('settings.notConnected')}</Chip>
          </h1>
          <p className="text-xs text-fg-muted">{t('settings.emailPopupSubtitle')}</p>
        </div>
        <CloseButton onClick={overlay.close} />
      </header>
      <div className="space-y-4 overflow-y-auto px-6 pb-6">
        {email.connected ? (
          <p className="rounded-tile bg-surface-tint p-4 text-sm font-semibold">{email.address}</p>
        ) : (
          <p className="rounded-tile bg-warning-soft p-4 text-sm text-warning">{t('settings.emailDisconnected')}</p>
        )}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">{t('settings.readReplies')}</p>
            <p className="text-xs text-fg-muted">{t('settings.readRepliesHint')}</p>
          </div>
          <Toggle checked={email.readReplies} label={t('settings.readReplies')} onChange={(v) => void actions.saveSettings({ email: { ...email, readReplies: v } })} />
        </div>
        <Field label={t('settings.signature')}>
          <textarea rows={4} className={`${input} resize-none py-2`} value={sig} onChange={(e) => setSignature(e.target.value)} />
        </Field>
        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="secondary" onClick={() => void actions.saveSettings({ email: { ...email, connected: !email.connected } })}>
            {email.connected ? t('settings.disconnect') : t('settings.reconnect')}
          </Button>
          <Button disabled={sig === email.signature} onClick={() => void save()}>
            {t('settings.save')}
          </Button>
        </div>
      </div>
    </Popup>
  );
}
