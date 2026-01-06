import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTenant } from '@/hooks/useTenant';
import { JobEstimate } from '@/hooks/useJobEstimates';
import { COST_CATEGORIES, UNIT_TYPES } from '@/hooks/useCostTemplates';

interface EstimatePreviewDialogProps {
  estimate: JobEstimate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EstimatePreviewDialog({
  estimate,
  open,
  onOpenChange,
}: EstimatePreviewDialogProps) {
  const { data: tenant } = useTenant();

  if (!estimate) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getCategoryLabel = (value: string) =>
    COST_CATEGORIES.find((c) => c.value === value)?.label || value;

  const getUnitLabel = (value: string) =>
    UNIT_TYPES.find((u) => u.value === value)?.label || value;

  // Group line items by category
  const groupedItems = estimate.line_items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof estimate.line_items>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Estimate Preview
            <Badge
              variant={
                estimate.status === 'accepted'
                  ? 'default'
                  : estimate.status === 'declined'
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                {tenant?.logo_url && (
                  <img
                    src={tenant.logo_url}
                    alt={tenant.name}
                    className="h-12 mb-2 object-contain"
                  />
                )}
                <h2 className="text-xl font-bold">{tenant?.name || 'Company Name'}</h2>
                {tenant?.address && (
                  <p className="text-sm text-muted-foreground">{tenant.address}</p>
                )}
                {tenant?.contact_phone && (
                  <p className="text-sm text-muted-foreground">{tenant.contact_phone}</p>
                )}
                {tenant?.contact_email && (
                  <p className="text-sm text-muted-foreground">{tenant.contact_email}</p>
                )}
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-bold text-primary">ESTIMATE</h3>
                <p className="font-mono text-lg">{estimate.estimate_number}</p>
                <p className="text-sm text-muted-foreground">
                  Date: {format(new Date(estimate.created_at), 'MMMM d, yyyy')}
                </p>
                {estimate.valid_until && (
                  <p className="text-sm text-muted-foreground">
                    Valid Until: {format(new Date(estimate.valid_until), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Customer Info */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">BILL TO</h4>
              <p className="font-medium">{estimate.customer_name}</p>
              {estimate.customer_address && (
                <p className="text-sm">{estimate.customer_address}</p>
              )}
              {estimate.customer_email && (
                <p className="text-sm">{estimate.customer_email}</p>
              )}
              {estimate.customer_phone && (
                <p className="text-sm">{estimate.customer_phone}</p>
              )}
            </div>

            {/* Scope of Work */}
            {estimate.scope_of_work && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  SCOPE OF WORK
                </h4>
                <p className="text-sm whitespace-pre-wrap">{estimate.scope_of_work}</p>
              </div>
            )}

            <Separator />

            {/* Line Items */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                LINE ITEMS
              </h4>
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category}>
                    <h5 className="font-medium text-sm mb-2">{getCategoryLabel(category)}</h5>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Description</th>
                          <th className="text-right py-2 w-20">Qty</th>
                          <th className="text-right py-2 w-24">Rate</th>
                          <th className="text-right py-2 w-28">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-dashed">
                            <td className="py-2">
                              <span>{item.name}</span>
                              {item.description && (
                                <p className="text-xs text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </td>
                            <td className="text-right py-2 font-mono">
                              {item.quantity} {getUnitLabel(item.unit_type).toLowerCase()}
                            </td>
                            <td className="text-right py-2 font-mono">
                              {formatCurrency(item.unit_rate)}
                            </td>
                            <td className="text-right py-2 font-mono font-medium">
                              {formatCurrency(item.total_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(Number(estimate.subtotal))}</span>
                </div>
                {Number(estimate.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>
                      Discount
                      {estimate.discount_description && ` (${estimate.discount_description})`}
                    </span>
                    <span className="font-mono">
                      -{formatCurrency(Number(estimate.discount_amount))}
                    </span>
                  </div>
                )}
                {Number(estimate.tax_amount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax ({Number(estimate.tax_rate)}%)</span>
                    <span className="font-mono">
                      {formatCurrency(Number(estimate.tax_amount))}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="font-mono">
                    {formatCurrency(Number(estimate.total_amount))}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            {estimate.customer_notes && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">NOTES</h4>
                <p className="text-sm whitespace-pre-wrap">{estimate.customer_notes}</p>
              </div>
            )}

            {/* Terms and Conditions */}
            {estimate.terms_and_conditions && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  TERMS & CONDITIONS
                </h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {estimate.terms_and_conditions}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
