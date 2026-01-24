import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: number;
  jobsIncluded: number;
  readingsIncluded: number;
  overagePerJob: number;
  overagePerReading: number;
  isPopular?: boolean;
  isFree?: boolean;
  delay?: number;
}

export function PricingCard({
  name,
  price,
  jobsIncluded,
  readingsIncluded,
  overagePerJob,
  overagePerReading,
  isPopular = false,
  isFree = false,
  delay = 0,
}: PricingCardProps) {
  const features = [
    `${jobsIncluded} jobs per month`,
    `${readingsIncluded.toLocaleString()} moisture readings`,
    'Unlimited photos & annotations',
    'Professional PDF reports',
    'Team collaboration',
    ...(price >= 149 ? ['Priority support'] : []),
    ...(price >= 399 ? ['API access', 'Custom branding'] : []),
  ];

  return (
    <div
      className={cn(
        "relative p-6 lg:p-8 rounded-2xl border transition-all duration-300 animate-fade-in",
        isPopular
          ? "bg-gradient-to-b from-primary/10 to-card border-primary shadow-xl shadow-primary/20 scale-105"
          : "bg-card border-border hover:border-primary/50 hover:shadow-lg"
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Most Popular
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl lg:text-5xl font-bold">
            {isFree ? 'Free' : `$${price}`}
          </span>
          {!isFree && <span className="text-muted-foreground">/month</span>}
        </div>
        {!isFree && (
          <p className="text-sm text-muted-foreground mt-2">
            +${overagePerJob.toFixed(2)}/job, ${overagePerReading.toFixed(3)}/reading overage
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link to="/auth?tab=signup" className="block">
        <Button
          className={cn(
            "w-full",
            isPopular
              ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              : "bg-secondary hover:bg-secondary/80"
          )}
          size="lg"
        >
          {isFree ? 'Get Started' : 'Start Free Trial'}
        </Button>
      </Link>

      {!isFree && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          14-day free trial • No credit card required
        </p>
      )}
    </div>
  );
}
