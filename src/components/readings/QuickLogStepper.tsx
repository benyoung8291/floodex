import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickLogStepperProps {
  chambers: Array<{ id: string; name: string }>;
  currentIndex: number;
  completedIds: string[];
  skippedIds: string[];
  onStepClick?: (index: number) => void;
}

export function QuickLogStepper({
  chambers,
  currentIndex,
  completedIds,
  skippedIds,
  onStepClick,
}: QuickLogStepperProps) {
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {chambers.map((chamber, index) => {
        const isCompleted = completedIds.includes(chamber.id);
        const isSkipped = skippedIds.includes(chamber.id);
        const isCurrent = index === currentIndex;
        const canClick = isCompleted && onStepClick;

        return (
          <button
            key={chamber.id}
            type="button"
            onClick={() => canClick && onStepClick(index)}
            disabled={!canClick}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all',
              isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background',
              isCompleted && !isCurrent && 'bg-success text-success-foreground cursor-pointer hover:ring-2 hover:ring-success hover:ring-offset-2 hover:ring-offset-background',
              isSkipped && !isCurrent && 'bg-muted text-muted-foreground line-through',
              !isCurrent && !isCompleted && !isSkipped && 'bg-secondary text-secondary-foreground'
            )}
            title={chamber.name}
          >
            {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
          </button>
        );
      })}
    </div>
  );
}
