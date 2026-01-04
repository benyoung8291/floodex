import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormTemplatesGallery } from './FormTemplatesGallery';
import { FormViewer } from './FormViewer';
import { FormTemplateDefinition, FormField, LOSS_TYPE_LABELS } from '@/lib/formTemplates';
import { useCreateJobForm, useCreateFormSignature, useUpdateJobForm } from '@/hooks/useJobForms';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FormFillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobData: Record<string, any>;
}

type Step = 'select' | 'fill' | 'signing';

export function FormFillDialog({ open, onOpenChange, jobId, jobData }: FormFillDialogProps) {
  const [step, setStep] = useState<Step>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplateDefinition | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [signatures, setSignatures] = useState<Record<string, { blob?: Blob; name?: string; captured?: boolean }>>({});
  const [createdFormId, setCreatedFormId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const createForm = useCreateJobForm();
  const createSignature = useCreateFormSignature();
  const updateForm = useUpdateJobForm();

  // Prepare job data with formatted values
  const preparedJobData = {
    ...jobData,
    loss_type: LOSS_TYPE_LABELS[jobData.loss_type] || jobData.loss_type,
    start_date: jobData.start_date ? format(new Date(jobData.start_date), 'MMM d, yyyy') : '',
    date_of_loss: jobData.date_of_loss ? format(new Date(jobData.date_of_loss), 'MMM d, yyyy') : '',
  };

  const handleTemplateSelect = (template: FormTemplateDefinition) => {
    setSelectedTemplate(template);
    // Initialize field values with defaults
    const initialValues: Record<string, any> = {};
    template.fields.forEach((field) => {
      if (field.type === 'auto_fill' && field.autoFillKey) {
        initialValues[field.id] = preparedJobData[field.autoFillKey] || '';
      } else if (field.type === 'date') {
        initialValues[field.id] = format(new Date(), 'yyyy-MM-dd');
      }
    });
    setFieldValues(initialValues);
    setSignatures({});
    setStep('fill');
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSignatureCapture = (fieldId: string, blob: Blob) => {
    setSignatures((prev) => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], blob, captured: true },
    }));
  };

  const handleSignatureNameChange = (fieldId: string, name: string) => {
    setSignatures((prev) => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], name },
    }));
  };

  const validateForm = (): boolean => {
    if (!selectedTemplate) return false;

    for (const field of selectedTemplate.fields) {
      if (!field.required) continue;

      if (field.type === 'signature') {
        const sig = signatures[field.id];
        if (!sig?.captured || !sig?.name) {
          toast.error(`Please complete the ${field.label}`);
          return false;
        }
      } else if (field.type === 'checkbox') {
        if (fieldValues[field.id] !== true) {
          toast.error(`Please check: ${field.label}`);
          return false;
        }
      } else if (field.type !== 'auto_fill') {
        if (!fieldValues[field.id]) {
          toast.error(`Please fill in: ${field.label}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!selectedTemplate || !validateForm()) return;

    setIsSaving(true);
    try {
      // Create the form
      const form = await createForm.mutateAsync({
        job_id: jobId,
        form_type: selectedTemplate.form_type,
        title: selectedTemplate.name,
        field_values: fieldValues,
      });

      setCreatedFormId(form.id);

      // Get current location for signatures
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch {
        // Location not available, continue without it
      }

      // Upload all signatures
      const signatureFields = selectedTemplate.fields.filter((f) => f.type === 'signature');
      
      for (const field of signatureFields) {
        const sig = signatures[field.id];
        if (sig?.blob && sig?.name) {
          await createSignature.mutateAsync({
            form_id: form.id,
            job_id: jobId,
            signer_type: field.signerType || 'technician',
            signer_name: sig.name,
            signature_blob: sig.blob,
            latitude,
            longitude,
          });
        }
      }

      // Update form status to signed
      await updateForm.mutateAsync({
        id: form.id,
        status: 'signed',
        signed_at: new Date().toISOString(),
      });

      toast.success('Form signed and saved successfully');
      handleClose();
    } catch (error) {
      console.error('Failed to save form:', error);
      toast.error('Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedTemplate(null);
    setFieldValues({});
    setSignatures({});
    setCreatedFormId(null);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 'fill') {
      setStep('select');
      setSelectedTemplate(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step !== 'select' && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <DialogTitle>
                {step === 'select' ? 'Create New Form' : selectedTemplate?.name}
              </DialogTitle>
              <DialogDescription>
                {step === 'select'
                  ? 'Select a form template to get started'
                  : 'Fill out the form and capture signatures'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 'select' && (
          <FormTemplatesGallery onSelect={handleTemplateSelect} />
        )}

        {step === 'fill' && selectedTemplate && (
          <div className="space-y-6">
            <FormViewer
              fields={selectedTemplate.fields}
              values={fieldValues}
              onChange={handleFieldChange}
              signatures={signatures}
              onSignatureCapture={handleSignatureCapture}
              onSignatureNameChange={handleSignatureNameChange}
              jobData={preparedJobData}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save & Complete'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
