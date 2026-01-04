import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link2, Unlink, ExternalLink, Thermometer, Droplets } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { formatHumidityRatio, getHumidityRatioStatus } from '@/lib/psychrometrics';
import { cn } from '@/lib/utils';

type MoistureReading = Tables<'moisture_readings'>;

interface ReadingMarkerPopoverProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markerNumber: number;
  linkedReading: MoistureReading | null;
  onLinkClick: () => void;
  onUnlink: () => void;
  onViewReading: () => void;
}

export const ReadingMarkerPopover = ({
  children,
  open,
  onOpenChange,
  markerNumber,
  linkedReading,
  onLinkClick,
  onUnlink,
  onViewReading,
}: ReadingMarkerPopoverProps) => {
  const statusColors = {
    success: 'text-success',
    warning: 'text-warning',
    emergency: 'text-emergency',
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72" side="top" align="center">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
                {markerNumber}
              </div>
              <span className="font-medium">Reading Point #{markerNumber}</span>
            </div>
            {linkedReading && (
              <Badge variant="outline" className="text-xs">
                Linked
              </Badge>
            )}
          </div>

          {linkedReading ? (
            <>
              <div className="bg-muted rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">GPP</span>
                  <span
                    className={cn(
                      'text-lg font-semibold',
                      linkedReading.gpp
                        ? statusColors[getHumidityRatioStatus(linkedReading.gpp, 50)]
                        : ''
                    )}
                  >
                    {linkedReading.gpp
                      ? formatHumidityRatio(linkedReading.gpp, 'imperial')
                      : 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Thermometer className="h-3 w-3" />
                    {linkedReading.temperature}°F
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Droplets className="h-3 w-3" />
                    {linkedReading.relative_humidity}%
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(linkedReading.logged_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onViewReading}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={onUnlink}
                >
                  <Unlink className="h-3 w-3 mr-1" />
                  Unlink
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No reading linked to this marker.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onLinkClick}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Link Reading
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
