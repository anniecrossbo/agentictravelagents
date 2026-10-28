import { useTranslation } from 'react-i18next';
import { Check, Sparkles } from 'lucide-react';
import type { LunaBlock, LunaMessage } from '@/contracts';
import { Button, cx } from './Primitives';
import { useToast } from './Toast';

/** The small teal orb that stands for Luna beside her messages. */
export function LunaOrb({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span aria-hidden className={cx('inline-flex shrink-0 items-center justify-center rounded-pill bg-linear-to-br from-brand via-accent to-info text-fg-inverse shadow-card', size === 'sm' ? 'size-6' : 'size-7')}>
      <Sparkles size={size === 'sm' ? 11 : 13} />
    </span>
  );
}

function BarChart({ block }: { block: Extract<LunaBlock, { type: 'chart' }> }) {
  const max = Math.max(...block.bars.map((b) => b.value), 1);
  return (
    <figure className="rounded-card bg-surface p-4 shadow-card">
      <figcaption>
        <p className="text-sm font-semibold">{block.title}</p>
        <p className="text-xs text-fg-muted">{block.subtitle}</p>
      </figcaption>
      <ul className="mt-4 flex h-36 items-end gap-3 border-b border-border">
        {block.bars.map((b) => (
          <li key={b.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" aria-label={`${b.label}: ${b.display}`}>
            <span aria-hidden className="text-xs font-semibold text-fg-subtle">
              {b.display}
            </span>
            <span aria-hidden className="w-full max-w-9 rounded-t-tile bg-brand" style={{ height: `${Math.max(6, (b.value / max) * 100)}%`, opacity: 0.55 + 0.45 * (b.value / max) }} />
          </li>
        ))}
      </ul>
      <ul aria-hidden className="mt-1.5 flex gap-3">
        {block.bars.map((b) => (
          <li key={b.label} className="min-w-0 flex-1 truncate text-center text-[0.65rem] text-fg-muted">
            {b.label}
          </li>
        ))}
      </ul>
    </figure>
  );
}

function ResultCard({ block }: { block: Extract<LunaBlock, { type: 'result' }> }) {
  const { t } = useTranslation();
  const toast = useToast();
  return (
    <section className="rounded-card bg-surface p-5 shadow-card">
      <span aria-hidden className="mx-auto flex size-12 items-center justify-center rounded-pill bg-brand-soft text-brand">
        <Check size={22} />
      </span>
      <h3 className="mt-3 text-center text-xl font-semibold">{block.title}</h3>
      <p className="mt-1 text-center text-xs text-fg-muted">{block.body}</p>
      <dl className="mt-4 space-y-2 rounded-card bg-surface-sunken p-4 text-xs">
        {block.rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-3">
            <dt className="text-fg-muted">{r.label}</dt>
            <dd className="font-semibold text-fg">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 flex justify-between gap-3 rounded-tile bg-brand-soft px-3 py-2 text-xs text-brand">
        <span className="font-medium">{block.note}</span>
        {block.noteRight && <span className="text-fg-muted">{block.noteRight}</span>}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {block.actions.map((a) => (
          <Button key={a.label} size="sm" variant={a.primary ? 'primary' : 'secondary'} onClick={() => toast(t('ask.protoAction'))}>
            {a.label}
          </Button>
        ))}
      </div>
    </section>
  );
}

export function LunaMessageView({ message, userInitial }: { message: LunaMessage; userInitial: string }) {
  if (message.from === 'user') {
    return (
      <div className="flex justify-end">
        <p className="flex max-w-[88%] items-center gap-3 rounded-pill bg-surface py-1.5 pl-5 pr-1.5 text-sm shadow-card">
          <span>{message.blocks.map((b) => (b.type === 'text' ? b.text : '')).join(' ')}</span>
          <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-warning-soft text-xs font-semibold text-warning">
            {userInitial}
          </span>
        </p>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <LunaOrb />
      <div className="min-w-0 max-w-[92%] flex-1 space-y-3">
        {message.blocks.map((b, i) =>
          b.type === 'text' ? (
            <p key={i} className="rounded-card bg-surface/70 px-4 py-3 text-sm backdrop-blur">
              {b.text}
            </p>
          ) : b.type === 'chart' ? (
            <BarChart key={i} block={b} />
          ) : (
            <ResultCard key={i} block={b} />
          ),
        )}
      </div>
    </div>
  );
}
