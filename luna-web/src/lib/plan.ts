import type { AgentCase, PlanStep } from '@/contracts';

export function stepsDone(plan: PlanStep[]): number {
  return plan.filter((s) => s.state === 'done').length;
}

/** Marks a step done and promotes the next not-started step to the active one. */
export function completeStep(plan: PlanStep[], stepId: string, when: string): PlanStep[] {
  const idx = plan.findIndex((s) => s.id === stepId);
  if (idx < 0) return plan;
  return plan.map((s, i) => {
    if (i === idx) return { ...s, state: 'done' as const, when };
    if (i === idx + 1 && s.state === 'not-started') return { ...s, state: 'working' as const };
    return s;
  });
}

export function caseNeedsYou(c: AgentCase): boolean {
  return c.plan.some((s) => s.state === 'needs-you');
}
