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
import { Droplets, AlertTriangle, Skull } from 'lucide-react';

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

export function LossTypeStep({ form }: LossTypeStepProps) {
  const selectedType = form.watch('lossType');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">Loss Classification</h2>
        <p className="text-muted-foreground mt-1">Select the water damage category</p>
      </div>

      <FormField
        control={form.control}
        name="lossType"
        render={({ field }) => (
          <FormItem>
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
