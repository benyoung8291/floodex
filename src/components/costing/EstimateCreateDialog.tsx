import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { COST_CATEGORIES, UNIT_TYPES } from '@/hooks/useCostTemplates';
import { JobCostItem } from '@/hooks/useJobCostItems';
import {
  EstimateLineItem,
  useCreateEstimate,
  useGenerateEstimateNumber,
} from '@/hooks/useJobEstimates';

interface EstimateCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  costItems: JobCostItem[];
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
}

export function EstimateCreateDialog({
  open,
  onOpenChange,
  jobId,
  costItems,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
}: EstimateCreateDialogProps) {
  const { data: nextNumber } = useGenerateEstimateNumber();
  const createEstimate = useCreateEstimate();

  // Form state
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([]);
  const [validUntil, setValidUntil] = useState<Date | undefined>(addDays(new Date(), 30));
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountDescription, setDiscountDescription] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(
    'This estimate is valid for 30 days from the date of issue. Prices are subject to change based on actual conditions discovered during work.'
  );
  const [customerNotes, setCustomerNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [showBillableOnly, setShowBillableOnly] = useState(true);

  // Initialize line items from cost items
  useEffect(() => {
    if (open && costItems.length > 0) {
      const items = costItems
        .filter((item) => (showBillableOnly ? item.is_billable : true))
        .map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || undefined,
          category: item.category,
          quantity: Number(item.quantity),
          unit_type: item.unit_type,
          unit_rate: Number(item.unit_rate),
          total_amount: Number(item.total_amount),
          is_billable: item.is_billable,
        }));
      setLineItems(items);
    }
  }, [open, costItems, showBillableOnly]);

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total_amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal - discountAmount + taxAmount;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const handleLineItemChange = (
    index: number,
    field: keyof EstimateLineItem,
    value: string | number
  ) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'quantity' || field === 'unit_rate') {
        item[field] = Number(value);
        item.total_amount = item.quantity * item.unit_rate;
      } else {
        (item as any)[field] = value;
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: '',
        category: 'misc',
        quantity: 1,
        unit_type: 'flat_rate',
        unit_rate: 0,
        total_amount: 0,
        is_billable: true,
      },
    ]);
  };

  const handleSubmit = () => {
    if (!nextNumber || lineItems.length === 0) return;

    createEstimate.mutate(
      {
        estimate_number: nextNumber,
        job_id: jobId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        line_items: lineItems,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        discount_description: discountDescription || undefined,
        total_amount: total,
        scope_of_work: scopeOfWork || undefined,
        terms_and_conditions: termsAndConditions || undefined,
        customer_notes: customerNotes || undefined,
        notes: notes || undefined,
        valid_until: validUntil ? format(validUntil, 'yyyy-MM-dd') : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          // Reset form
          setTaxRate(0);
          setDiscountAmount(0);
          setDiscountDescription('');
          setScopeOfWork('');
          setCustomerNotes('');
          setNotes('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create Estimate</DialogTitle>
          <DialogDescription>
            Generate a customer-facing estimate from the current cost items.
            Estimate #{nextNumber}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Customer Info (Read-only summary) */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Customer</h4>
              <p className="text-sm">{customerName}</p>
              {customerAddress && <p className="text-sm text-muted-foreground">{customerAddress}</p>}
              {customerEmail && <p className="text-sm text-muted-foreground">{customerEmail}</p>}
            </div>

            {/* Validity Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !validUntil && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {validUntil ? format(validUntil, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={validUntil}
                      onSelect={setValidUntil}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2 pt-8">
                <Switch
                  id="billable-only"
                  checked={showBillableOnly}
                  onCheckedChange={setShowBillableOnly}
                />
                <Label htmlFor="billable-only">Show billable items only</Label>
              </div>
            </div>

            {/* Scope of Work */}
            <div className="space-y-2">
              <Label htmlFor="scope">Scope of Work</Label>
              <Textarea
                id="scope"
                placeholder="Describe the work to be performed..."
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                rows={3}
              />
            </div>

            <Separator />

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid gap-2 p-3 border rounded-lg bg-card"
                    style={{ gridTemplateColumns: '1fr 100px 100px 100px 40px' }}
                  >
                    <div className="space-y-1">
                      <Input
                        value={item.name}
                        onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                        placeholder="Item name"
                        className="font-medium"
                      />
                      <div className="flex gap-2">
                        <Select
                          value={item.category}
                          onValueChange={(v) => handleLineItemChange(index, 'category', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COST_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={item.unit_type}
                          onValueChange={(v) => handleLineItemChange(index, 'unit_type', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIT_TYPES.map((ut) => (
                              <SelectItem key={ut.value} value={ut.value}>
                                {ut.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Rate</Label>
                      <Input
                        type="number"
                        value={item.unit_rate}
                        onChange={(e) => handleLineItemChange(index, 'unit_rate', e.target.value)}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total</Label>
                      <div className="h-10 flex items-center font-mono text-sm">
                        {formatCurrency(item.total_amount)}
                      </div>
                    </div>
                    <div className="flex items-end pb-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground shrink-0 w-20">Discount</Label>
                  <Input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    min={0}
                    step={0.01}
                    className="w-24"
                  />
                  <Input
                    placeholder="Description"
                    value={discountDescription}
                    onChange={(e) => setDiscountDescription(e.target.value)}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground shrink-0 w-20">Tax Rate %</Label>
                  <Input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    min={0}
                    max={100}
                    step={0.1}
                    className="w-24"
                  />
                  <span className="font-mono text-sm">{formatCurrency(taxAmount)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="font-mono">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer-notes">Customer Notes</Label>
                <Textarea
                  id="customer-notes"
                  placeholder="Notes visible to the customer..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internal-notes">Internal Notes</Label>
                <Textarea
                  id="internal-notes"
                  placeholder="Private notes (not shown to customer)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createEstimate.isPending || lineItems.length === 0}
          >
            {createEstimate.isPending ? 'Creating...' : 'Create Estimate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
