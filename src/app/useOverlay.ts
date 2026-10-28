import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type Overlay, formatOverlay, parseOverlay } from '@/lib/overlay';

/** Popups live in the URL (?o=...) so every popup state can be linked, refreshed and navigated with Back. */
export function useOverlay() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('o');
  const from = params.get('from');
  const current = useMemo(() => parseOverlay(raw), [raw]);

  const write = useCallback(
    (o: Overlay | null, fromKey: string | null, replace: boolean) => {
      const next = new URLSearchParams(params);
      if (o) next.set('o', formatOverlay(o));
      else next.delete('o');
      if (fromKey) next.set('from', fromKey);
      else next.delete('from');
      setParams(next, { replace });
    },
    [params, setParams],
  );

  /** Opens a popup on top of the current one; Back returns to where the user was. */
  const open = useCallback((o: Overlay) => write(o, raw, false), [write, raw]);
  /** Switches the visible popup in place (tabs, list ↔ detail). */
  const swap = useCallback((o: Overlay) => write(o, from, true), [write, from]);
  const close = useCallback(() => write(null, null, true), [write]);
  /** Back arrow inside a popup: return to the popup that opened this one, otherwise close. */
  const back = useCallback(() => {
    const prev = parseOverlay(from);
    if (prev) write(prev, null, true);
    else write(null, null, true);
  }, [from, write]);

  return { current, open, swap, close, back, hasFrom: Boolean(from) };
}
