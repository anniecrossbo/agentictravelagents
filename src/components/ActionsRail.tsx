import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import type { Decision, DecisionScope } from '@/contracts';
import { actions, useContacts, useDecisions } from '@/data/hooks';
import { totalUnread } from '@/lib/contacts';
import { ContactList } from './ContactList';
import { ConversationPanel } from './ConversationPanel';
import { Button, EmptyNote, cx } from './Primitives';

function DecisionCard({ decision }: { decision: Decision }) {
  const { t } = useTranslation();
  const done = decision.resolvedWith !== undefined;
  return (
    <li className={cx('border-l-[3px] pl-3', decision.severity === 'danger' ? 'border-danger-dot' : 'border-warning-dot', done && 'opacity-70')}>
      <h3 className="text-sm font-semibold">{decision.title}</h3>
      <p className="mt-0.5 text-xs text-fg-muted">{decision.body}</p>
      {done ? (
        <p className="mt-2 flex items-start gap-1.5 rounded-tile bg-positive-soft px-3 py-2 text-xs text-positive">
          <Check size={14} aria-hidden className="mt-px shrink-0" />
          <span>{decision.resolvedWith}</span>
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {decision.actions.map((a) => (
            <Button key={a.id} variant={a.primary ? 'primary' : 'secondary'} size="sm" onClick={() => void actions.resolveDecision(decision.id, a.id)}>
              {a.label}
            </Button>
          ))}
        </div>
      )}
      <span className="sr-only">{t(`severity.${decision.severity}`)}</span>
    </li>
  );
}

export function ActionsRail({ scope, introKey }: { scope: DecisionScope | 'all'; introKey: string }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'actions' | 'chats'>('actions');
  const [contactId, setContactId] = useState<string | undefined>(undefined);
  const decisions = useDecisions(scope) ?? [];
  const contacts = useContacts() ?? [];

  const open = decisions.filter((d) => d.resolvedWith === undefined);
  const resolved = decisions.filter((d) => d.resolvedWith !== undefined);
  const unread = totalUnread(contacts);

  return (
    <aside aria-label={t('rail.label')} className="flex h-full min-h-0 flex-col rounded-card bg-surface p-4 shadow-card">
      <div role="tablist" className="mb-4 flex rounded-pill bg-surface-sunken p-1">
        {(['actions', 'chats'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={cx('flex min-h-10 flex-1 items-center justify-center gap-2 rounded-pill text-sm font-medium', tab === k ? 'bg-surface shadow-card' : 'text-fg-muted')}
          >
            {t(`rail.${k}`)}
            <span className="rounded-pill bg-warning-soft px-2 text-xs font-semibold text-warning">{k === 'actions' ? open.length : unread}</span>
          </button>
        ))}
      </div>

      {tab === 'actions' ? (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <p className="mb-3 text-xs text-fg-muted">{t(introKey)}</p>
          {open.length === 0 && <EmptyNote>{t('rail.allClear')}</EmptyNote>}
          <ul className="flex flex-col gap-5">
            {open.map((d) => (
              <DecisionCard key={d.id} decision={d} />
            ))}
          </ul>
          {resolved.length > 0 && (
            <>
              <p className="mb-2 mt-6 text-[0.65rem] font-semibold uppercase tracking-wider text-fg-muted">{t('rail.resolved')}</p>
              <ul className="flex flex-col gap-4">
                {resolved.map((d) => (
                  <DecisionCard key={d.id} decision={d} />
                ))}
              </ul>
            </>
          )}
        </div>
      ) : (
        contactId ? <ConversationPanel contactId={contactId} onBack={() => setContactId(undefined)} /> : <ContactList onOpen={setContactId} />
      )}
    </aside>
  );
}
