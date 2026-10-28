import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import { formatClock } from '@/lib/format';
import { useSettings } from '@/data/hooks';
import { CustomerAvatar, cx } from './Primitives';
import { useToast } from './Toast';

const CREATE_ITEMS = ['customer', 'enquiry', 'supplier', 'invoice'] as const;

export function TopBar({ showCreate }: { showCreate: boolean }) {
  const { t } = useTranslation();
  const settings = useSettings();
  const toast = useToast();
  const [now, setNow] = useState(() => new Date());
  const [refreshedAt, setRefreshedAt] = useState(() => Date.now());
  const [spin, setSpin] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menu]);

  const minutes = Math.max(0, Math.floor((now.getTime() - refreshedAt) / 60_000));
  const refreshed = minutes === 0 ? t('topbar.refreshedNow') : t('topbar.refreshedAgo', { count: minutes });

  const refresh = () => {
    setSpin(true);
    setRefreshedAt(Date.now());
    setNow(new Date());
    window.setTimeout(() => setSpin(false), 600);
  };

  const name = settings?.profile.fullName ?? '';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex justify-center px-3 pt-3">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-pill bg-surface/80 p-1.5 shadow-card backdrop-blur">
        <button type="button" onClick={refresh} className="flex min-h-11 items-center gap-2 rounded-pill bg-brand-soft px-4 text-xs font-medium text-brand">
          <RefreshCw size={14} aria-hidden className={cx(spin && 'animate-spin')} />
          {refreshed}
        </button>
        <span className="flex min-h-11 items-center rounded-pill bg-surface-tint px-4 text-xs font-medium">{formatClock(now)}</span>
        {showCreate && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
              className="flex min-h-11 items-center gap-1 rounded-pill bg-brand px-4 text-xs font-semibold text-fg-inverse hover:bg-brand-strong"
            >
              <Plus size={14} aria-hidden />
              {t('topbar.create')}
            </button>
            {menu && (
              <div role="menu" className="absolute left-0 top-12 z-40 w-48 rounded-tile bg-surface p-1.5 shadow-pop">
                {CREATE_ITEMS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenu(false);
                      // PROTO: creation flows are not built; this only acknowledges the click.
                      toast(t('topbar.createToast', { what: t(`topbar.createItem.${item}`) }));
                    }}
                    className="flex min-h-11 w-full items-center rounded-chip px-3 text-left text-sm hover:bg-surface-tint"
                  >
                    {t(`topbar.createItem.${item}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <span className="flex min-h-11 items-center gap-2 rounded-pill bg-surface-tint pl-4 pr-1.5 text-xs font-medium">
          {name}
          <CustomerAvatar initials={initials} tone={2} size="sm" />
        </span>
      </div>
    </header>
  );
}
