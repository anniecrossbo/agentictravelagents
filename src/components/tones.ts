import type { AgentStatus, Tone } from '@/contracts';

export const chipClass: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-fg-subtle',
  positive: 'bg-positive-soft text-positive',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  brand: 'bg-brand-soft text-brand',
  info: 'bg-info-soft text-info',
};

export const dotClass: Record<Tone, string> = {
  neutral: 'bg-fg-muted',
  positive: 'bg-accent',
  warning: 'bg-warning-dot',
  danger: 'bg-danger-dot',
  brand: 'bg-accent',
  info: 'bg-info',
};

export const textToneClass: Record<Tone, string> = {
  neutral: 'text-fg',
  positive: 'text-positive',
  warning: 'text-warning',
  danger: 'text-danger',
  brand: 'text-brand',
  info: 'text-info',
};

export const statusTone: Record<AgentStatus, Tone> = {
  working: 'brand',
  waiting: 'warning',
  'needs-you': 'danger',
  'caught-up': 'positive',
  paused: 'neutral',
};

export const avatarToneClass: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'bg-tone-1',
  2: 'bg-tone-2',
  3: 'bg-tone-3',
  4: 'bg-tone-4',
  5: 'bg-tone-5',
  6: 'bg-tone-6',
};
