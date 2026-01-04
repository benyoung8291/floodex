import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  fastStep?: number; // Step size for long press
  label: string;
  unit: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StepperInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  fastStep = 10,
  label,
  unit,
  size = 'lg',
  className,
}: StepperInputProps) {
  const [isPressed, setIsPressed] = useState<'inc' | 'dec' | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const increment = useCallback((fast = false) => {
    onChange(Math.min(max, value + (fast ? fastStep : step)));
  }, [value, onChange, max, step, fastStep]);

  const decrement = useCallback((fast = false) => {
    onChange(Math.max(min, value - (fast ? fastStep : step)));
  }, [value, onChange, min, step, fastStep]);

  const startLongPress = useCallback((direction: 'inc' | 'dec') => {
    setIsPressed(direction);
    
    // After 500ms, start fast incrementing
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (direction === 'inc') {
          increment(true);
        } else {
          decrement(true);
        }
      }, 100);
    }, 500);
  }, [increment, decrement]);

  const stopLongPress = useCallback(() => {
    setIsPressed(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const buttonSize = size === 'lg' ? 'h-14 w-14' : size === 'md' ? 'h-12 w-12' : 'h-10 w-10';
  const valueSize = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-2xl';
  const iconSize = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {label} ({unit})
      </span>
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            buttonSize,
            'rounded-full border-2 transition-all active:scale-95',
            isPressed === 'dec' && 'bg-primary/10 border-primary'
          )}
          onMouseDown={() => startLongPress('dec')}
          onMouseUp={stopLongPress}
          onMouseLeave={stopLongPress}
          onTouchStart={() => startLongPress('dec')}
          onTouchEnd={stopLongPress}
          onClick={() => decrement(false)}
          disabled={value <= min}
        >
          <Minus className={iconSize} />
        </Button>

        <div className="min-w-[100px] text-center">
          <span className={cn(valueSize, 'font-bold tabular-nums')}>
            {value}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className={cn(
            buttonSize,
            'rounded-full border-2 transition-all active:scale-95',
            isPressed === 'inc' && 'bg-primary/10 border-primary'
          )}
          onMouseDown={() => startLongPress('inc')}
          onMouseUp={stopLongPress}
          onMouseLeave={stopLongPress}
          onTouchStart={() => startLongPress('inc')}
          onTouchEnd={stopLongPress}
          onClick={() => increment(false)}
          disabled={value >= max}
        >
          <Plus className={iconSize} />
        </Button>
      </div>

      <span className="text-xs text-muted-foreground">
        Hold for ±{fastStep}
      </span>
    </div>
  );
}
