import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminTiers() {
  const { data: tiers, isLoading } = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pricing Tiers</h1>
          <p className="text-muted-foreground">Configure subscription plans and usage limits</p>
        </div>
        <Button className="gap-2">
          <CreditCard className="w-4 h-4" />
          Add Tier
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-8 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers?.map((tier) => (
            <Card key={tier.id} className={tier.is_free_tier ? 'border-success/50' : ''}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <Button variant="ghost" size="icon">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">
                    ${Number(tier.monthly_price).toFixed(0)}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jobs included</span>
                    <span className="font-medium">{tier.jobs_included}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Readings included</span>
                    <span className="font-medium">{tier.readings_included}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overage per job</span>
                    <span className="font-medium">${Number(tier.overage_price_per_job).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overage per reading</span>
                    <span className="font-medium">${Number(tier.overage_price_per_reading).toFixed(4)}</span>
                  </div>
                </div>

                {tier.is_free_tier && (
                  <div className="pt-2">
                    <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                      Free Tier
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
