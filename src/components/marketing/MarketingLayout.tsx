import { ReactNode } from 'react';
import { MarketingNav } from './MarketingNav';
import { MarketingFooter } from './MarketingFooter';

interface MarketingLayoutProps {
  children: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="marketing-theme min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
