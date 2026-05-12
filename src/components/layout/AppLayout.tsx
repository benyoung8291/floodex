import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { TopHeader } from './TopHeader';
import { CaptureFAB } from './CaptureFAB';
import { CommandPalette, useCommandPalette } from './CommandPalette';
import { UsageWarningBanner } from '@/components/billing/UsageWarningBanner';
import { TrialBanner } from '@/components/billing/TrialBanner';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, isTenantAdmin, isImpersonating } = useAuth();
  const palette = useCommandPalette();

  // Hide global FAB on routes that have their own primary capture (e.g. wizards)
  const hideFab = /\/jobs\/new/.test(location.pathname);

  return (
    <div className="min-h-dvh flex w-full bg-background max-w-full">
      {isImpersonating && <ImpersonationBanner />}

      {!isMobile && <DesktopSidebar />}

      <div className={cn(
        "flex-1 flex flex-col min-h-dvh max-w-full min-w-0",
        isImpersonating && "pt-10"
      )}>
        {user && isTenantAdmin && !isImpersonating && (
          <>
            <TrialBanner />
            <UsageWarningBanner />
          </>
        )}

        <TopHeader onOpenSearch={() => palette.setOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4 min-w-0">
          {children}
        </main>

        {isMobile && <MobileBottomNav />}
      </div>

      {!hideFab && <CaptureFAB />}
      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />
    </div>
  );
}
