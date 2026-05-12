import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NextAction } from '@/hooks/useNextAction';

const severityStyles: Record<NextAction['severity'], { ring: string; icon: typeof AlertTriangle; iconColor: string }> = {
  critical: { ring: 'border-emergency/40 bg-emergency/5', icon: AlertTriangle, iconColor: 'text-emergency' },
  warning:  { ring: 'border-warning/40 bg-warning/5',     icon: Clock,          iconColor: 'text-warning'   },
  info:     { ring: 'border-primary/40 bg-primary/5',     icon: Sparkles,       iconColor: 'text-primary'   },
  success:  { ring: 'border-success/40 bg-success/5',     icon: CheckCircle2,   iconColor: 'text-success'   },
};

interface NextActionCardProps {
  action: NextAction;
  showJobName?: boolean;
  className?: string;
}

export function NextActionCard({ action, showJobName = true, className }: NextActionCardProps) {
  const navigate = useNavigate();
  const style = severityStyles[action.severity];
  const Icon = style.icon;

  return (
    <Card
      className={cn(
        'border-2 transition-all cursor-pointer active:scale-[0.99] hover:shadow-md',
        style.ring,
        className,
      )}
      onClick={() => navigate(action.href)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(action.href);
        }
      }}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn('flex-shrink-0 h-10 w-10 rounded-full bg-card border flex items-center justify-center', style.iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">{action.title}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {showJobName ? `${action.jobName} • ` : ''}{action.detail}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="flex-shrink-0 gap-1 h-8 px-2"
          onClick={(e) => { e.stopPropagation(); navigate(action.href); }}
        >
          <span className="hidden sm:inline text-xs">{action.cta}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
