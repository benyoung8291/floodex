import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StepperInput } from './StepperInput';
import { 
  calculateGPP, 
  formatHumidityRatio, 
  getHumidityRatioStatus,
  getHumidityRatioUnit,
  celsiusToFahrenheit,
  type UnitSystem 
} from '@/lib/psychrometrics';
import { cn } from '@/lib/utils';

const MATERIAL_TYPES = [
  'Carpet',
  'Carpet Pad',
  'Drywall',
  'Subfloor',
  'Hardwood',
  'Concrete',
  'Insulation',
  'Other',
];

interface ReadingEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chamberName: string;
  targetGpp?: number | null;
  units: UnitSystem;
  temperatureUnit?: 'F' | 'C';
  /** Latest prior reading for this chamber (used for smart defaults). Temperatures here are stored °F. */
  previousReading?: {
    temperature: number;
    relative_humidity: number;
    gpp: number;
    recorded_at?: string | Date;
  } | null;
  onSubmit: (data: {
    readingType: 'ambient' | 'material';
    temperature: number;
    relativeHumidity: number;
    gpp: number;
    materialType?: string;
    moistureContent?: number;
  }) => void;
  isLoading?: boolean;
}

export function ReadingEntryForm({
  open,
  onOpenChange,
  chamberName,
  targetGpp,
  units,
  temperatureUnit = 'F',
  previousReading,
  onSubmit,
  isLoading,
}: ReadingEntryFormProps) {
  // Temperature defaults based on unit
  const defaultTemp = temperatureUnit === 'C' ? 22 : 72;
  const tempMin = temperatureUnit === 'C' ? 0 : 32;
  const tempMax = temperatureUnit === 'C' ? 50 : 120;

  // Convert previous reading (stored °F) into the user's display unit
  const prevTempInDisplayUnit = previousReading
    ? (temperatureUnit === 'C' ? Math.round((previousReading.temperature - 32) * 5 / 9) : Math.round(previousReading.temperature))
    : null;
  const prevRH = previousReading ? Math.round(previousReading.relative_humidity) : null;

  const [readingType, setReadingType] = useState<'ambient' | 'material'>('ambient');
  const [temperature, setTemperature] = useState(prevTempInDisplayUnit ?? defaultTemp);
  const [relativeHumidity, setRelativeHumidity] = useState(prevRH ?? 50);
  const [materialType, setMaterialType] = useState('');
  const [moistureContent, setMoistureContent] = useState<string>('');

  // Calculate GPP in real-time (always in Fahrenheit for calculation)
  const tempForCalc = temperatureUnit === 'C' ? celsiusToFahrenheit(temperature) : temperature;
  const gpp = calculateGPP(tempForCalc, relativeHumidity);
  const status = targetGpp ? getHumidityRatioStatus(gpp, targetGpp) : null;

  // Reset form when dialog opens — prefill from previous reading when available.
  useEffect(() => {
    if (open) {
      setTemperature(prevTempInDisplayUnit ?? defaultTemp);
      setRelativeHumidity(prevRH ?? 50);
      setMaterialType('');
      setMoistureContent('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = () => {
    // Convert temperature to Fahrenheit for storage if entered in Celsius
    const tempToStore = temperatureUnit === 'C' ? celsiusToFahrenheit(temperature) : temperature;
    
    onSubmit({
      readingType,
      temperature: tempToStore,
      relativeHumidity,
      gpp,
      materialType: readingType === 'material' ? materialType : undefined,
      moistureContent: readingType === 'material' && moistureContent 
        ? parseFloat(moistureContent) 
        : undefined,
    });
  };

  const statusColors = {
    success: 'text-success bg-success/10 border-success',
    warning: 'text-warning bg-warning/10 border-warning',
    emergency: 'text-emergency bg-emergency/10 border-emergency',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Reading - {chamberName}</DialogTitle>
          {previousReading && prevTempInDisplayUnit !== null && prevRH !== null && (
            <p className="text-xs text-muted-foreground">
              Prefilled from last reading: {prevTempInDisplayUnit}°{temperatureUnit} · {prevRH}% RH · {formatHumidityRatio(previousReading.gpp, units)}
            </p>
          )}
        </DialogHeader>

        <Tabs value={readingType} onValueChange={(v) => setReadingType(v as 'ambient' | 'material')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ambient">Ambient</TabsTrigger>
            <TabsTrigger value="material">Material</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            {/* Temperature Stepper */}
            <StepperInput
              value={temperature}
              onChange={setTemperature}
              min={tempMin}
              max={tempMax}
              step={1}
              fastStep={10}
              label="Temperature"
              unit={`°${temperatureUnit}`}
            />

            {/* Relative Humidity Stepper */}
            <StepperInput
              value={relativeHumidity}
              onChange={setRelativeHumidity}
              min={0}
              max={100}
              step={1}
              fastStep={10}
              label="Relative Humidity"
              unit="%"
            />

            {/* GPP Display */}
            <div 
              className={cn(
                'p-4 rounded-lg border-2 text-center',
                status ? statusColors[status] : 'bg-muted/50 border-border'
              )}
            >
              <p className="text-sm font-medium uppercase tracking-wide mb-1">
                {getHumidityRatioUnit(units)}
              </p>
              <p className="text-4xl font-bold tabular-nums">
                {formatHumidityRatio(gpp, units)}
              </p>
              {targetGpp && (
                <p className="text-sm mt-1 opacity-80">
                  Target: {formatHumidityRatio(targetGpp, units)}
                </p>
              )}
            </div>

            {/* Material-specific fields */}
            <TabsContent value="material" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label>Material Type</Label>
                <Select value={materialType} onValueChange={setMaterialType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moisture-content">Moisture Content %</Label>
                <Input
                  id="moisture-content"
                  type="number"
                  step="0.1"
                  value={moistureContent}
                  onChange={(e) => setMoistureContent(e.target.value)}
                  placeholder="e.g., 18.5"
                />
                <p className="text-xs text-muted-foreground">
                  Pin-type meter reading
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || (readingType === 'material' && !materialType)}
          >
            {isLoading ? 'Saving...' : 'Save Reading'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
