import { ActionsRail } from '@/components/ActionsRail';
import { AgentLanes } from '@/components/AgentLanes';
import { AppShell } from './AppShell';

export function DashboardPage() {
  return (
    <AppShell showCreate={false}>
      <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        <div className="min-h-[32rem] lg:min-h-0">
          <ActionsRail scope="general" introKey="rail.introGeneral" />
        </div>
        <AgentLanes className="min-h-[32rem] lg:min-h-0" />
      </div>
    </AppShell>
  );
}
