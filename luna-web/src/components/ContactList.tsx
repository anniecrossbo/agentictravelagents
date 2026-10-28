import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListFilter } from 'lucide-react';
import type { ContactKind } from '@/contracts';
import { useContacts } from '@/data/hooks';
import { type ContactFilter, countByKind, filterContacts } from '@/lib/contacts';
import { Chip, CustomerAvatar, EmptyNote, SearchField, cx } from './Primitives';

const KINDS: ContactKind[] = ['hotel', 'supplier', 'customer'];

/** Hotels, suppliers and customers you chat with: one conversation each. */
export function ContactList({ onOpen }: { onOpen: (contactId: string) => void }) {
  const { t } = useTranslation();
  const contacts = useContacts() ?? [];
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<ContactFilter>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const counts = useMemo(() => countByKind(contacts), [contacts]);
  const rows = useMemo(() => filterContacts(contacts, kind, query, unreadOnly), [contacts, kind, query, unreadOnly]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SearchField value={query} onChange={setQuery} placeholder={t('contacts.search')} className="rounded-pill" />
      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label={t('contacts.filters')}>
        <button
          type="button"
          aria-pressed={unreadOnly}
          aria-label={t('contacts.unreadOnly')}
          onClick={() => setUnreadOnly((v) => !v)}
          className={cx('flex size-11 items-center justify-center rounded-pill border border-border', unreadOnly ? 'bg-brand text-fg-inverse' : 'bg-surface text-fg-muted hover:bg-surface-tint')}
        >
          <ListFilter size={16} aria-hidden />
        </button>
        {KINDS.map((k) => {
          const on = kind === k;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => setKind(on ? 'all' : k)}
              className={cx('flex min-h-11 items-center gap-2 rounded-pill border px-2.5 text-xs font-semibold', on ? 'border-brand bg-brand text-fg-inverse' : 'border-border bg-surface hover:bg-surface-tint')}
            >
              <span className={cx('flex size-6 items-center justify-center rounded-pill text-[0.65rem]', on ? 'bg-surface text-brand' : 'bg-surface-sunken')}>{counts[k]}</span>
              {t(`contacts.kindPlural.${k}`)}
            </button>
          );
        })}
      </div>
      <ul className="mt-3 min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        {rows.length === 0 && <EmptyNote>{t('contacts.none')}</EmptyNote>}
        {rows.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => onOpen(c.id)} className="flex min-h-16 w-full items-center gap-3 py-2 text-left hover:bg-surface-tint">
              <CustomerAvatar initials={c.initials} tone={c.tone} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="truncate">{c.name}</span>
                  {c.vip && (
                    <Chip tone="warning" className="!px-2 !py-0 text-[0.65rem]">
                      {t('contacts.vip')}
                    </Chip>
                  )}
                </span>
                <span className={cx('block truncate text-xs', c.unread > 0 ? 'font-medium text-fg' : 'text-fg-muted')}>{c.preview}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.65rem] text-fg-muted">{c.at}</span>
                {c.unread > 0 && (
                  <span className="rounded-pill bg-warning-soft px-2 text-xs font-semibold text-warning">
                    <span className="sr-only">{t('contacts.unreadLabel')}</span>
                    <span aria-hidden>{c.unread}</span>
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
