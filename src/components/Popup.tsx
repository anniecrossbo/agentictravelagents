import { type ReactNode, useEffect, useRef } from 'react';
import { cx } from './Primitives';

/** Modal shell used by every popup: scrim, dialog role, Escape to close, initial focus. */
export function Popup({ label, onClose, width = 'max-w-[1200px]', children, tone = 'canvas' }: { label: string; onClose: () => void; width?: string; children: ReactNode; tone?: 'canvas' | 'surface' | 'glow' }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-3 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cx('flex max-h-full w-full flex-col overflow-hidden rounded-popup shadow-pop outline-none', width, tone === 'canvas' ? 'bg-canvas' : tone === 'glow' ? 'bg-linear-to-br from-glow-from via-surface to-glow-to' : 'bg-surface')}
      >
        {children}
      </div>
    </div>
  );
}
