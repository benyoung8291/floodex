import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Thermometer, Droplets, Check } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { formatHumidityRatio } from '@/lib/psychrometrics';
import { cn } from '@/lib/utils';

type MoistureReading = Tables<'moisture_readings'>;
type DryingChamber = Tables<'drying_chambers'>;

interface ReadingLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markerNumber: number;
  readings: MoistureReading[];
  chambers: DryingChamber[];
  linkedReadingIds: string[];
  onLink: (readingId: string) => void;
}

export const ReadingLinkDialog = ({
  open,
  onOpenChange,
  markerNumber,
  readings,
  chambers,
  linkedReadingIds,
  onLink,
}: ReadingLinkDialogProps) => {
  const [selectedChamberId, setSelectedChamberId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReadingId, setSelectedReadingId] = useState<string | null>(null);

  const chamberMap = useMemo(() => {
    return chambers.reduce((acc, chamber) => {
      acc[chamber.id] = chamber;
      return acc;
    }, {} as Record<string, DryingChamber>);
  }, [chambers]);

  const filteredReadings = useMemo(() => {
    return readings.filter((reading) => {
      // Filter out already linked readings
      if (linkedReadingIds.includes(reading.id)) return false;

      // Filter by chamber
      if (selectedChamberId !== 'all' && reading.chamber_id !== selectedChamberId) {
        return false;
      }

      // Filter by search (date or values)
      if (searchQuery) {
        const dateStr = format(new Date(reading.logged_at), 'MMM d yyyy').toLowerCase();
        const query = searchQuery.toLowerCase();
        if (!dateStr.includes(query)) return false;
      }

      return true;
    });
  }, [readings, linkedReadingIds, selectedChamberId, searchQuery]);

  const handleConfirm = () => {
    if (selectedReadingId) {
      onLink(selectedReadingId);
      onOpenChange(false);
      setSelectedReadingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link Reading to Marker #{markerNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Chamber</Label>
              <Select value={selectedChamberId} onValueChange={setSelectedChamberId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All chambers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All chambers</SelectItem>
                  {chambers.map((chamber) => (
                    <SelectItem key={chamber.id} value={chamber.id}>
                      {chamber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9"
                />
              </div>
            </div>
          </div>

          {/* Readings list */}
          <ScrollArea className="h-[300px] border rounded-lg">
            {filteredReadings.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No available readings
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredReadings.map((reading) => {
                  const chamber = chamberMap[reading.chamber_id];
                  const isSelected = selectedReadingId === reading.id;

                  return (
                    <button
                      key={reading.id}
                      onClick={() => setSelectedReadingId(reading.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-colors',
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted border-transparent'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {chamber?.name || 'Unknown'}
                          </Badge>
                        </div>
                        <span className="font-semibold">
                          {reading.gpp
                            ? formatHumidityRatio(reading.gpp, 'imperial')
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Thermometer className="h-3 w-3" />
                          {reading.temperature}°F
                        </span>
                        <span className="flex items-center gap-1">
                          <Droplets className="h-3 w-3" />
                          {reading.relative_humidity}%
                        </span>
                        <span>
                          {format(new Date(reading.logged_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedReadingId}>
            Link Reading
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
