import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp, ChevronLeft, FileText, Mail, MessageCircle, Paperclip, Search, Sparkles } from 'lucide-react';
import type { AgentId, Channel, ConversationMessage } from '@/contracts';
import { actions, useAgents, useContacts, useConversation } from '@/data/hooks';
import { documentsOf, groupByDay, replySubject, searchDocuments, searchMessages } from '@/lib/contacts';
import { IconButton, SearchField, SelectChip, cx } from './Primitives';
import { useToast } from './Toast';

const CHANNELS: Channel[] = ['whatsapp', 'email'];

function ChannelIcon({ channel, size = 12 }: { channel: Channel; size?: number }) {
  const { t } = useTranslation();
  const Icon = channel === 'whatsapp' ? MessageCircle : Mail;
  return <Icon size={size} aria-label={t(`conversation.${channel}`)} role="img" />;
}

function Bubble({ m, subjectLabel, highlighted, onOpenFile }: { m: ConversationMessage; subjectLabel: string; highlighted: boolean; onOpenFile: () => void }) {
  const outgoing = m.from !== 'contact';
  const tone = m.from === 'staff' ? 'bg-brand text-fg-inverse' : m.from === 'contact' ? 'bg-bubble-contact text-fg-inverse' : 'bg-brand-soft text-fg';
  return (
    <div id={`msg-${m.id}`} className={cx('flex', outgoing ? 'justify-end' : 'justify-start')}>
      <div className={cx('max-w-[85%] rounded-card px-4 py-3 text-sm transition-shadow', tone, highlighted && 'ring-2 ring-accent ring-offset-2')}>
        {m.subject && (
          <p className="mb-1.5 flex items-start gap-1.5 text-xs font-semibold">
            <Mail size={12} aria-hidden className="mt-0.5 shrink-0" />
            <span>
              <span className="sr-only">{subjectLabel}</span>
              {m.subject}
            </span>
          </p>
        )}
        <p>{m.text}</p>
        {m.attachments && m.attachments.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1.5">
            {m.attachments.map((name) => (
              <li key={name}>
                <button type="button" onClick={onOpenFile} className="flex min-h-9 max-w-full items-center gap-2 rounded-tile bg-surface px-2.5 py-1.5 text-left text-xs font-medium text-brand hover:bg-surface-tint">
                  <Paperclip size={12} aria-hidden className="shrink-0" />
                  <span className="truncate">{name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className={cx('mt-2 flex items-center gap-1.5 text-[0.6rem] font-medium uppercase tracking-wide', m.from === 'luna' ? 'text-fg-muted' : 'opacity-75')}>
          {m.from === 'luna' && <Sparkles size={11} aria-hidden />}
          <span>
            {m.sender} | {m.time}
          </span>
          <ChannelIcon channel={m.channel} size={11} />
        </p>
      </div>
    </div>
  );
}

/** One conversation with a hotel, supplier or customer, shown in the side panel. */
export function ConversationPanel({ contactId, onBack }: { contactId: string; onBack: () => void }) {
  const { t } = useTranslation();
  const toast = useToast();
  const contacts = useContacts() ?? [];
  const agents = useAgents() ?? [];
  const conversation = useConversation(contactId);
  const contact = contacts.find((c) => c.id === contactId);
  const [view, setView] = useState<'messages' | 'documents'>('messages');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [channel, setChannel] = useState<Channel | undefined>(undefined);
  const [subject, setSubject] = useState<string | undefined>(undefined);
  const [sender, setSender] = useState('me');
  const [missingSubject, setMissingSubject] = useState(false);
  const [focusId, setFocusId] = useState<string | undefined>(undefined);
  const endRef = useRef<HTMLDivElement>(null);

  const replyChannel = channel ?? conversation?.replyChannel ?? 'whatsapp';
  const count = conversation?.messages.length ?? 0;
  const subjectValue = subject ?? replySubject(conversation?.messages ?? []);

  useEffect(() => {
    void actions.markChatRead(contactId);
  }, [contactId]);

  useEffect(() => {
    if (view === 'messages' && !searching && !focusId) endRef.current?.scrollIntoView({ block: 'end' });
  }, [count, view, searching, contactId, focusId]);

  useEffect(() => {
    if (!focusId || view !== 'messages') return;
    document.getElementById(`msg-${focusId}`)?.scrollIntoView({ block: 'center' });
    const timer = window.setTimeout(() => setFocusId(undefined), 2200);
    return () => window.clearTimeout(timer);
  }, [focusId, view]);

  const messages = useMemo(() => searchMessages(conversation?.messages ?? [], query), [conversation, query]);
  const documents = useMemo(() => searchDocuments(documentsOf(conversation?.messages ?? []), query), [conversation, query]);

  if (!contact || !conversation) return null;

  const toggleSearch = () => {
    setSearching((v) => !v);
    setQuery('');
  };

  const showInMessage = (messageId: string) => {
    setView('messages');
    setSearching(false);
    setQuery('');
    setFocusId(messageId);
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    const clean = draft.trim();
    if (!clean) return;
    if (replyChannel === 'email' && !subjectValue.trim()) {
      setMissingSubject(true);
      return;
    }
    setDraft('');
    setSubject(undefined);
    setMissingSubject(false);
    setView('messages');
    void actions.sendContactMessage(contactId, {
      channel: replyChannel,
      text: clean,
      subject: replyChannel === 'email' ? subjectValue.trim() : undefined,
      agentId: sender === 'me' ? undefined : (sender as AgentId),
    });
  };

  const subjectLabel = t('conversation.subject');

  return (
    <section aria-label={t('conversation.label', { name: contact.name })} className="-mx-4 -mb-4 flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-1 border-b border-border px-3 pb-3">
        <button type="button" onClick={onBack} aria-label={t('conversation.back')} className="flex size-11 shrink-0 items-center justify-center rounded-pill text-fg-muted hover:bg-surface-tint">
          <ChevronLeft size={18} aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{contact.name}</h2>
          <p className="truncate text-xs text-fg-muted">{contact.context}</p>
        </div>
        <IconButton label={t('conversation.documents')} aria-pressed={view === 'documents'} onClick={() => setView((v) => (v === 'documents' ? 'messages' : 'documents'))} className={cx(view === 'documents' && 'border-brand bg-brand-soft text-brand')}>
          <FileText size={16} aria-hidden />
        </IconButton>
        <IconButton label={t('conversation.search')} aria-pressed={searching} onClick={toggleSearch} className={cx(searching && 'border-brand bg-brand-soft text-brand')}>
          <Search size={16} aria-hidden />
        </IconButton>
      </header>

      {searching && (
        <div className="px-4 pt-3">
          <SearchField value={query} onChange={setQuery} placeholder={t(view === 'documents' ? 'conversation.searchDocuments' : 'conversation.searchMessages')} className="rounded-pill" />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4" role={view === 'messages' ? 'log' : undefined} aria-live="polite">
        {view === 'messages' ? (
          <>
            {!searching && (
              <div className="rounded-card bg-surface-sunken p-4">
                <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-wider text-brand">
                  <span aria-hidden className="flex size-6 items-center justify-center rounded-pill bg-surface">
                    <Sparkles size={12} />
                  </span>
                  {t('conversation.summary')}
                </p>
                <p className="mt-3 text-sm">{conversation.summary.text}</p>
                {conversation.summary.nextStep && (
                  <p className="mt-3 text-sm">
                    <span className="font-semibold text-brand">{t('conversation.nextStep')}</span> {conversation.summary.nextStep}
                  </p>
                )}
                <p className="mt-3 text-[0.6rem] font-medium uppercase tracking-wide text-fg-muted">{t('conversation.generated', { when: conversation.summary.generatedAt })}</p>
              </div>
            )}
            {messages.length === 0 && <p className="py-8 text-center text-sm text-fg-muted">{t('conversation.noMessages')}</p>}
            {groupByDay(messages).map((g) => (
              <div key={g.day}>
                <p className="my-4 text-center text-[0.65rem] font-medium uppercase tracking-wider text-fg-muted">{g.day}</p>
                <div className="space-y-3">
                  {g.messages.map((m) => (
                    <Bubble key={m.id} m={m} subjectLabel={subjectLabel} highlighted={focusId === m.id} onOpenFile={() => toast(t('conversation.protoOpenDocument'))} />
                  ))}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </>
        ) : (
          <>
            {documents.length === 0 && <p className="py-8 text-center text-sm text-fg-muted">{t('conversation.noDocuments')}</p>}
            <ul className="divide-y divide-border">
              {documents.map((d) => (
                <li key={d.id}>
                  <button type="button" onClick={() => showInMessage(d.messageId)} aria-label={t('conversation.showInMessage', { name: d.name })} className="flex min-h-14 w-full items-center gap-3 py-2 text-left hover:bg-surface-tint">
                    <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-tile bg-brand-soft text-brand">
                      <FileText size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{d.name}</span>
                      <span className="flex items-center gap-1.5 text-xs text-fg-muted">
                        <ChannelIcon channel={d.channel} />
                        <span className="truncate">{t('conversation.attachedTo', { sender: d.sender, when: `${d.day} ${d.time}` })}</span>
                      </span>
                      {d.subject && <span className="block truncate text-xs text-fg-muted">{d.subject}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="border-t border-border bg-surface-tint px-4 pb-4 pt-3">
        <div className="flex items-center justify-between gap-2">
          <span id="reply-via" className="text-xs font-medium">
            {t('conversation.replyVia')}
          </span>
          <div role="radiogroup" aria-labelledby="reply-via" className="flex gap-1.5">
            {CHANNELS.map((c) => {
              const on = replyChannel === c;
              const Icon = c === 'whatsapp' ? MessageCircle : Mail;
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setChannel(c)}
                  className={cx('flex min-h-11 items-center gap-1.5 rounded-pill border px-3 text-xs font-medium', on ? 'border-brand bg-brand-soft text-brand' : 'border-border bg-surface text-fg-muted hover:bg-surface-sunken')}
                >
                  <Icon size={14} aria-hidden />
                  {t(`conversation.${c}`)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium">{t('conversation.sentBy')}</span>
          <SelectChip
            label={t('conversation.sentBy')}
            value={sender}
            onChange={setSender}
            options={[{ key: 'me', label: t('conversation.me') }, ...agents.filter((a) => a.enabled).map((a) => ({ key: a.id, label: a.name }))]}
          />
        </div>
        <form onSubmit={send} className="mt-3 border-t border-border pt-3">
          {replyChannel === 'email' && (
            <div className="mb-2">
              <input
                value={subjectValue}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setMissingSubject(false);
                }}
                required
                aria-required="true"
                aria-invalid={missingSubject}
                placeholder={t('conversation.subjectPlaceholder')}
                aria-label={subjectLabel}
                className={cx('min-h-11 w-full rounded-tile border bg-surface px-4 text-sm font-medium outline-none placeholder:font-normal placeholder:text-fg-muted', missingSubject ? 'border-danger' : 'border-border')}
              />
              {missingSubject && (
                <p role="alert" className="mt-1 text-xs text-danger">
                  {t('conversation.subjectRequired')}
                </p>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-pill border border-border bg-surface pl-4 pr-1">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('conversation.typeHere')}
                aria-label={t('conversation.typeHere')}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fg-muted"
              />
              <button type="button" aria-label={t('conversation.attach')} onClick={() => toast(t('conversation.protoAttach'))} className="flex size-10 shrink-0 items-center justify-center rounded-pill text-brand hover:bg-surface-tint">
                <Paperclip size={16} aria-hidden />
              </button>
            </div>
            <button type="submit" aria-label={t('conversation.send', { channel: t(`conversation.${replyChannel}`) })} className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-brand text-fg-inverse hover:bg-brand-strong">
              <ArrowUp size={18} aria-hidden />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
