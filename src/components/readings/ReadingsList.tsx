import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, ThermometerSun, Layers } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { 
  formatHumidityRatio, 
  getHumidityRatioStatus,
  type UnitSystem 
} from '@/lib/psychrometrics';
import { cn } from '@/lib/utils';

type MoistureReading = Tables<'moisture_readings'>;

interface ReadingsListProps {
  readings: MoistureReading[];
  targetGpp?: number | null;
  units: UnitSystem;
  isLoading?: boolean;
}

export function ReadingsList({
  readings,
  targetGpp,
  units,
  isLoading,
}: ReadingsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No readings logged yet
      </div>
    );
  }

  // Group readings by date
  const groupedByDate = readings.reduce((acc, reading) => {
    const date = format(new Date(reading.logged_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(reading);
    return acc;
  }, {} as Record<string, MoistureReading[]>);

  const statusColors = {
    success: 'border-l-success',
    warning: 'border-l-warning',
    emergency: 'border-l-emergency',
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, dayReadings]) => (
        <div key={date}>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {format(new Date(date), 'EEEE, MMMM d')}
          </h4>
          
          <div className="space-y-2">
            {dayReadings.map((reading) => {
              const status = reading.gpp && targetGpp 
                ? getHumidityRatioStatus(reading.gpp, targetGpp) 
                : null;

              return (
                <Card 
                  key={reading.id}
                  className={cn(
                    'border-l-4',
                    status ? statusColors[status] : 'border-l-border'
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={reading.reading_type === 'ambient' ? 'default' : 'secondary'}>
                          {reading.reading_type === 'ambient' ? (
                            <Droplets className="h-3 w-3 mr-1" />
                          ) : (
                            <Layers className="h-3 w-3 mr-1" />
                          )}
                          {reading.reading_type}
                        </Badge>
                        
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(reading.logged_at), 'h:mm a')}
                        </span>
                      </div>

                      {reading.gpp && (
                        <span className="text-lg font-semibold">
                          {formatHumidityRatio(reading.gpp, units)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThermometerSun className="h-3 w-3" />
                        {reading.temperature}°F
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {reading.relative_humidity}%
                      </span>
                      {reading.material_type && (
                        <span>{reading.material_type}: {reading.moisture_content}%</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
