import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ChamberCard } from './ChamberCard';
import type { Tables } from '@/integrations/supabase/types';
import type { UnitSystem } from '@/lib/psychrometrics';

type DryingChamber = Tables<'drying_chambers'>;
type MoistureReading = Tables<'moisture_readings'>;

interface ChamberListProps {
  chambers: DryingChamber[];
  latestReadings: Map<string, MoistureReading>;
  units: UnitSystem;
  onAddChamber: () => void;
  onAddReading: (chamberId: string) => void;
  onViewHistory: (chamberId: string) => void;
  isLoading?: boolean;
}

export function ChamberList({
  chambers,
  latestReadings,
  units,
  onAddChamber,
  onAddReading,
  onViewHistory,
  isLoading,
}: ChamberListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (chambers.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
        <p className="text-muted-foreground mb-4">
          No drying chambers yet. Add a chamber to start logging readings.
        </p>
        <Button onClick={onAddChamber} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Chamber
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {chambers.map((chamber) => (
          <ChamberCard
            key={chamber.id}
            chamber={chamber}
            latestReading={latestReadings.get(chamber.id)}
            units={units}
            onAddReading={onAddReading}
            onViewHistory={onViewHistory}
          />
        ))}
      </div>
      
      <Button 
        variant="outline" 
        className="w-full gap-2 border-dashed"
        onClick={onAddChamber}
      >
        <Plus className="h-4 w-4" />
        Add Chamber
      </Button>
    </div>
  );
}
