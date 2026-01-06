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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COST_CATEGORIES, UNIT_TYPES } from '@/hooks/useCostTemplates';
import { JobCostItem } from '@/hooks/useJobCostItems';

const costItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  unit_type: z.string().min(1, 'Unit type is required'),
  quantity: z.coerce.number().min(0, 'Quantity must be positive'),
  unit_rate: z.coerce.number().min(0, 'Rate must be positive'),
  is_billable: z.boolean(),
});

type CostItemFormData = z.infer<typeof costItemSchema>;

interface JobCostItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: JobCostItem | null;
  onSubmit: (data: CostItemFormData) => void;
  isLoading?: boolean;
}

export function JobCostItemDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isLoading,
}: JobCostItemDialogProps) {
  const isEditing = !!item;

  const form = useForm<CostItemFormData>({
    resolver: zodResolver(costItemSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'misc',
      unit_type: 'flat_rate',
      quantity: 1,
      unit_rate: 0,
      is_billable: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          name: item.name,
          description: item.description || '',
          category: item.category,
          unit_type: item.unit_type,
          quantity: Number(item.quantity),
          unit_rate: Number(item.unit_rate),
          is_billable: item.is_billable,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          category: 'misc',
          unit_type: 'flat_rate',
          quantity: 1,
          unit_rate: 0,
          is_billable: true,
        });
      }
    }
  }, [open, item, form]);

  const quantity = form.watch('quantity');
  const unitRate = form.watch('unit_rate');
  const total = (quantity || 0) * (unitRate || 0);

  const handleSubmit = (data: CostItemFormData) => {
    onSubmit(data);
  };

  const getUnitLabel = (unitType: string) => {
    return UNIT_TYPES.find((u) => u.value === unitType)?.label || unitType;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Cost Item' : 'Add Cost Item'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the cost item details.'
              : 'Add a custom cost item to this job.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Extra Dehumidifier" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COST_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIT_TYPES.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate ($/{getUnitLabel(form.watch('unit_type'))})</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Line Total</span>
                <span className="text-lg font-semibold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(total)}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="is_billable"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Billable</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Include in customer invoice total
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
