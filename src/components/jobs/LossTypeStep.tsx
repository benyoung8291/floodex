import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Droplets, AlertTriangle, Skull, Layers } from 'lucide-react';

interface LossTypeStepProps {
  form: UseFormReturn<any>;
}

const lossTypes = [
  {
    value: 'cat1',
    label: 'Category 1',
    subtitle: 'Clean Water',
    description: 'Broken pipes, rainwater, clean source',
    icon: Droplets,
    colorClass: 'border-blue-500 bg-blue-500/10 text-blue-400',
    selectedClass: 'ring-2 ring-blue-500 bg-blue-500/20',
  },
  {
    value: 'cat2',
    label: 'Category 2',
    subtitle: 'Gray Water',
    description: 'Washing machine, dishwasher overflow',
    icon: AlertTriangle,
    colorClass: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
    selectedClass: 'ring-2 ring-yellow-500 bg-yellow-500/20',
  },
  {
    value: 'cat3',
    label: 'Category 3',
    subtitle: 'Black Water',
    description: 'Sewage, flooding, highly contaminated',
    icon: Skull,
    colorClass: 'border-destructive bg-destructive/10 text-destructive',
    selectedClass: 'ring-2 ring-destructive bg-destructive/20',
  },
];

const lossClasses = [
  {
    value: 'class1',
    label: 'Class 1',
    description: 'Minimal water absorption, small affected area',
  },
  {
    value: 'class2',
    label: 'Class 2',
    description: 'Significant water, entire room, walls <24"',
  },
  {
    value: 'class3',
    label: 'Class 3',
    description: 'Greatest amount, saturated walls/ceilings',
  },
  {
    value: 'class4',
    label: 'Class 4',
    description: 'Specialty drying (hardwood, stone, concrete)',
  },
];

export function LossTypeStep({ form }: LossTypeStepProps) {
  const selectedType = form.watch('lossType');
  const selectedClass = form.watch('lossClass');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">Loss Classification</h2>
        <p className="text-muted-foreground mt-1">Select the water damage category and class</p>
      </div>

      {/* Water Category */}
      <FormField
        control={form.control}
        name="lossType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Water Category (IICRC S500)</FormLabel>
            <FormControl>
              <div className="space-y-3">
                {lossTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = field.value === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => field.onChange(type.value)}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 text-left transition-all',
                        type.colorClass,
                        isSelected && type.selectedClass
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-background/50">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{type.label}</span>
                            <span className="text-sm opacity-80">— {type.subtitle}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Loss Class */}
      <FormField
        control={form.control}
        name="lossClass"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Loss Class (Drying Difficulty)
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-2">
                {lossClasses.map((lossClass) => {
                  const isSelected = field.value === lossClass.value;

                  return (
                    <button
                      key={lossClass.value}
                      type="button"
                      onClick={() => field.onChange(lossClass.value)}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-all',
                        'border-border bg-card hover:bg-accent',
                        isSelected && 'ring-2 ring-primary border-primary bg-primary/10'
                      )}
                    >
                      <span className="font-semibold text-foreground block">{lossClass.label}</span>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {lossClass.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Additional Notes</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe the source of water damage, affected areas, etc."
                className="min-h-[100px] text-base resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
