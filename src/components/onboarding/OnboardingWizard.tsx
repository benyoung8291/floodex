import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutDashboard, 
  ClipboardList, 
  Thermometer, 
  Rocket 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { OnboardingStep } from './OnboardingStep';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';

const TOTAL_STEPS = 5;

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentStep, updateStep, completeOnboarding } = useOnboarding();
  const [step, setStep] = useState(currentStep);

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      const newStep = step + 1;
      setStep(newStep);
      updateStep(newStep);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      const newStep = step - 1;
      setStep(newStep);
      updateStep(newStep);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleCreateJob = () => {
    completeOnboarding();
    navigate('/jobs/new');
  };

  const handleFinish = () => {
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md overflow-hidden">
        {step === 0 && (
          <OnboardingStep
            icon={Sparkles}
            title={`Welcome, ${userName}!`}
            description="FloodEx helps you manage water damage restoration jobs efficiently. Track drying progress, log moisture readings, and generate professional reports."
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            onNext={handleNext}
            onSkip={handleSkip}
            nextLabel="Get Started"
            showBack={false}
          />
        )}

        {step === 1 && (
          <OnboardingStep
            icon={LayoutDashboard}
            title="Your Dashboard"
            description="The dashboard gives you a quick overview of all your active jobs. See emergency jobs, ongoing drying projects, and jobs ready for completion at a glance."
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        )}

        {step === 2 && (
          <OnboardingStep
            icon={ClipboardList}
            title="Creating Jobs"
            description="Each job captures customer info, location, and loss type. Water categories (Cat 1-3) help classify contamination levels. Safety checks ensure technician protection."
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        )}

        {step === 3 && (
          <OnboardingStep
            icon={Thermometer}
            title="Moisture Readings"
            description="Create drying chambers for each affected area. Log temperature and humidity readings to calculate GPP (Grains Per Pound). Track drying progress over time."
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        )}

        {step === 4 && (
          <OnboardingStep
            icon={Rocket}
            title="Ready to Start?"
            description="Create your first job now, or explore the dashboard first. You can always come back and create jobs later."
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            onNext={handleCreateJob}
            onBack={handleBack}
            onSkip={handleFinish}
            nextLabel="Create First Job"
          />
        )}
      </Card>
    </div>
  );
}
