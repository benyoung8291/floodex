import { DollarSign, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CostSummary } from '@/hooks/useJobCostItems';
import { COST_CATEGORIES } from '@/hooks/useCostTemplates';

interface JobCostSummaryProps {
  summary: CostSummary;
}

export function JobCostSummaryCard({ summary }: JobCostSummaryProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getCategoryLabel = (value: string) =>
    COST_CATEGORIES.find((c) => c.value === value)?.label || value;

  const categoryEntries = Object.entries(summary.byCategory).sort((a, b) => 
    b[1].total - a[1].total
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-5 w-5" />
          Cost Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary.itemCount === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No cost items added yet
          </p>
        ) : (
          <>
            {/* Category Breakdown */}
            <div className="space-y-2">
              {categoryEntries.map(([category, data]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {getCategoryLabel(category)}
                  </span>
                  <span className="font-mono">{formatCurrency(data.total)}</span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Billable Total</span>
                <span className="font-mono text-green-600">
                  {formatCurrency(summary.totalBillable)}
                </span>
              </div>
              {summary.totalNonBillable > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Non-Billable</span>
                  <span className="font-mono text-muted-foreground">
                    {formatCurrency(summary.totalNonBillable)}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Grand Total */}
            <div className="flex justify-between items-center">
              <span className="font-medium">Grand Total</span>
              <span className="text-xl font-bold">
                {formatCurrency(summary.grandTotal)}
              </span>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              {summary.itemCount} item{summary.itemCount !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function JobCostStats({ summary }: JobCostSummaryProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Billable Total</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalBillable)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-muted p-3">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{summary.itemCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grand Total</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.grandTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
