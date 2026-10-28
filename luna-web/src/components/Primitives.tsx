import { type ButtonHTMLAttributes, type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, X } from 'lucide-react';
import type { AgentStatus, Tone } from '@/contracts';
import { avatarToneClass, chipClass, dotClass, statusTone } from './tones';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
}

const buttonVariant: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-fg-inverse hover:bg-brand-strong border border-transparent',
  secondary: 'bg-surface text-fg border border-border-strong hover:bg-surface-tint',
  ghost: 'bg-transparent text-brand hover:bg-brand-soft border border-transparent',
};

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-pill font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'px-3.5 text-xs' : 'px-5 text-sm',
        buttonVariant[variant],
        className,
      )}
      {...rest}
    />
  );
}

export function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx('inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-fg hover:bg-surface-tint', className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <IconButton label={t('common.close')} onClick={onClick}>
      <X size={18} aria-hidden />
    </IconButton>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <IconButton label={t('common.back')} onClick={onClick}>
      <ArrowLeft size={18} aria-hidden />
    </IconButton>
  );
}

export function Chip({ tone = 'neutral', dot, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 py-0.5 text-xs font-medium', chipClass[tone], className)}>
      {dot && <span aria-hidden className={cx('size-1.5 rounded-pill', dotClass[tone])} />}
      {children}
    </span>
  );
}

export function StatusChip({ status }: { status: AgentStatus }) {
  const { t } = useTranslation();
  return (
    <Chip tone={statusTone[status]} dot>
      {t(`status.${status}`)}
    </Chip>
  );
}

export function Dot({ tone }: { tone: Tone }) {
  return <span aria-hidden className={cx('inline-block size-1.5 shrink-0 rounded-pill', dotClass[tone])} />;
}

export function CustomerAvatar({ initials, tone, size = 'md' }: { initials: string; tone: 1 | 2 | 3 | 4 | 5 | 6; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'size-8 text-[0.65rem]' : size === 'lg' ? 'size-12 text-sm' : 'size-10 text-xs';
  return (
    <span aria-hidden className={cx('inline-flex shrink-0 items-center justify-center rounded-pill font-semibold text-fg-inverse', dim, avatarToneClass[tone])}>
      {initials}
    </span>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill transition-colors', checked ? 'bg-accent' : 'bg-border-strong')}
    >
      <span className={cx('inline-block size-5 rounded-pill bg-surface shadow-card transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}

export function SearchField({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <label className={cx('flex min-h-11 items-center gap-2 rounded-tile border border-border bg-surface px-3.5 text-sm text-fg-muted', className)}>
      <Search size={15} aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-fg outline-none placeholder:text-fg-muted"
      />
    </label>
  );
}

export function FilterChips<K extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: K; label: string; tone?: Tone }[];
  value: K;
  onChange: (key: K) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
          className={cx(
            'min-h-9 rounded-pill border px-3.5 text-xs font-medium transition-colors',
            value === o.key ? 'border-transparent bg-brand-soft text-brand' : 'border-border bg-surface text-fg-subtle hover:bg-surface-tint',
            o.tone === 'danger' && value !== o.key && 'text-danger',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SelectChip({ label, value, options, onChange }: { label: string; value: string; options: { key: string; label: string }[]; onChange: (k: string) => void }) {
  const id = useId();
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 cursor-pointer appearance-none rounded-tile border border-border bg-surface px-4 pr-7 text-xs font-medium text-fg"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Segmented<K extends string>({ options, value, onChange }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto rounded-pill bg-surface-sunken p-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="tab"
          aria-selected={value === o.key}
          onClick={() => onChange(o.key)}
          className={cx(
            'min-h-9 flex-1 whitespace-nowrap rounded-pill px-4 text-xs font-medium transition-colors',
            value === o.key ? 'bg-brand text-fg-inverse' : 'text-fg-muted hover:text-fg',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SoftTabs<K extends string>({ options, value, onChange }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div role="tablist" className="flex gap-1 rounded-pill bg-surface-sunken p-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="tab"
          aria-selected={value === o.key}
          onClick={() => onChange(o.key)}
          className={cx(
            'min-h-10 flex-1 whitespace-nowrap rounded-pill px-3 text-sm font-medium transition-colors',
            value === o.key ? 'bg-surface text-fg shadow-card' : 'text-fg-muted hover:text-fg',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function WidgetCard({ title, subtitle, actions, children, className }: { title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('flex min-h-0 min-w-0 flex-col rounded-card bg-surface p-5 shadow-card', className)}>
      {(title || actions) && (
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
          <div>
            {title && <h2 className="text-lg font-semibold leading-tight">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-fg-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
    </section>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="rounded-tile bg-surface-tint px-4 py-6 text-center text-sm text-fg-muted">{children}</p>;
}

export function Eyebrow({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'warning' | 'muted' }) {
  return (
    <p className={cx('text-[0.65rem] font-semibold uppercase tracking-wider', tone === 'brand' && 'text-brand', tone === 'warning' && 'text-warning', tone === 'muted' && 'text-fg-muted')}>
      {children}
    </p>
  );
}

/** One field that holds the text box and its Add button, so they read as a single control. */
export function InlineAddField({
  value,
  onChange,
  onSubmit,
  placeholder,
  buttonLabel,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  buttonLabel: string;
  children?: ReactNode;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit();
      }}
      className="flex min-h-12 items-center gap-2 rounded-pill border border-border bg-surface-tint py-1 pl-4 pr-1 focus-within:border-brand"
    >
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fg-muted" />
      {children}
      <Button type="submit" size="sm" disabled={!value.trim()}>
        {buttonLabel}
      </Button>
    </form>
  );
}
