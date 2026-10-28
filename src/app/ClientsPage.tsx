import { ActionsRail } from '@/components/ActionsRail';
import { AgentLanes } from '@/components/AgentLanes';
import { CustomersWidget } from '@/components/widgets/CustomerWidgets';
import { AppShell } from './AppShell';

export function ClientsPage() {
  return (
    <AppShell>
      <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        <div className="min-h-[32rem] lg:min-h-0">
          <ActionsRail scope="general" introKey="rail.introGeneral" />
        </div>
        <div className="grid min-w-0 gap-5 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <CustomersWidget />
          <AgentLanes only={['sales', 'designer', 'reservations', 'marketing']} className="min-h-[24rem] lg:min-h-0" />
        </div>
      </div>
    </AppShell>
  );
}
