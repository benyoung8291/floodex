import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { TopHeader } from './TopHeader';
import { UsageWarningBanner } from '@/components/billing/UsageWarningBanner';
import { TrialBanner } from '@/components/billing/TrialBanner';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const { user, isTenantAdmin } = useAuth();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && <DesktopSidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Billing Banners - only show for logged in tenant admins */}
        {user && isTenantAdmin && (
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
