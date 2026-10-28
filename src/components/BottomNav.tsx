import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, LayoutGrid, Settings as SettingsIcon, TrendingUp, Users } from 'lucide-react';
import { useOverlay } from '@/app/useOverlay';
import { cx } from './Primitives';

const ITEMS = [
  { key: 'dashboard', to: '/', icon: LayoutGrid },
  { key: 'clients', to: '/clients', icon: Users },
  { key: 'finance', to: '/finance', icon: TrendingUp },
  { key: 'suppliers', to: '/suppliers', icon: Building2 },
] as const;

const linkClass = (active: boolean) =>
  cx('flex min-h-11 items-center gap-2 rounded-pill px-4 text-sm font-semibold transition-colors', active ? 'bg-brand text-fg-inverse' : 'text-fg-subtle hover:bg-surface/60');

export function BottomNav() {
  const { t } = useTranslation();
  const overlay = useOverlay();

  return (
    <nav aria-label={t('nav.label')} className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3">
      <div className="flex items-center gap-1 rounded-pill bg-surface-sunken/90 p-1.5 shadow-card backdrop-blur">
        {ITEMS.map(({ key, to, icon: Icon }) => (
          <NavLink key={key} to={to} end={to === '/'} aria-label={t(`nav.${key}`)} className={({ isActive }) => linkClass(isActive)}>
            {({ isActive }) => (
              <>
                <Icon size={18} aria-hidden />
                {isActive && <span>{t(`nav.${key}`)}</span>}
              </>
            )}
          </NavLink>
        ))}
        <NavLink to="/settings" aria-label={t('nav.settings')} className={({ isActive }) => linkClass(isActive)}>
          {({ isActive }) => (
            <>
              <SettingsIcon size={18} aria-hidden />
              {isActive && <span>{t('nav.settings')}</span>}
            </>
          )}
        </NavLink>
        <button
          type="button"
          aria-label={t('nav.ask')}
          onClick={() => overlay.open({ kind: 'ask' })}
          className="ml-1 size-11 rounded-pill bg-linear-to-br from-brand via-accent to-info shadow-card"
        />
      </div>
    </nav>
  );
}
