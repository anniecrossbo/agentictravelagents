const nf = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function money(amount: number, opts: { sign?: boolean; decimals?: boolean } = {}): string {
  const abs = Math.abs(amount);
  const body = `€${opts.decimals ? nf2.format(abs) : nf.format(abs)}`;
  if (amount < 0) return `−${body}`;
  return opts.sign && amount > 0 ? `+${body}` : body;
}

export function compactMoney(amount: number): string {
  return amount >= 1000 ? `€${(amount / 1000).toFixed(1)}k` : `€${nf.format(amount)}`;
}

export function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatClock(date: Date): string {
  const time = date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
  const day = date.toLocaleDateString('en-GB', { weekday: 'long' });
  return `${time}, ${day}`;
}

export function formatStamp(date: Date): string {
  return `Today ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

export function num(n: number): string {
  return n.toLocaleString('en-GB');
}
