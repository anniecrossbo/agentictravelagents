import type { Portrait as PortraitSpec } from '@/contracts';

/** A teammate's illustrated portrait, shown as an image. */
export function Portrait({ spec, size = 48, label }: { spec: PortraitSpec; size?: number; label?: string }) {
  return <img src={spec.src} width={size} height={size} alt={label ?? ''} aria-hidden={label ? undefined : true} className="shrink-0 rounded-full" />;
}
