import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { StepperInput } from '@/components/readings/StepperInput';
import { calculateGPP, formatHumidityRatio, getHumidityRatioStatus } from '@/lib/psychrometrics';
import { cn } from '@/lib/utils';
import { Thermometer, Droplets, Target } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type DryingChamber = Tables<'drying_chambers'>;

const MATERIAL_TYPES = [
  'Drywall',
  'Wood Framing',
  'Subfloor',
  'Hardwood',
  'Carpet',
  'Concrete',
  'Insulation',
  'Other',
];

interface FloorPlanReadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markerNumber: number;
  chambers: DryingChamber[];
  units: 'imperial' | 'metric';
  temperatureUnit: 'F' | 'C';
  onSubmit: (data: {
    chamberId: string;
    readingType: 'ambient' | 'material';
    temperature: number;
    relativeHumidity: number;
    gpp: number;
    materialType?: string;
    moistureContent?: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function FloorPlanReadingDialog({
  open,
  onOpenChange,
  markerNumber,
  chambers,
  units,
  temperatureUnit,
  onSubmit,
  isLoading = false,
}: FloorPlanReadingDialogProps) {
  const [selectedChamberId, setSelectedChamberId] = useState<string>('');
  const [readingType, setReadingType] = useState<'ambient' | 'material'>('ambient');
  const [temperature, setTemperature] = useState(72);
  const [relativeHumidity, setRelativeHumidity] = useState(50);
  const [materialType, setMaterialType] = useState('');
  const [moistureContent, setMoistureContent] = useState<number | undefined>();

  // Get selected chamber for target GPP
  const selectedChamber = chambers.find((c) => c.id === selectedChamberId);
  const targetGpp = selectedChamber?.target_gpp || 50;

  // Calculate GPP in real-time (convert to F if needed)
  const tempInF = temperatureUnit === 'C' ? (temperature * 9 / 5 + 32) : temperature;
  const gpp = calculateGPP(tempInF, relativeHumidity);
  const gppStatus = getHumidityRatioStatus(gpp, targetGpp);

  // Auto-select first chamber if only one exists
  useEffect(() => {
    if (open && chambers.length === 1 && !selectedChamberId) {
      setSelectedChamberId(chambers[0].id);
    }
  }, [open, chambers, selectedChamberId]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setReadingType('ambient');
      setTemperature(72);
      setRelativeHumidity(50);
      setMaterialType('');
      setMoistureContent(undefined);
      if (chambers.length === 1) {
        setSelectedChamberId(chambers[0].id);
      } else {
        setSelectedChamberId('');
      }
    }
  }, [open, chambers]);

  const handleSubmit = async () => {
    if (!selectedChamberId) return;

    await onSubmit({
      chamberId: selectedChamberId,
      readingType,
      temperature,
      relativeHumidity,
      gpp,
      materialType: readingType === 'material' ? materialType : undefined,
      moistureContent: readingType === 'material' ? moistureContent : undefined,
    });
  };

  const statusColors = {
    success: 'text-success bg-success/10 border-success/30',
    warning: 'text-warning bg-warning/10 border-warning/30',
    emergency: 'text-emergency bg-emergency/10 border-emergency/30',
  };

  const statusLabels = {
    success: 'At Target',
    warning: 'Near Target',
    emergency: 'Above Target',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
              {markerNumber}
            </div>
            Add Reading at Marker #{markerNumber}
          </DialogTitle>
          <DialogDescription>
            Enter the reading values to save and link to this marker.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chamber Selection */}
          <div className="space-y-2">
            <Label>Chamber</Label>
            <Select value={selectedChamberId} onValueChange={setSelectedChamberId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a chamber..." />
              </SelectTrigger>
              <SelectContent>
                {chambers.map((chamber) => (
                  <SelectItem key={chamber.id} value={chamber.id}>
                    {chamber.name}
                    {chamber.target_gpp && (
                      <span className="ml-2 text-muted-foreground text-xs">
                        (Target: {chamber.target_gpp} GPP)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {chambers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No chambers found. Create a chamber first in the Readings tab.
              </p>
            )}
          </div>

          {/* Reading Type Tabs */}
          <Tabs value={readingType} onValueChange={(v) => setReadingType(v as 'ambient' | 'material')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ambient">Ambient</TabsTrigger>
              <TabsTrigger value="material">Material</TabsTrigger>
            </TabsList>

            <TabsContent value="ambient" className="space-y-4 pt-4">
              {/* Stepper Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <StepperInput
                  value={temperature}
                  onChange={setTemperature}
                  min={0}
                  max={150}
                  step={1}
                  fastStep={5}
                  label="Temperature"
                  unit={`°${temperatureUnit}`}
                  size="md"
                />
                <StepperInput
                  value={relativeHumidity}
                  onChange={setRelativeHumidity}
                  min={0}
                  max={100}
                  step={1}
                  fastStep={5}
                  label="Humidity"
                  unit="%"
                  size="md"
                />
              </div>
            </TabsContent>

            <TabsContent value="material" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <StepperInput
                  value={temperature}
                  onChange={setTemperature}
                  min={0}
                  max={150}
                  step={1}
                  fastStep={5}
                  label="Temperature"
                  unit={`°${temperatureUnit}`}
                  size="md"
                />
                <StepperInput
                  value={relativeHumidity}
                  onChange={setRelativeHumidity}
                  min={0}
                  max={100}
                  step={1}
                  fastStep={5}
                  label="Humidity"
                  unit="%"
                  size="md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material Type</Label>
                  <Select value={materialType} onValueChange={setMaterialType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material..." />
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
                  <Label>Moisture Content (%)</Label>
                  <Input
                    type="number"
                    placeholder="0-100"
                    value={moistureContent || ''}
                    onChange={(e) =>
                      setMoistureContent(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* GPP Display */}
          <div
            className={cn(
              'p-4 rounded-lg border-2 flex items-center justify-between',
              statusColors[gppStatus]
            )}
          >
            <div className="space-y-1">
              <div className="text-sm font-medium uppercase tracking-wide opacity-80">
                Calculated GPP
              </div>
              <div className="text-3xl font-bold tabular-nums">
                {formatHumidityRatio(gpp, units)}
              </div>
            </div>
            <div className="text-right space-y-1">
              <Badge variant="outline" className={cn('border-current', statusColors[gppStatus])}>
                {statusLabels[gppStatus]}
              </Badge>
              {selectedChamber?.target_gpp && (
                <div className="flex items-center gap-1 text-xs opacity-70">
                  <Target className="h-3 w-3" />
                  Target: {selectedChamber.target_gpp} GPP
                </div>
              )}
            </div>
          </div>

          {/* Quick Reference */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Thermometer className="h-4 w-4" />
              {temperature}°{temperatureUnit}
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-4 w-4" />
              {relativeHumidity}%
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedChamberId || isLoading || chambers.length === 0}
          >
            {isLoading ? 'Saving...' : 'Save & Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
