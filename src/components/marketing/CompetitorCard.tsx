import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CompetitorCardProps {
  competitorName: string;
  competitorDescription: string;
  advantages: string[];
  targetAudience: string;
  reversed?: boolean;
}

export function CompetitorCard({
  competitorName,
  competitorDescription,
  advantages,
  targetAudience,
  reversed = false,
}: CompetitorCardProps) {
  return (
    <div
      className={cn(
        'grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-16',
        reversed && 'lg:[&>*:first-child]:order-2'
      )}
    >
      {/* Competitor Side */}
      <div className="space-y-4">
        <div className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
          vs. {competitorName}
        </div>
        <h3 className="text-2xl lg:text-3xl font-bold">
          FloodEx vs. {competitorName}
        </h3>
        <p className="text-muted-foreground">{competitorDescription}</p>
        <div className="pt-2">
          <p className="text-sm font-medium text-primary">
            Best for: {targetAudience}
          </p>
        </div>
      </div>

      {/* Advantages Side */}
      <div className="bg-card rounded-xl border border-border p-6 lg:p-8 space-y-6">
        <h4 className="font-semibold text-lg">Why teams choose FloodEx</h4>
        <ul className="space-y-4">
          {advantages.map((advantage, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-muted-foreground">{advantage}</span>
            </li>
          ))}
        </ul>
        <Link to="/auth?tab=signup">
          <Button className="w-full sm:w-auto group">
            Try FloodEx Free
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
