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

const tierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  monthly_price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  jobs_included: z.coerce.number().int().min(0, 'Must be 0 or greater'),
  readings_included: z.coerce.number().int().min(0, 'Must be 0 or greater'),
  overage_price_per_job: z.coerce.number().min(0, 'Must be 0 or greater'),
  overage_price_per_reading: z.coerce.number().min(0, 'Must be 0 or greater'),
  is_free_tier: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0, 'Must be 0 or greater'),
});

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

  const form = useForm<TierFormData>({
    resolver: zodResolver(tierSchema),
    defaultValues: {
      name: '',
      monthly_price: 0,
      jobs_included: 0,
      readings_included: 0,
      overage_price_per_job: 0,
      overage_price_per_reading: 0,
      is_free_tier: false,
      is_active: true,
      sort_order: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (tier) {
        form.reset({
          name: tier.name,
          monthly_price: Number(tier.monthly_price),
          jobs_included: tier.jobs_included,
          readings_included: tier.readings_included,
          overage_price_per_job: Number(tier.overage_price_per_job),
          overage_price_per_reading: Number(tier.overage_price_per_reading),
          is_free_tier: tier.is_free_tier,
          is_active: tier.is_active,
          sort_order: tier.sort_order,
        });
      } else {
        form.reset({
          name: '',
          monthly_price: 0,
          jobs_included: 0,
          readings_included: 0,
          overage_price_per_job: 0,
          overage_price_per_reading: 0,
          is_free_tier: false,
          is_active: true,
          sort_order: 0,
        });
      }
    }
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
