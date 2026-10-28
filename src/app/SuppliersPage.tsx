import { ActionsRail } from '@/components/ActionsRail';
import { CommissionWidget, SupplierTeamWidget, SuppliersWidget } from '@/components/widgets/SupplierWidgets';
import { AppShell } from './AppShell';

export function SuppliersPage() {
  return (
    <AppShell>
      <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        <div className="min-h-[32rem] lg:min-h-0">
          <ActionsRail scope="supplier" introKey="rail.introSupplier" />
        </div>
        <div className="grid min-w-0 gap-5 lg:min-h-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
          <SuppliersWidget />
          <div className="grid min-h-0 gap-5 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
            <CommissionWidget />
            <SupplierTeamWidget />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
