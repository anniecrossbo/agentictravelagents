import { type ReactNode } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { TopBar } from '@/components/TopBar';
import { OverlayHost } from './OverlayHost';

/** Frame shared by every page: top bar, content area, bottom navigation and the popup layer. */
export function AppShell({ children, showCreate = true }: { children: ReactNode; showCreate?: boolean }) {
  return (
    <div className="flex h-screen h-dvh flex-col overflow-hidden">
      <TopBar showCreate={showCreate} />
      <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-y-auto px-4 pb-[5.5rem] pt-2 sm:px-6 lg:overflow-hidden">{children}</main>
      <BottomNav />
      <OverlayHost />
    </div>
  );
}
