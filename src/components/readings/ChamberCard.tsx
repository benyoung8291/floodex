import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Droplets, Plus, Clock, Fan, Wind, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';
import { 
  formatHumidityRatio, 
  getHumidityRatioStatus, 
  calculateDryingProgress,
  fahrenheitToCelsius,
  type UnitSystem 
} from '@/lib/psychrometrics';
import { cn } from '@/lib/utils';

type DryingChamber = Tables<'drying_chambers'>;
type MoistureReading = Tables<'moisture_readings'>;
type Equipment = Tables<'equipment'>;
type EquipmentAssignment = Tables<'equipment_assignments'>;

interface ChamberCardProps {
  chamber: DryingChamber;
  latestReading?: MoistureReading;
  units: UnitSystem;
  temperatureUnit?: 'F' | 'C';
  equipmentAssignments?: (EquipmentAssignment & { equipment: Equipment })[];
  onAddReading: (chamberId: string) => void;
  onViewHistory: (chamberId: string) => void;
  onManageEquipment?: (chamberId: string) => void;
}

export function ChamberCard({
  chamber,
  latestReading,
  units,
  temperatureUnit = 'F',
  equipmentAssignments = [],
  onAddReading,
  onViewHistory,
  onManageEquipment,
}: ChamberCardProps) {
  const currentGpp = latestReading?.gpp ?? null;
  const targetGpp = chamber.target_gpp;
  
  const status = currentGpp && targetGpp 
    ? getHumidityRatioStatus(currentGpp, targetGpp)
    : null;
  
  // Calculate progress (assuming initial GPP was 2x target for visualization)
  const progress = currentGpp && targetGpp
    ? calculateDryingProgress(currentGpp, targetGpp * 2, targetGpp)
    : 0;

  const statusColors = {
    success: 'text-success border-success/50 bg-success/5',
    warning: 'text-warning border-warning/50 bg-warning/5',
    emergency: 'text-emergency border-emergency/50 bg-emergency/5',
  };

  return (
    <Card 
      className={cn(
        'border-border bg-card cursor-pointer transition-all hover:border-primary/50',
        status && statusColors[status]
      )}
      onClick={() => onViewHistory(chamber.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Droplets className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{chamber.name}</h3>
              {latestReading && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(latestReading.logged_at), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onAddReading(chamber.id);
            }}
          >
            <Plus className="h-4 w-4" />
            Log
          </Button>
        </div>

        {currentGpp !== null ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tabular-nums">
                {formatHumidityRatio(currentGpp, units)}
              </span>
              {targetGpp && (
                <span className="text-sm text-muted-foreground">
                  Target: {formatHumidityRatio(targetGpp, units)}
                </span>
              )}
            </div>
            
            {targetGpp && (
              <Progress 
                value={progress} 
                className={cn(
                  'h-2',
                  status === 'success' && '[&>div]:bg-success',
                  status === 'warning' && '[&>div]:bg-warning',
                  status === 'emergency' && '[&>div]:bg-emergency'
                )}
              />
            )}
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Temp: {temperatureUnit === 'C' 
                ? Math.round(fahrenheitToCelsius(latestReading.temperature)) 
                : latestReading.temperature}°{temperatureUnit}</span>
              <span>RH: {latestReading.relative_humidity}%</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No readings yet
          </p>
        )}

        {/* Equipment Summary */}
        {equipmentAssignments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex flex-wrap gap-1.5">
              {(() => {
                const counts = equipmentAssignments.reduce((acc, a) => {
                  acc[a.equipment.type] = (acc[a.equipment.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                return Object.entries(counts).map(([type, count]) => (
                  <Badge key={type} variant="secondary" className="gap-1 text-xs">
                    {type === 'air_mover' && <Fan className="h-3 w-3" />}
                    {type === 'dehumidifier' && <Droplets className="h-3 w-3" />}
                    {type === 'hepa_unit' && <Wind className="h-3 w-3" />}
                    {count}
                  </Badge>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Manage Equipment Button */}
        {onManageEquipment && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onManageEquipment(chamber.id);
            }}
          >
            <Package className="h-4 w-4" />
            Manage Equipment
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
