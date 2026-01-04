import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormStepper } from '@/components/jobs/FormStepper';
import { CustomerInfoStep } from '@/components/jobs/CustomerInfoStep';
import { LocationStep } from '@/components/jobs/LocationStep';
import { LossTypeStep } from '@/components/jobs/LossTypeStep';
import { SafetyCheckStep } from '@/components/jobs/SafetyCheckStep';
import { useCreateJob } from '@/hooks/useCreateJob';
import { ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';

const safetyCheckSchema = z.object({
  hazardType: z.string(),
  isPresent: z.boolean(),
  requiresStopWork: z.boolean(),
  notes: z.string(),
});

const jobSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').max(100),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required').max(255),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(50),
  zipCode: z.string().min(1, 'ZIP code is required').max(20),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  lossType: z.enum(['cat1', 'cat2', 'cat3']),
  notes: z.string().max(1000).optional(),
  safetyChecks: z.array(safetyCheckSchema).default([]),
});
type SafetyCheck = z.infer<typeof safetyCheckSchema>;

type JobFormData = z.infer<typeof jobSchema>;

const steps = [
  { label: 'Customer' },
  { label: 'Location' },
  { label: 'Loss Type' },
  { label: 'Safety' },
];

export default function JobCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const createJob = useCreateJob();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      lossType: 'cat1',
      notes: '',
      safetyChecks: [],
    },
  });

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof JobFormData)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['customerName'];
        break;
      case 1:
        fieldsToValidate = ['address', 'city', 'state', 'zipCode'];
        break;
      case 2:
        fieldsToValidate = ['lossType'];
        break;
      case 3:
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate('/jobs');
    }
  };

  const onSubmit = async (data: JobFormData) => {
    try {
      const job = await createJob.mutateAsync({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        latitude: data.latitude,
        longitude: data.longitude,
        lossType: data.lossType,
        notes: data.notes,
        safetyChecks: data.safetyChecks.map((check) => ({
          hazardType: check.hazardType,
          isPresent: check.isPresent,
          requiresStopWork: check.requiresStopWork,
          notes: check.notes,
        })),
      });
      navigate(`/jobs/${job.id}`);
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <CustomerInfoStep form={form} />;
      case 1:
        return <LocationStep form={form} />;
      case 2:
        return <LossTypeStep form={form} />;
      case 3:
        return <SafetyCheckStep form={form} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-semibold text-foreground text-center mb-4">
            New Loss
          </h1>
          <FormStepper steps={steps} currentStep={currentStep} />
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                {renderStep()}
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="max-w-lg mx-auto flex gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1 h-14"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              size="lg"
              className="flex-1 h-14"
              disabled={createJob.isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {createJob.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Check className="mr-2 h-5 w-5" />
              )}
              Create Job
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="flex-1 h-14"
              onClick={handleNext}
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
