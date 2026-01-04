import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
  onSkip: () => void;
  nextLabel?: string;
  showBack?: boolean;
}

export function OnboardingStep({
  icon: Icon,
  title,
  description,
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Next',
  showBack = true,
}: OnboardingStepProps) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-8">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary" />
      </div>

      {/* Content */}
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      
      {children && <div className="w-full mb-6">{children}</div>}

      {/* Progress dots */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentStep ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 w-full max-w-xs">
        {showBack && currentStep > 0 && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={onNext} className="flex-1">
          {nextLabel}
        </Button>
      </div>

      {/* Skip link */}
      <button
        onClick={onSkip}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip onboarding
      </button>
    </div>
  );
}
