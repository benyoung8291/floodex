import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EstimateCard } from './EstimateCard';
import { EstimatePreviewDialog } from './EstimatePreviewDialog';
import {
  JobEstimate,
  useSendEstimate,
  useAcceptEstimate,
  useDeclineEstimate,
  useDeleteEstimate,
} from '@/hooks/useJobEstimates';

interface EstimatesListProps {
  estimates: JobEstimate[];
  jobId: string;
}

export function EstimatesList({ estimates, jobId }: EstimatesListProps) {
  const [viewingEstimate, setViewingEstimate] = useState<JobEstimate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobEstimate | null>(null);

  const sendEstimate = useSendEstimate();
  const acceptEstimate = useAcceptEstimate();
  const declineEstimate = useDeclineEstimate();
  const deleteEstimate = useDeleteEstimate();

  const handleSend = (estimate: JobEstimate) => {
    sendEstimate.mutate({ id: estimate.id, email: estimate.customer_email || undefined });
  };

  const handleAccept = (estimate: JobEstimate) => {
    acceptEstimate.mutate(estimate.id);
  };

  const handleDecline = (estimate: JobEstimate) => {
    declineEstimate.mutate({ id: estimate.id });
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteEstimate.mutate(
        { id: deleteTarget.id, jobId },
        { onSuccess: () => setDeleteTarget(null) }
      );
    }
  };

  if (estimates.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Estimates
          </CardTitle>
          <CardDescription>
            Customer-facing cost estimates for this job
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {estimates.map((estimate) => (
            <EstimateCard
              key={estimate.id}
              estimate={estimate}
              onView={setViewingEstimate}
              onSend={handleSend}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onDelete={setDeleteTarget}
            />
          ))}
        </CardContent>
      </Card>

      <EstimatePreviewDialog
        estimate={viewingEstimate}
        open={!!viewingEstimate}
        onOpenChange={(open) => !open && setViewingEstimate(null)}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete estimate "{deleteTarget?.estimate_number}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
