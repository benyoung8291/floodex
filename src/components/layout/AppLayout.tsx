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

  // Wizard routes keep their own Cancel/Back/Next — hide overlapping chrome
  const isJobWizard = /\/jobs\/new/.test(location.pathname);

  return (
    <div className={cn(
      "flex w-full bg-background max-w-full",
      isJobWizard ? "h-dvh overflow-hidden" : "min-h-dvh"
    )}>
      {isImpersonating && <ImpersonationBanner />}

      {!isMobile && <DesktopSidebar />}

      <div className={cn(
        "flex-1 flex flex-col max-w-full min-w-0",
        isJobWizard ? "min-h-0 overflow-hidden" : "min-h-dvh",
        isImpersonating && "pt-10"
      )}>
        {user && isTenantAdmin && !isImpersonating && (
          <>
            <TrialBanner />
            <UsageWarningBanner />
          </>
        )}

        <TopHeader onOpenSearch={() => palette.setOpen(true)} />

        <main className={cn(
          "flex-1 min-w-0 min-h-0",
          isJobWizard ? "p-0 overflow-hidden flex flex-col" : "overflow-y-auto p-4 pb-24 md:pb-4"
        )}>
          {children}
        </main>

        {isMobile && !isJobWizard && <MobileBottomNav />}
      </div>

      {!isJobWizard && <CaptureFAB />}
      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />
    </div>
  );
}
