import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { TopHeader } from './TopHeader';
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
  const { user, isTenantAdmin, isImpersonating } = useAuth();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Impersonation Banner - fixed at top */}
      {isImpersonating && <ImpersonationBanner />}

      {/* Desktop Sidebar */}
      {!isMobile && <DesktopSidebar />}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen",
        isImpersonating && "pt-10"
      )}>
        {/* Billing Banners - only show for logged in tenant admins, not during impersonation */}
        {user && isTenantAdmin && !isImpersonating && (
          <>
            <TrialBanner />
            <UsageWarningBanner />
          </>
        )}
        
        <TopHeader />
        
        <main className="flex-1 overflow-auto p-4 pb-20 md:pb-4">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileBottomNav />}
      </div>
    </div>
  );
}
