import { format } from 'date-fns';
import { FileText, Send, Eye, Check, X, Trash2, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { JobEstimate } from '@/hooks/useJobEstimates';

interface EstimateCardProps {
  estimate: JobEstimate;
  onView: (estimate: JobEstimate) => void;
  onSend: (estimate: JobEstimate) => void;
  onAccept: (estimate: JobEstimate) => void;
  onDecline: (estimate: JobEstimate) => void;
  onDelete: (estimate: JobEstimate) => void;
}

const statusConfig: Record<
  JobEstimate['status'],
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  sent: { label: 'Sent', variant: 'default' },
  accepted: { label: 'Accepted', variant: 'default' },
  declined: { label: 'Declined', variant: 'destructive' },
  expired: { label: 'Expired', variant: 'outline' },
};

export function EstimateCard({
  estimate,
  onView,
  onSend,
  onAccept,
  onDecline,
  onDelete,
}: EstimateCardProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const status = statusConfig[estimate.status];
  const isExpired =
    estimate.valid_until && new Date(estimate.valid_until) < new Date() && estimate.status === 'sent';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{estimate.estimate_number}</span>
                <Badge variant={isExpired ? 'destructive' : status.variant}>
                  {isExpired ? 'Expired' : status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {estimate.customer_name}
              </p>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span>{format(new Date(estimate.created_at), 'MMM d, yyyy')}</span>
                {estimate.valid_until && (
                  <span>Valid until {format(new Date(estimate.valid_until), 'MMM d, yyyy')}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-lg">
              {formatCurrency(Number(estimate.total_amount))}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(estimate)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                {estimate.status === 'draft' && (
                  <DropdownMenuItem onClick={() => onSend(estimate)}>
                    <Send className="h-4 w-4 mr-2" />
                    Mark as Sent
                  </DropdownMenuItem>
                )}
                {estimate.status === 'sent' && (
                  <>
                    <DropdownMenuItem onClick={() => onAccept(estimate)}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark Accepted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDecline(estimate)}>
                      <X className="h-4 w-4 mr-2" />
                      Mark Declined
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(estimate)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
