import { ActionsRail } from '@/components/ActionsRail';
import { FinanceRecordsWidget, FinanceTeamWidget } from '@/components/widgets/FinanceWidgets';
import { AppShell } from './AppShell';

export function FinancePage() {
  return (
    <AppShell>
      <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        <div className="min-h-[32rem] lg:min-h-0">
          <ActionsRail scope="finance" introKey="rail.introFinance" />
        </div>
        <div className="grid min-w-0 gap-5 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <FinanceRecordsWidget />
          <FinanceTeamWidget />
        </div>
      </div>
    </AppShell>
  );
}
