import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { useTenant } from '@/hooks/useTenant';
import {
  getHumidityRatioUnit,
  humidityRatioToGpp,
  type UnitSystem,
} from '@/lib/psychrometrics';

const PRESET_NAMES = [
  'Living Room',
  'Bedroom',
  'Basement',
  'Kitchen',
  'Bathroom',
  'Garage',
  'Hallway',
  'Office',
];

interface ChamberCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; targetGpp?: number; dryStandardPercent?: number }) => void;
  isLoading?: boolean;
}

export function ChamberCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: ChamberCreateDialogProps) {
  const { data: tenant } = useTenant();
  const units: UnitSystem = tenant?.humidity_ratio_unit === 'g/kg' ? 'metric' : 'imperial';
  const humidityUnit = getHumidityRatioUnit(units);
  const [name, setName] = useState('');
  const [targetHumidity, setTargetHumidity] = useState<string>('');
  const [dryStandard, setDryStandard] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const enteredTarget = targetHumidity ? parseFloat(targetHumidity) : undefined;
    onSubmit({
      name: name.trim(),
      targetGpp: enteredTarget != null && !Number.isNaN(enteredTarget)
        ? humidityRatioToGpp(enteredTarget, units)
        : undefined,
      dryStandardPercent: dryStandard ? parseFloat(dryStandard) : undefined,
    });

    // Reset form
    setName('');
    setTargetHumidity('');
    setDryStandard('');
  };

  const handlePresetClick = (preset: string) => {
    setName(preset);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Drying Chamber</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chamber-name">Chamber Name</Label>
            <Input
              id="chamber-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Living Room"
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              {PRESET_NAMES.map((preset) => (
                <Badge
                  key={preset}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-humidity">Target {humidityUnit}</Label>
              <Input
                id="target-humidity"
                type="number"
                step="0.1"
                value={targetHumidity}
                onChange={(e) => setTargetHumidity(e.target.value)}
                placeholder={units === 'metric' ? 'e.g., 6.4' : 'e.g., 45'}
              />
              <p className="text-xs text-muted-foreground">Optional drying goal</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dry-standard">Dry Standard %</Label>
              <Input
                id="dry-standard"
                type="number"
                step="0.1"
                value={dryStandard}
                onChange={(e) => setDryStandard(e.target.value)}
                placeholder="e.g., 15"
              />
              <p className="text-xs text-muted-foreground">Material moisture target</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? 'Creating...' : 'Create Chamber'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
