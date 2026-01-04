import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { JobForm, useFormSignatures, getSignatureUrl } from '@/hooks/useJobForms';
import { FORM_TYPE_LABELS, BUILT_IN_TEMPLATES, LOSS_TYPE_LABELS } from '@/lib/formTemplates';
import { format } from 'date-fns';
import { CheckCircle, Clock, XCircle, AlertCircle, Download, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface FormViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: JobForm;
  jobData: Record<string, any>;
  mode: 'edit' | 'view';
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  draft: { label: 'Draft', icon: <Clock className="h-4 w-4" />, className: 'bg-muted text-muted-foreground' },
  pending_signature: { label: 'Pending Signature', icon: <AlertCircle className="h-4 w-4" />, className: 'bg-yellow-100 text-yellow-800' },
  signed: { label: 'Signed', icon: <CheckCircle className="h-4 w-4" />, className: 'bg-green-100 text-green-800' },
  voided: { label: 'Voided', icon: <XCircle className="h-4 w-4" />, className: 'bg-red-100 text-red-800' },
};

export function FormViewDialog({ open, onOpenChange, form, jobData, mode }: FormViewDialogProps) {
  const { data: signatures } = useFormSignatures(form.id);
  const [signatureUrls, setSignatureUrls] = useState<Record<string, string>>({});
  
  const template = BUILT_IN_TEMPLATES.find((t) => t.form_type === form.form_type);
  const status = STATUS_CONFIG[form.status] || STATUS_CONFIG.draft;

  // Prepare job data
  const preparedJobData = {
    ...jobData,
    loss_type: LOSS_TYPE_LABELS[jobData.loss_type] || jobData.loss_type,
    start_date: jobData.start_date ? format(new Date(jobData.start_date), 'MMM d, yyyy') : '',
    date_of_loss: jobData.date_of_loss ? format(new Date(jobData.date_of_loss), 'MMM d, yyyy') : '',
  };

  // Get signed URLs for signatures
  useEffect(() => {
    const fetchUrls = async () => {
      if (!signatures) return;
      
      const urls: Record<string, string> = {};
      for (const sig of signatures) {
        const { data } = await supabase.storage
          .from('signed-documents')
          .createSignedUrl(sig.signature_image_path, 3600);
        if (data?.signedUrl) {
          urls[sig.id] = data.signedUrl;
        }
      }
      setSignatureUrls(urls);
    };

    fetchUrls();
  }, [signatures]);

  const renderFieldValue = (fieldId: string, fieldLabel: string, fieldType: string, autoFillKey?: string) => {
    let value = form.field_values[fieldId];
    
    if (fieldType === 'auto_fill' && autoFillKey) {
      value = preparedJobData[autoFillKey];
    }
    
    if (fieldType === 'checkbox') {
      return value ? 'Yes' : 'No';
    }
    
    return value || <span className="text-muted-foreground italic">Not provided</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{form.title}</DialogTitle>
              <DialogDescription>
                {FORM_TYPE_LABELS[form.form_type] || form.form_type}
              </DialogDescription>
            </div>
            <Badge className={status.className}>
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Created: {format(new Date(form.created_at), 'MMM d, yyyy h:mm a')}</span>
            {form.signed_at && (
              <span>Signed: {format(new Date(form.signed_at), 'MMM d, yyyy h:mm a')}</span>
            )}
            {form.voided_at && (
              <span className="text-destructive">
                Voided: {format(new Date(form.voided_at), 'MMM d, yyyy')}
              </span>
            )}
          </div>

          <Separator />

          {/* Form fields */}
          {template && (
            <div className="space-y-4">
              <h4 className="font-medium">Form Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {template.fields
                  .filter((field) => field.type !== 'signature')
                  .map((field) => (
                    <div
                      key={field.id}
                      className={field.fullWidth ? 'col-span-2' : ''}
                    >
                      <p className="text-sm font-medium text-muted-foreground">
                        {field.label}
                      </p>
                      <p className="mt-1">
                        {renderFieldValue(field.id, field.label, field.type, field.autoFillKey)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Signatures</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signatures.map((sig) => (
                  <Card key={sig.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium capitalize">{sig.signer_type}</span>
                      </div>
                      <p className="text-sm">{sig.signer_name}</p>
                      {sig.signer_email && (
                        <p className="text-xs text-muted-foreground">{sig.signer_email}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(sig.signed_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      {signatureUrls[sig.id] && (
                        <div className="mt-3 border rounded-lg p-2 bg-background">
                          <img
                            src={signatureUrls[sig.id]}
                            alt={`${sig.signer_name}'s signature`}
                            className="max-h-20 mx-auto"
                          />
                        </div>
                      )}
                      {sig.latitude && sig.longitude && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📍 {sig.latitude.toFixed(4)}, {sig.longitude.toFixed(4)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Void reason */}
          {form.status === 'voided' && form.voided_reason && (
            <>
              <Separator />
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium text-destructive">Void Reason</p>
                <p className="mt-1 text-sm">{form.voided_reason}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {form.status === 'signed' && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
