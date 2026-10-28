import { EmailWidget, TemplatesWidget, UserSettingsWidget, WhatsAppWidget, YourTeamWidget } from '@/components/widgets/SettingsWidgets';
import { AppShell } from './AppShell';

export function SettingsPage() {
  return (
    <AppShell>
      <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        <YourTeamWidget />
        <div className="grid min-w-0 gap-5 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid min-h-0 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
            <UserSettingsWidget />
            <WhatsAppWidget />
          </div>
          <div className="grid min-h-0 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
            <TemplatesWidget />
            <EmailWidget />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
