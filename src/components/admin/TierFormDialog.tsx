import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TierFormData, TierWithStats } from '@/hooks/useAdminTiers';
import { Loader2 } from 'lucide-react';

const lookupKeySchema = z
  .string()
  .trim()
  .max(100, 'Lookup key must be 100 characters or less')
  .regex(/^[a-z0-9_-]*$/, 'Use lowercase letters, numbers, underscores or dashes only');

const tierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  monthly_price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  yearly_price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  jobs_included: z.coerce.number().int().min(0, 'Must be 0 or greater'),
  readings_included: z.coerce.number().int().min(0, 'Must be 0 or greater'),
  overage_price_per_job: z.coerce.number().min(0, 'Must be 0 or greater'),
  overage_price_per_reading: z.coerce.number().min(0, 'Must be 0 or greater'),
  monthly_lookup_key: lookupKeySchema,
  yearly_lookup_key: lookupKeySchema,
  is_free_tier: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0, 'Must be 0 or greater'),
}).refine(
  (d) => d.is_free_tier || (!!d.monthly_lookup_key && !!d.yearly_lookup_key),
  {
    message: 'Paid tiers need both price lookup keys, or customers cannot check out',
    path: ['monthly_lookup_key'],
  },
);


interface TierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier?: TierWithStats | null;
  onSubmit: (data: TierFormData) => void;
  isLoading?: boolean;
}

export function TierFormDialog({
  open,
  onOpenChange,
  tier,
  onSubmit,
  isLoading,
}: TierFormDialogProps) {
  const isEditing = !!tier;

  const emptyValues: TierFormData = {
    name: '',
    monthly_price: 0,
    yearly_price: 0,
    jobs_included: 0,
    readings_included: 0,
    overage_price_per_job: 0,
    overage_price_per_reading: 0,
    monthly_lookup_key: '',
    yearly_lookup_key: '',
    is_free_tier: false,
    is_active: true,
    sort_order: 0,
  };

  const form = useForm<TierFormData>({
    resolver: zodResolver(tierSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    if (tier) {
      form.reset({
        name: tier.name,
        monthly_price: Number(tier.monthly_price),
        yearly_price: Number(tier.yearly_price ?? 0),
        jobs_included: tier.jobs_included,
        readings_included: tier.readings_included,
        overage_price_per_job: Number(tier.overage_price_per_job),
        overage_price_per_reading: Number(tier.overage_price_per_reading),
        monthly_lookup_key: tier.monthly_lookup_key ?? '',
        yearly_lookup_key: tier.yearly_lookup_key ?? '',
        is_free_tier: tier.is_free_tier,
        is_active: tier.is_active,
        sort_order: tier.sort_order,
      });
    } else {
      form.reset(emptyValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tier, form]);


  const handleSubmit = (data: TierFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Tier' : 'Create New Tier'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the pricing tier details below.'
              : 'Configure the new pricing tier details below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Professional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthly_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="yearly_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yearly Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>Total billed once per year.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthly_lookup_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly price lookup key</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., pro_monthly" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearly_lookup_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yearly price lookup key</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., pro_yearly" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Lookup keys must match the payment product prices exactly — they are how checkout finds the right price.
            </p>



            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jobs_included"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jobs Included</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="readings_included"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Readings Included</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="overage_price_per_job"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overage per Job ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overage_price_per_reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overage per Reading ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="is_free_tier"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Free Tier</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Create Tier'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
