import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClaimInfoStepProps {
  form: UseFormReturn<any>;
}

export function ClaimInfoStep({ form }: ClaimInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">Claim Information</h2>
        <p className="text-muted-foreground mt-1">Insurance and loss details (optional)</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="claimId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Claim ID</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., CLM-12345"
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfLoss"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Loss</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full h-12 justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="sourceOfLoss"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Source of Loss</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g., Burst pipe in laundry room"
                className="h-12"
              />
            </FormControl>
            <FormDescription>
              Describe what caused the water damage
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="affectedAreas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Affected Areas</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g., Kitchen, Living Room, Hallway"
                className="h-12"
              />
            </FormControl>
            <FormDescription>
              List the rooms or areas affected
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="affectedMaterials"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Affected Materials</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g., Carpet, Drywall, Hardwood Flooring"
                className="h-12"
              />
            </FormControl>
            <FormDescription>
              List the types of materials affected
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="claimSummary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Claim Summary</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Brief summary of the loss event for the claim..."
                className="min-h-[100px] text-base resize-none"
              />
            </FormControl>
            <FormDescription>
              Narrative summary for insurance documentation
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
