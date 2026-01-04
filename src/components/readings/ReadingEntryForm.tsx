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
  onSubmit,
  isLoading,
}: ReadingEntryFormProps) {
  const [readingType, setReadingType] = useState<'ambient' | 'material'>('ambient');
  const [temperature, setTemperature] = useState(72);
  const [relativeHumidity, setRelativeHumidity] = useState(50);
  const [materialType, setMaterialType] = useState('');
  const [moistureContent, setMoistureContent] = useState<string>('');

  // Calculate GPP in real-time
  const gpp = calculateGPP(temperature, relativeHumidity);
  const status = targetGpp ? getHumidityRatioStatus(gpp, targetGpp) : null;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTemperature(72);
      setRelativeHumidity(50);
      setMaterialType('');
      setMoistureContent('');
    }
  }, [open]);

  const handleSubmit = () => {
    onSubmit({
      readingType,
      temperature,
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
              min={32}
              max={120}
              step={1}
              fastStep={10}
              label="Temperature"
              unit="°F"
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
