import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Sun, Thermometer, Droplets, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { StepperInput } from './StepperInput';
import { 
  calculateGPP, 
  formatHumidityRatio, 
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  type UnitSystem 
} from '@/lib/psychrometrics';

interface OutdoorReadingCardProps {
  temperature?: number | null;
  humidity?: number | null;
  gpp?: number | null;
  readingAt?: string | null;
  units: UnitSystem;
  temperatureUnit?: 'F' | 'C';
  onUpdate: (data: { temperature: number; humidity: number; gpp: number }) => void;
  isUpdating?: boolean;
}

export function OutdoorReadingCard({
  temperature,
  humidity,
  gpp,
  readingAt,
  units,
  temperatureUnit = 'F',
  onUpdate,
  isUpdating,
}: OutdoorReadingCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Form state - use display units
  const defaultTemp = temperatureUnit === 'C' ? 22 : 72;
  const [formTemp, setFormTemp] = useState(defaultTemp);
  const [formHumidity, setFormHumidity] = useState(50);

  // Compute GPP for display (always from Fahrenheit internally)
  const tempF = temperatureUnit === 'C' ? celsiusToFahrenheit(formTemp) : formTemp;
  const computedGpp = calculateGPP(tempF, formHumidity);

  const handleOpenSheet = () => {
    // Initialize form with existing values (converted to display units) or defaults
    if (temperature !== null && temperature !== undefined) {
      setFormTemp(temperatureUnit === 'C' ? fahrenheitToCelsius(temperature) : temperature);
    } else {
      setFormTemp(defaultTemp);
    }
    if (humidity !== null && humidity !== undefined) {
      setFormHumidity(humidity);
    } else {
      setFormHumidity(50);
    }
    setSheetOpen(true);
  };

  const handleSubmit = () => {
    // Store in Fahrenheit
    const storedTemp = temperatureUnit === 'C' ? celsiusToFahrenheit(formTemp) : formTemp;
    onUpdate({
      temperature: storedTemp,
      humidity: formHumidity,
      gpp: calculateGPP(storedTemp, formHumidity),
    });
    setSheetOpen(false);
  };

  // Display values
  const displayTemp = temperature !== null && temperature !== undefined
    ? (temperatureUnit === 'C' ? fahrenheitToCelsius(temperature) : temperature)
    : null;

  const hasReading = temperature !== null && temperature !== undefined;

  return (
    <>
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              <span className="font-medium">Outdoor Ambient</span>
            </div>
            <Badge variant="outline" className="border-amber-500/50 text-amber-600">
              Reference
            </Badge>
          </div>

          {hasReading ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                    <Thermometer className="h-3 w-3" />
                    <span>Temp</span>
                  </div>
                  <p className="font-semibold">
                    {displayTemp !== null ? Math.round(displayTemp) : '-'}°{temperatureUnit}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                    <Droplets className="h-3 w-3" />
                    <span>RH</span>
                  </div>
                  <p className="font-semibold">{humidity}%</p>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">
                    {units === 'metric' ? 'g/kg' : 'GPP'}
                  </div>
                  <p className="font-semibold text-amber-600">
                    {gpp ? formatHumidityRatio(gpp, units) : '-'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                <span className="text-xs text-muted-foreground">
                  {readingAt ? format(new Date(readingAt), 'MMM d, h:mm a') : 'No date'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs gap-1"
                  onClick={handleOpenSheet}
                >
                  <RefreshCw className="h-3 w-3" />
                  Update
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                No outdoor reading yet
              </p>
              <Button 
                size="sm" 
                variant="outline"
                className="border-amber-500/50"
                onClick={handleOpenSheet}
              >
                Add Outdoor Reading
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              Outdoor Ambient Reading
            </SheetTitle>
            <SheetDescription>
              Record outdoor conditions as a reference for drying progress
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            <StepperInput
              label="Temperature"
              value={formTemp}
              onChange={setFormTemp}
              min={temperatureUnit === 'C' ? -20 : 0}
              max={temperatureUnit === 'C' ? 50 : 120}
              step={1}
              unit={`°${temperatureUnit}`}
            />

            <StepperInput
              label="Relative Humidity"
              value={formHumidity}
              onChange={setFormHumidity}
              min={0}
              max={100}
              step={1}
              unit="%"
            />

            {/* Computed GPP Display */}
            <div className="bg-amber-500/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Calculated {units === 'metric' ? 'g/kg' : 'GPP'}
              </p>
              <p className="text-3xl font-bold text-amber-600">
                {formatHumidityRatio(computedGpp, units)}
              </p>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Outdoor Reading'}
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
}