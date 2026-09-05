import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUpdateJob } from '@/hooks/useUpdateJob';
import { isJobIdentityLocked } from '@/lib/jobReportUnlock';
import type { Tables } from '@/integrations/supabase/types';

const schema = z.object({
  customer_name: z.string().min(1, 'Customer name is required').max(100),
  address: z.string().min(1, 'Address is required').max(255),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(50).optional().or(z.literal('')),
  zip_code: z.string().max(10).optional().or(z.literal('')),
  claim_id: z.string().max(100).optional().or(z.literal('')),
  start_date: z.string().min(1, 'Start date is required'),
  customer_phone: z.string().optional().or(z.literal('')),
  customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface JobEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Tables<'jobs'>;
}

export function JobEditDialog({ open, onOpenChange, job }: JobEditDialogProps) {
  const updateJob = useUpdateJob();
  const identityLocked = isJobIdentityLocked(job);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: valuesFromJob(job),
  });

  useEffect(() => {
    if (open) form.reset(valuesFromJob(job));
  }, [open, job, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: Parameters<typeof updateJob.mutateAsync>[0] = {
        id: job.id,
        customer_phone: values.customer_phone || null,
        customer_email: values.customer_email || null,
        notes: values.notes || null,
      };
      if (!identityLocked) {
        payload.customer_name = values.customer_name;
        payload.address = values.address;
        payload.city = values.city || null;
        payload.state = values.state || null;
        payload.zip_code = values.zip_code || null;
        payload.claim_id = values.claim_id || null;
        payload.start_date = values.start_date;
      }
      await updateJob.mutateAsync(payload);
      toast.success('Job updated');
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update job';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit job</DialogTitle>
          <DialogDescription>
            {identityLocked
              ? 'This report is unlocked. Identity fields are locked so this job cannot be reused for a different loss.'
              : 'Update job details. After a report is unlocked, identity fields are locked.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={identityLocked} />
                  </FormControl>
                  {identityLocked && (
                    <FormDescription>
                      Locked after report unlock so this job cannot be reused for another customer.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={identityLocked} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={identityLocked} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={identityLocked} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={identityLocked} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="claim_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claim ID</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={identityLocked} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={identityLocked} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {identityLocked && (
              <p className="text-xs text-muted-foreground rounded-md bg-muted px-3 py-2">
                Customer name, address, city, state, postcode, claim ID, and start date stay locked after unlock.
                Readings, photos, equipment, and notes can still be edited.
              </p>
            )}

            <FormField
              control={form.control}
              name="customer_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[80px] resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateJob.isPending}>
                {updateJob.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function valuesFromJob(job: Tables<'jobs'>): FormValues {
  return {
    customer_name: job.customer_name,
    address: job.address,
    city: job.city ?? '',
    state: job.state ?? '',
    zip_code: job.zip_code ?? '',
    claim_id: job.claim_id ?? '',
    start_date: job.start_date?.slice(0, 10) ?? '',
    customer_phone: job.customer_phone ?? '',
    customer_email: job.customer_email ?? '',
    notes: job.notes ?? '',
  };
}
