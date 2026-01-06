import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Edit2, RefreshCw, Users, DollarSign, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { TierFormDialog } from '@/components/admin/TierFormDialog';
import {
  useAdminTiers,
  useCreateTier,
  useUpdateTier,
  useToggleTierStatus,
  useSyncTierToStripe,
  TierWithStats,
  TierFormData,
} from '@/hooks/useAdminTiers';

export default function AdminTiers() {
  const { data: tiers, isLoading } = useAdminTiers();
  const createTier = useCreateTier();
  const updateTier = useUpdateTier();
  const toggleStatus = useToggleTierStatus();
  const syncToStripe = useSyncTierToStripe();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<TierWithStats | null>(null);

  const handleCreate = () => {
    setEditingTier(null);
    setDialogOpen(true);
  };

  const handleEdit = (tier: TierWithStats) => {
    setEditingTier(tier);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: TierFormData) => {
    if (editingTier) {
      await updateTier.mutateAsync({ id: editingTier.id, data });
    } else {
      await createTier.mutateAsync(data);
    }
    setDialogOpen(false);
    setEditingTier(null);
  };

  const handleToggleActive = (tier: TierWithStats) => {
    toggleStatus.mutate({ id: tier.id, is_active: !tier.is_active });
  };

  const handleSyncToStripe = (tier: TierWithStats) => {
    syncToStripe.mutate(tier);
  };

  const totalMRR = tiers?.reduce((sum, tier) => sum + tier.mrr, 0) ?? 0;
  const totalTenants = tiers?.reduce((sum, tier) => sum + tier.tenant_count, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pricing Tiers</h1>
          <p className="text-muted-foreground">Configure subscription plans and usage limits</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <CreditCard className="w-4 h-4" />
          Add Tier
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold">${totalMRR.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribed Tenants</p>
                <p className="text-2xl font-bold">{totalTenants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers?.map((tier) => (
            <Card
              key={tier.id}
              className={`relative ${tier.is_free_tier ? 'border-success/50' : ''} ${
                !tier.is_active ? 'opacity-60' : ''
              }`}
            >
              {/* Stripe sync indicator */}
              <div className="absolute top-3 right-3">
                {tier.stripe_price_id ? (
                  <div className="flex items-center gap-1 text-success text-xs">
                    <Check className="w-3 h-3" />
                    <span>Synced</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-warning text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>Not synced</span>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  {tier.is_free_tier && (
                    <Badge variant="secondary" className="bg-success/20 text-success text-xs">
                      Free
                    </Badge>
                  )}
                  {!tier.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold">
                    ${Number(tier.monthly_price).toFixed(0)}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                {/* Tenant count and MRR */}
                <div className="flex items-center gap-4 py-2 border-y border-border">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{tier.tenant_count}</span>
                    <span className="text-xs text-muted-foreground">tenants</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">${tier.mrr}</span>
                    <span className="text-xs text-muted-foreground">MRR</span>
                  </div>
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
                    <span className="font-medium">
                      ${Number(tier.overage_price_per_job).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overage per reading</span>
                    <span className="font-medium">
                      ${Number(tier.overage_price_per_reading).toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={tier.is_active}
                      onCheckedChange={() => handleToggleActive(tier)}
                      disabled={toggleStatus.isPending}
                    />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tier)}
                      title="Edit tier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSyncToStripe(tier)}
                      disabled={syncToStripe.isPending}
                      title="Sync to Stripe"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${syncToStripe.isPending ? 'animate-spin' : ''}`}
                      />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TierFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tier={editingTier}
        onSubmit={handleSubmit}
        isLoading={createTier.isPending || updateTier.isPending}
      />
    </div>
  );
}
