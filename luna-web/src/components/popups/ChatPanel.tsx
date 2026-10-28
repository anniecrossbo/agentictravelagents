import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';
import type { AgentId } from '@/contracts';
import { actions, useThread } from '@/data/hooks';
import { cx } from '../Primitives';

export function ChatPanel({ threadId, agentId, agentName, quickReplies }: { threadId: string; agentId: AgentId; agentName: string; quickReplies: string[] }) {
  const { t } = useTranslation();
  const messages = useThread(threadId) ?? [];
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setDraft('');
    void actions.sendMessage(threadId, agentId, clean);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  return (
    <section aria-label={t('chat.label', { name: agentName })} className="flex min-h-0 flex-col rounded-card bg-surface p-4 shadow-card">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" role="log" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={cx('flex flex-col', m.from === 'user' ? 'items-end' : 'items-start')}>
            <p className={cx('max-w-[88%] rounded-card px-4 py-2.5 text-sm', m.from === 'user' ? 'bg-brand text-fg-inverse' : 'bg-surface-sunken')}>{m.text}</p>
            <span className="mt-1 text-[0.65rem] text-fg-muted">{m.at}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {quickReplies.map((q) => (
          <button key={q} type="button" onClick={() => send(q)} className="min-h-9 rounded-pill border border-border px-3.5 text-xs font-medium text-brand hover:bg-brand-soft">
            {q}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-3 flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('chat.placeholder', { name: agentName })}
          aria-label={t('chat.placeholder', { name: agentName })}
          className="min-h-9 w-full bg-transparent text-sm outline-none placeholder:text-fg-muted"
        />
        <button type="submit" aria-label={t('chat.send')} className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-brand text-fg-inverse hover:bg-brand-strong">
          <ArrowUp size={16} aria-hidden />
        </button>
      </form>
    </section>
  );
}
