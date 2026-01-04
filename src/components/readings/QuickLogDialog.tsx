import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { StepperInput } from './StepperInput';
import { QuickLogStepper } from './QuickLogStepper';
import { QuickLogSummary } from './QuickLogSummary';
import { 
  calculateGPP, 
  formatHumidityRatio, 
  getHumidityRatioStatus,
  getHumidityRatioUnit,
  celsiusToFahrenheit,
  type UnitSystem 
} from '@/lib/psychrometrics';
import { cn } from '@/lib/utils';
import { Zap, SkipForward, ArrowRight, RotateCcw } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type DryingChamber = Tables<'drying_chambers'>;
type MoistureReading = Tables<'moisture_readings'>;

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

interface QuickLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chambers: DryingChamber[];
  latestReadings: Map<string, MoistureReading>;
  units: UnitSystem;
  temperatureUnit: 'F' | 'C';
  onSubmitReading: (chamberId: string, data: {
    readingType: 'ambient' | 'material';
    temperature: number;
    relativeHumidity: number;
    gpp: number;
    materialType?: string;
    moistureContent?: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

type Step = 'select' | 'logging' | 'summary';

export function QuickLogDialog({
  open,
  onOpenChange,
  chambers,
  latestReadings,
  units,
  temperatureUnit,
  onSubmitReading,
  isLoading,
}: QuickLogDialogProps) {
  // State
  const [step, setStep] = useState<Step>('select');
  const [selectedChamberIds, setSelectedChamberIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedReadings, setCompletedReadings] = useState<CompletedReading[]>([]);
  const [skippedChamberIds, setSkippedChamberIds] = useState<string[]>([]);
  const [useLastValues, setUseLastValues] = useState(true);

  // Form state
  const defaultTemp = temperatureUnit === 'C' ? 22 : 72;
  const tempMin = temperatureUnit === 'C' ? 0 : 32;
  const tempMax = temperatureUnit === 'C' ? 50 : 120;
  
  const [readingType, setReadingType] = useState<'ambient' | 'material'>('ambient');
  const [temperature, setTemperature] = useState(defaultTemp);
  const [relativeHumidity, setRelativeHumidity] = useState(50);
  const [materialType, setMaterialType] = useState('');
  const [moistureContent, setMoistureContent] = useState('');

  // Selected chambers in order
  const selectedChambers = useMemo(() => 
    chambers.filter(c => selectedChamberIds.includes(c.id)),
    [chambers, selectedChamberIds]
  );

  // Current chamber
  const currentChamber = selectedChambers[currentIndex];

  // GPP calculation
  const tempForCalc = temperatureUnit === 'C' ? celsiusToFahrenheit(temperature) : temperature;
  const gpp = calculateGPP(tempForCalc, relativeHumidity);
  const status = currentChamber?.target_gpp ? getHumidityRatioStatus(gpp, currentChamber.target_gpp) : null;

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setStep('select');
      setSelectedChamberIds(chambers.map(c => c.id)); // Select all by default
      setCurrentIndex(0);
      setCompletedReadings([]);
      setSkippedChamberIds([]);
      setTemperature(defaultTemp);
      setRelativeHumidity(50);
      setMaterialType('');
      setMoistureContent('');
    }
  }, [open, chambers, defaultTemp]);

  // Toggle chamber selection
  const toggleChamber = (chamberId: string) => {
    setSelectedChamberIds(prev => 
      prev.includes(chamberId)
        ? prev.filter(id => id !== chamberId)
        : [...prev, chamberId]
    );
  };

  // Start logging
  const handleStartLogging = () => {
    if (selectedChamberIds.length === 0) return;
    setStep('logging');
    setCurrentIndex(0);
    
    // Initialize with first chamber's last reading if available and useLastValues is true
    const firstChamber = selectedChambers[0];
    if (firstChamber && useLastValues) {
      const lastReading = latestReadings.get(firstChamber.id);
      if (lastReading) {
        setTemperature(temperatureUnit === 'C' 
          ? Math.round((lastReading.temperature - 32) * 5/9) 
          : lastReading.temperature
        );
        setRelativeHumidity(lastReading.relative_humidity);
      }
    }
  };

  // Save current reading and advance
  const handleSaveAndNext = async () => {
    if (!currentChamber) return;

    const tempToStore = temperatureUnit === 'C' ? celsiusToFahrenheit(temperature) : temperature;
    
    try {
      await onSubmitReading(currentChamber.id, {
        readingType,
        temperature: tempToStore,
        relativeHumidity,
        gpp,
        materialType: readingType === 'material' ? materialType : undefined,
        moistureContent: readingType === 'material' && moistureContent 
          ? parseFloat(moistureContent) 
          : undefined,
      });

      // Add to completed readings
      setCompletedReadings(prev => [...prev, {
        chamberId: currentChamber.id,
        chamberName: currentChamber.name,
        temperature,
        relativeHumidity,
        gpp,
        readingType,
        materialType: readingType === 'material' ? materialType : undefined,
        moistureContent: readingType === 'material' && moistureContent 
          ? parseFloat(moistureContent) 
          : undefined,
      }]);

      // Advance to next or finish
      advanceToNext();
    } catch (error) {
      console.error('Failed to save reading:', error);
    }
  };

  // Skip current chamber
  const handleSkip = () => {
    if (!currentChamber) return;
    setSkippedChamberIds(prev => [...prev, currentChamber.id]);
    advanceToNext();
  };

  // Advance to next chamber or summary
  const advanceToNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= selectedChambers.length) {
      setStep('summary');
    } else {
      setCurrentIndex(nextIndex);
      
      // Optionally carry over values
      if (!useLastValues) {
        setTemperature(defaultTemp);
        setRelativeHumidity(50);
      }
      // Reset material fields
      setMaterialType('');
      setMoistureContent('');
    }
  };

  // Reset and log more
  const handleLogMore = () => {
    setStep('select');
    setSelectedChamberIds(chambers.map(c => c.id));
    setCurrentIndex(0);
    setCompletedReadings([]);
    setSkippedChamberIds([]);
  };

  const statusColors = {
    success: 'text-success bg-success/10 border-success',
    warning: 'text-warning bg-warning/10 border-warning',
    emergency: 'text-emergency bg-emergency/10 border-emergency',
  };

  const skippedChamberNames = useMemo(() => 
    chambers.filter(c => skippedChamberIds.includes(c.id)).map(c => c.name),
    [chambers, skippedChamberIds]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {step === 'select' && 'Quick Log Readings'}
            {step === 'logging' && `Chamber ${currentIndex + 1} of ${selectedChambers.length}`}
            {step === 'summary' && 'Quick Log Complete!'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Chamber Selection */}
        {step === 'select' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select chambers to log readings for:
            </p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {chambers.map((chamber) => {
                const lastReading = latestReadings.get(chamber.id);
                return (
                  <label
                    key={chamber.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedChamberIds.includes(chamber.id)}
                      onCheckedChange={() => toggleChamber(chamber.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{chamber.name}</p>
                      {lastReading && (
                        <p className="text-xs text-muted-foreground">
                          {formatHumidityRatio(lastReading.gpp ?? 0, units)} • {new Date(lastReading.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {!lastReading && (
                        <p className="text-xs text-muted-foreground">No readings yet</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  id="use-last-values"
                  checked={useLastValues}
                  onCheckedChange={setUseLastValues}
                />
                <Label htmlFor="use-last-values" className="text-sm">
                  Carry over values
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedChamberIds.length} selected
              </span>
            </div>
          </div>
        )}

        {/* Step 2: Logging */}
        {step === 'logging' && currentChamber && (
          <div className="space-y-4">
            {/* Progress Stepper */}
            <QuickLogStepper
              chambers={selectedChambers}
              currentIndex={currentIndex}
              completedIds={completedReadings.map(r => r.chamberId)}
              skippedIds={skippedChamberIds}
            />

            {/* Current Chamber Name */}
            <div className="text-center py-2">
              <p className="text-lg font-semibold">{currentChamber.name}</p>
            </div>

            {/* Reading Type Tabs */}
            <Tabs value={readingType} onValueChange={(v) => setReadingType(v as 'ambient' | 'material')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ambient">Ambient</TabsTrigger>
                <TabsTrigger value="material">Material</TabsTrigger>
              </TabsList>

              <div className="mt-4 space-y-4">
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
                    'p-3 rounded-lg border-2 text-center',
                    status ? statusColors[status] : 'bg-muted/50 border-border'
                  )}
                >
                  <p className="text-xs font-medium uppercase tracking-wide mb-1">
                    {getHumidityRatioUnit(units)}
                  </p>
                  <p className="text-3xl font-bold tabular-nums">
                    {formatHumidityRatio(gpp, units)}
                  </p>
                  {currentChamber.target_gpp && (
                    <p className="text-xs mt-1 opacity-80">
                      Target: {formatHumidityRatio(currentChamber.target_gpp, units)}
                    </p>
                  )}
                </div>

                {/* Material-specific fields */}
                <TabsContent value="material" className="mt-0 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Material Type</Label>
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
                    <Label htmlFor="quick-moisture-content" className="text-sm">
                      Moisture Content %
                    </Label>
                    <Input
                      id="quick-moisture-content"
                      type="number"
                      step="0.1"
                      value={moistureContent}
                      onChange={(e) => setMoistureContent(e.target.value)}
                      placeholder="e.g., 18.5"
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 'summary' && (
          <QuickLogSummary
            completedReadings={completedReadings}
            skippedChamberNames={skippedChamberNames}
            units={units}
            temperatureUnit={temperatureUnit}
          />
        )}

        <DialogFooter className="mt-4">
          {step === 'select' && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleStartLogging}
                disabled={selectedChamberIds.length === 0}
                className="gap-2"
              >
                Start Logging
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {step === 'logging' && (
            <>
              <Button variant="outline" onClick={handleSkip} className="gap-2">
                <SkipForward className="w-4 h-4" />
                Skip
              </Button>
              <Button 
                onClick={handleSaveAndNext}
                disabled={isLoading || (readingType === 'material' && !materialType)}
                className="gap-2"
              >
                {isLoading ? 'Saving...' : currentIndex === selectedChambers.length - 1 ? 'Save & Finish' : 'Save & Next'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </>
          )}

          {step === 'summary' && (
            <>
              <Button variant="outline" onClick={handleLogMore} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Log More
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
