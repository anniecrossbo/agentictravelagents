import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp, ChevronDown, Plus, SquarePen } from 'lucide-react';
import { useOverlay } from '@/app/useOverlay';
import { actions, useLunaThread, useLunaThreads, useSettings } from '@/data/hooks';
import { Popup } from '../Popup';
import { CloseButton, IconButton, cx } from '../Primitives';
import { LunaMessageView, LunaOrb } from '../LunaBlocks';
import { useToast } from '../Toast';

const SUGGESTIONS = ['ask.s1', 'ask.s2', 'ask.s3', 'ask.s4'] as const;

/** Luna Companion: ask in your own words, see answers as text, charts and result cards, and come back to earlier chats. */
export function AskPopup() {
  const { t } = useTranslation();
  const overlay = useOverlay();
  const toast = useToast();
  const settings = useSettings();
  const threads = useLunaThreads() ?? [];
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const thread = useLunaThread(threadId);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<string | undefined>(undefined);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = thread?.messages ?? [];
  const userInitial = (settings?.profile.fullName ?? 'H').trim().charAt(0).toUpperCase();
  const groups = threads.reduce<{ group: string; items: typeof threads }[]>((acc, th) => {
    const last = acc[acc.length - 1];
    if (last && last.group === th.group) last.items.push(th);
    else acc.push({ group: th.group, items: [th] });
    return acc;
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, pending]);

  const ask = async (raw: string) => {
    const clean = raw.trim();
    if (!clean || pending) return;
    setDraft('');
    setPending(clean);
    // PROTO: a short fake delay so the "answering" state is visible; a real Luna answers when it is ready.
    await new Promise((r) => window.setTimeout(r, 700));
    const id = await actions.askLuna(threadId, clean);
    setThreadId(id);
    setPending(undefined);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void ask(draft);
  };

  const openThread = (id: string) => {
    setThreadId(id);
    setHistoryOpen(false);
  };

  const startNew = () => {
    setThreadId(undefined);
    setHistoryOpen(false);
  };

  return (
    <Popup label={t('ask.title')} onClose={overlay.close} width="max-w-[36rem]" tone="glow">
      <div className="relative flex h-[min(50rem,90vh)] flex-col gap-3 p-3">
        <header className="flex items-center gap-1 rounded-card bg-surface/70 px-1.5 py-1.5 backdrop-blur">
          <button
            type="button"
            aria-expanded={historyOpen}
            aria-label={t('ask.history')}
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-tile px-2 text-left hover:bg-surface-tint"
          >
            <LunaOrb />
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-sm font-semibold leading-tight">
                <span className="truncate">{t('ask.title')}</span>
                <ChevronDown size={14} aria-hidden className={cx('shrink-0 text-fg-muted transition-transform', historyOpen && 'rotate-180')} />
              </span>
              <span className="block truncate text-xs text-fg-muted">{t('ask.subtitle')}</span>
            </span>
          </button>
          <IconButton label={t('ask.newChat')} onClick={startNew} className="border-0 bg-transparent">
            <SquarePen size={16} aria-hidden />
          </IconButton>
          <CloseButton onClick={overlay.close} />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-1" role="log" aria-live="polite">
          {messages.length === 0 && !pending ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <LunaOrb />
              <div>
                <h2 className="text-lg font-semibold">{t('ask.emptyTitle')}</h2>
                <p className="text-xs text-fg-muted">{t('ask.emptySubtitle')}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((k) => (
                  <button key={k} type="button" onClick={() => void ask(t(k))} className="min-h-11 rounded-pill bg-surface px-4 text-xs font-medium text-brand shadow-card hover:bg-brand-soft">
                    {t(k)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-1">
              {messages.map((m) => (
                <LunaMessageView key={m.id} message={m} userInitial={userInitial} />
              ))}
              {pending && (
                <>
                  <LunaMessageView message={{ id: 'pending-user', from: 'user', blocks: [{ type: 'text', text: pending }] }} userInitial={userInitial} />
                  <div className="flex items-center gap-2.5" role="status">
                    <LunaOrb />
                    <p className="rounded-pill bg-surface/70 px-4 py-2 text-xs text-fg-muted backdrop-blur">{t('ask.answering')}</p>
                  </div>
                </>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <form onSubmit={submit} className="flex items-center gap-2 rounded-pill bg-surface py-1.5 pl-5 pr-1.5 shadow-card">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('ask.placeholder')}
            aria-label={t('ask.placeholder')}
            className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fg-muted"
          />
          <button type="button" aria-label={t('ask.attach')} onClick={() => toast(t('ask.protoAttach'))} className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-brand-soft text-brand hover:bg-brand-tint">
            <Plus size={16} aria-hidden />
          </button>
          <button type="submit" aria-label={t('ask.send')} disabled={!draft.trim() || !!pending} className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-brand text-fg-inverse hover:bg-brand-strong disabled:opacity-50">
            <ArrowUp size={18} aria-hidden />
          </button>
        </form>

        {historyOpen && (
          <>
            <button type="button" aria-label={t('ask.closeHistory')} onClick={() => setHistoryOpen(false)} className="absolute inset-0 z-10 rounded-popup bg-scrim/35 backdrop-blur-sm" />
            <aside aria-label={t('ask.history')} className="absolute inset-y-3 left-3 z-20 w-72 max-w-[85%] overflow-y-auto rounded-card bg-surface/85 p-5 shadow-pop backdrop-blur-xl">
              {groups.map((g) => (
                <section key={g.group} className="mb-5 last:mb-0">
                  <h2 className="mb-1.5 text-xs text-fg-muted">{g.group}</h2>
                  <ul>
                    {g.items.map((th) => (
                      <li key={th.id}>
                        <button
                          type="button"
                          onClick={() => openThread(th.id)}
                          aria-current={th.id === threadId}
                          className={cx('flex min-h-11 w-full items-center justify-between gap-2 rounded-tile px-2 text-left text-sm text-brand hover:bg-brand-soft', th.id === threadId && 'bg-brand-soft')}
                        >
                          <span className="truncate font-medium">{th.title}</span>
                          <span className="shrink-0 text-xs text-fg-muted">{th.when}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </aside>
          </>
        )}
      </div>
    </Popup>
  );
}
