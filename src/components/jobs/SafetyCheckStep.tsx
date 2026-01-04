import { UseFormReturn } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Zap, Skull, Bug, Building2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafetyCheckStepProps {
  form: UseFormReturn<any>;
}

const hazards = [
  {
    key: 'electrical',
    label: 'Electrical Hazards',
    description: 'Exposed wiring, standing water near outlets',
    icon: Zap,
    critical: true,
  },
  {
    key: 'structural',
    label: 'Structural Damage',
    description: 'Ceiling sag, wall buckling, floor weakness',
    icon: Building2,
    critical: true,
  },
  {
    key: 'asbestos',
    label: 'Potential Asbestos',
    description: 'Building materials pre-1980, popcorn ceilings',
    icon: Skull,
    critical: true,
  },
  {
    key: 'mold',
    label: 'Visible Mold Growth',
    description: 'Discoloration, musty odors',
    icon: Bug,
    critical: false,
  },
  {
    key: 'slipTrip',
    label: 'Slip/Trip Hazards',
    description: 'Wet floors, debris, uneven surfaces',
    icon: AlertCircle,
    critical: false,
  },
];

export function SafetyCheckStep({ form }: SafetyCheckStepProps) {
  const safetyChecks = form.watch('safetyChecks') || [];

  const updateHazard = (hazardType: string, field: 'isPresent' | 'notes', value: any) => {
    const currentChecks = [...safetyChecks];
    const index = currentChecks.findIndex((c) => c.hazardType === hazardType);

    if (index >= 0) {
      currentChecks[index] = { ...currentChecks[index], [field]: value };
    } else {
      const hazard = hazards.find((h) => h.key === hazardType);
      currentChecks.push({
        hazardType,
        isPresent: field === 'isPresent' ? value : false,
        requiresStopWork: hazard?.critical || false,
        notes: field === 'notes' ? value : '',
      });
    }

    form.setValue('safetyChecks', currentChecks);
  };

  const getHazardValue = (hazardType: string, field: 'isPresent' | 'notes') => {
    const check = safetyChecks.find((c: any) => c.hazardType === hazardType);
    return check ? check[field] : field === 'isPresent' ? false : '';
  };

  const hasStopWorkHazards = safetyChecks.some(
    (c: any) => c.isPresent && hazards.find((h) => h.key === c.hazardType)?.critical
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">Safety Assessment</h2>
        <p className="text-muted-foreground mt-1">Identify any on-site hazards</p>
      </div>

      {hasStopWorkHazards && (
        <div className="p-4 rounded-lg bg-destructive/20 border border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Stop Work Required</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Critical hazards detected. Supervisor override will be required before field work can begin.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {hazards.map((hazard) => {
          const Icon = hazard.icon;
          const isPresent = getHazardValue(hazard.key, 'isPresent');
          const notes = getHazardValue(hazard.key, 'notes');

          return (
            <div
              key={hazard.key}
              className={cn(
                'p-4 rounded-lg border transition-colors',
                isPresent
                  ? hazard.critical
                    ? 'border-destructive bg-destructive/10'
                    : 'border-warning bg-warning/10'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      isPresent
                        ? hazard.critical
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-warning/20 text-warning'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="font-medium text-foreground">{hazard.label}</Label>
                      {hazard.critical && (
                        <span className="text-xs px-2 py-0.5 rounded bg-destructive/20 text-destructive">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{hazard.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isPresent as boolean}
                  onCheckedChange={(checked) => updateHazard(hazard.key, 'isPresent', checked)}
                />
              </div>

              {isPresent && (
                <div className="mt-4 pl-12">
                  <Textarea
                    placeholder="Add notes about this hazard..."
                    value={notes as string}
                    onChange={(e) => updateHazard(hazard.key, 'notes', e.target.value)}
                    className="min-h-[60px] text-sm resize-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
