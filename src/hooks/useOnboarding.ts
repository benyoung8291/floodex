import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingState {
  onboarding_completed: boolean;
  onboarding_step: number;
}

export function useOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['onboarding', user?.id],
    queryFn: async (): Promise<OnboardingState> => {
      if (!user?.id) {
        return { onboarding_completed: true, onboarding_step: 0 };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_step')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updateOnboardingMutation = useMutation({
    mutationFn: async ({ step, completed }: { step?: number; completed?: boolean }) => {
      if (!user?.id) throw new Error('No user');

      const updates: Partial<OnboardingState> = {};
      if (step !== undefined) updates.onboarding_step = step;
      if (completed !== undefined) updates.onboarding_completed = completed;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', user?.id] });
    },
  });

  const updateStep = (step: number) => {
    updateOnboardingMutation.mutate({ step });
  };

  const completeOnboarding = () => {
    updateOnboardingMutation.mutate({ completed: true });
  };

  return {
    isOnboardingComplete: data?.onboarding_completed ?? true,
    currentStep: data?.onboarding_step ?? 0,
    isLoading,
    updateStep,
    completeOnboarding,
  };
}
