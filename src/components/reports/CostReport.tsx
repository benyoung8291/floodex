import { forwardRef } from 'react';
import { ReportHeader } from './templates/ReportHeader';
import { ReportFooter } from './templates/ReportFooter';
import { SignatureBlock } from './templates/SignatureBlock';
import { JobReportData } from '@/hooks/useReportData';
import { JobCostItem, CostSummary } from '@/hooks/useJobCostItems';
import { COST_CATEGORIES, UNIT_TYPES } from '@/hooks/useCostTemplates';

interface CostReportProps {
  data: JobReportData;
  costItems: JobCostItem[];
  summary: CostSummary;
  showNonBillable?: boolean;
  includeSignature?: boolean;
}

export const CostReport = forwardRef<HTMLDivElement, CostReportProps>(
  ({ data, costItems, summary, showNonBillable = true, includeSignature = true }, ref) => {
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const getCategoryLabel = (value: string) =>
      COST_CATEGORIES.find((c) => c.value === value)?.label || value;

    const getUnitLabel = (value: string) =>
      UNIT_TYPES.find((u) => u.value === value)?.label || value;

    // Filter items based on showNonBillable
    const displayItems = showNonBillable
      ? costItems
      : costItems.filter((item) => item.is_billable);

    // Group items by category
    const groupedItems = displayItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, JobCostItem[]>);

    // Calculate display totals (may differ from full summary if filtering)
    const displayTotal = displayItems.reduce(
      (sum, item) => sum + Number(item.total_amount),
      0
    );

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto print:p-0">
        <ReportHeader
          job={data.job}
          reportTitle="Cost Summary Report"
          companyName={data.tenant?.name}
          companyLogo={data.tenant?.logo_url || undefined}
          headerTagline={data.tenant?.report_header_text || undefined}
        />

        {/* Job Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Customer:</span>{' '}
              <span className="font-medium">{data.job.customer_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Address:</span>{' '}
              <span className="font-medium">{data.job.address}</span>
            </div>
            <div>
              <span className="text-gray-500">Days Drying:</span>{' '}
              <span className="font-medium">{data.job.days_drying}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>{' '}
              <span className="font-medium capitalize">{data.job.status}</span>
            </div>
          </div>
        </div>

        {/* Cost Items by Category */}
        {Object.entries(groupedItems).map(([category, items]) => {
          const categoryTotal = items.reduce(
            (sum, item) => sum + Number(item.total_amount),
            0
          );

          return (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                {getCategoryLabel(category)}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Description</th>
                    <th className="text-right py-2 font-medium w-24">Quantity</th>
                    <th className="text-right py-2 font-medium w-24">Rate</th>
                    <th className="text-right py-2 font-medium w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2">
                        <div>
                          {item.name}
                          {!item.is_billable && (
                            <span className="ml-2 text-xs text-gray-400">(non-billable)</span>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500">{item.description}</div>
                        )}
                      </td>
                      <td className="text-right py-2 font-mono">
                        {Number(item.quantity)}
                      </td>
                      <td className="text-right py-2 font-mono">
                        {formatCurrency(Number(item.unit_rate))}
                        <div className="text-xs text-gray-400">
                          /{getUnitLabel(item.unit_type).toLowerCase()}
                        </div>
                      </td>
                      <td className="text-right py-2 font-mono font-medium">
                        {formatCurrency(Number(item.total_amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right py-2 font-medium">
                      {getCategoryLabel(category)} Subtotal:
                    </td>
                    <td className="text-right py-2 font-mono font-semibold">
                      {formatCurrency(categoryTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}

        {/* Totals Summary */}
        <div className="mt-8 border-t-2 pt-4">
          <div className="flex justify-end">
            <div className="w-64">
              {showNonBillable && summary.totalNonBillable > 0 && (
                <>
                  <div className="flex justify-between py-1 text-sm">
                    <span>Billable Subtotal:</span>
                    <span className="font-mono">{formatCurrency(summary.totalBillable)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-sm text-gray-500">
                    <span>Non-Billable:</span>
                    <span className="font-mono">{formatCurrency(summary.totalNonBillable)}</span>
                  </div>
                  <div className="border-t my-2"></div>
                </>
              )}
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>Total:</span>
                <span className="font-mono">
                  {formatCurrency(showNonBillable ? summary.grandTotal : summary.totalBillable)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-1">Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>This is an estimated cost summary and not an official invoice.</li>
            <li>Final charges may vary based on actual work completed.</li>
            <li>Contact us for questions about this estimate.</li>
          </ul>
        </div>

        {includeSignature && (
          <SignatureBlock
            customerLabel={data.tenant?.report_customer_label || 'Customer Signature'}
            technicianLabel={data.tenant?.report_technician_label || 'Technician Signature'}
          />
        )}

        <ReportFooter footerText={data.tenant?.report_footer_text || undefined} />
      </div>
    );
  }
);

CostReport.displayName = 'CostReport';
