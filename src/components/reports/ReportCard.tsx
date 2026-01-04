import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ReportCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}

export function ReportCard({ title, description, icon: Icon, onClick, disabled }: ReportCardProps) {
  return (
    <Card 
      className={`transition-all duration-200 ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:border-primary/50 hover:shadow-md cursor-pointer'
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button 
          className="w-full mt-4" 
          variant="outline"
          disabled={disabled}
        >
          Generate Report
        </Button>
      </CardContent>
    </Card>
  );
}
