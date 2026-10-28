import { useId } from 'react';

/** Area line chart drawn from tokens. */
export function SparkArea({ points, labels }: { points: number[]; labels: [string, string] }) {
  const id = useId();
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const w = 220;
  const h = 56;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - 6 - ((p - min) / span) * (h - 14)] as const);
  const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const last = xy[xy.length - 1];
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full overflow-visible" role="img" aria-label={`${labels[0]} ${points[0]} to ${labels[1]} ${points.at(-1)}`}>
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--color-brand)', stopOpacity: 0.25 }} />
            <stop offset="1" style={{ stopColor: 'var(--color-brand)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${line} ${w},${h}`} fill={`url(#${id})`} />
        <polyline points={line} fill="none" style={{ stroke: 'var(--color-brand)' }} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {last && <circle cx={last[0]} cy={last[1]} r="3.5" style={{ fill: 'var(--color-surface)', stroke: 'var(--color-brand)' }} strokeWidth="2" />}
      </svg>
      <figcaption className="flex justify-between text-[0.65rem] text-fg-muted">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </figcaption>
    </figure>
  );
}

export function BarChart({ bars, format }: { bars: { label: string; value: number }[]; format: (n: number) => string }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <ul className="flex h-40 items-end gap-3">
      {bars.map((b) => (
        <li key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-xs font-semibold">{format(b.value)}</span>
          <span className="w-full max-w-14 rounded-t-tile bg-brand/80" style={{ height: `${Math.max(8, (b.value / max) * 100)}%` }} aria-hidden />
          <span className="text-[0.65rem] text-fg-muted">{b.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function SplitBar({ paid, open }: { paid: number; open: number }) {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-pill bg-surface-sunken" aria-hidden>
      <span className="bg-accent" style={{ width: `${paid}%` }} />
      <span className="bg-warning-dot" style={{ width: `${open}%` }} />
    </div>
  );
}
