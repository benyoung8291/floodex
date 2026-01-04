import { Check, SkipForward } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatHumidityRatio, type UnitSystem } from '@/lib/psychrometrics';

interface CompletedReading {
  chamberId: string;
  chamberName: string;
  temperature: number;
  relativeHumidity: number;
  gpp: number;
  readingType: 'ambient' | 'material';
  materialType?: string;
  moistureContent?: number;
}

interface QuickLogSummaryProps {
  completedReadings: CompletedReading[];
  skippedChamberNames: string[];
  units: UnitSystem;
  temperatureUnit: 'F' | 'C';
}

export function QuickLogSummary({
  completedReadings,
  skippedChamberNames,
  units,
  temperatureUnit,
}: QuickLogSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-success">
        <Check className="w-5 h-5" />
        <span className="font-medium">
          {completedReadings.length} reading{completedReadings.length !== 1 ? 's' : ''} logged successfully
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {completedReadings.map((reading) => (
          <Card key={reading.chamberId} className="bg-success/5 border-success/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{reading.chamberName}</p>
                  <p className="text-sm text-muted-foreground">
                    {reading.temperature}°{temperatureUnit} • {reading.relativeHumidity}% RH
                    {reading.readingType === 'material' && reading.materialType && (
                      <> • {reading.materialType}</>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">
                    {formatHumidityRatio(reading.gpp, units)}
                  </p>
                  {reading.moistureContent && (
                    <p className="text-xs text-muted-foreground">
                      MC: {reading.moistureContent}%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {skippedChamberNames.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <SkipForward className="w-4 h-4" />
              <span>Skipped ({skippedChamberNames.length})</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {skippedChamberNames.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
