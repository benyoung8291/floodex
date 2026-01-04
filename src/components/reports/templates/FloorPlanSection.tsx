import { FloorPlan, getFloorPlanThumbnailUrl } from '@/hooks/useFloorPlans';
import type { Tables } from '@/integrations/supabase/types';
import { formatHumidityRatio } from '@/lib/psychrometrics';

type MoistureReading = Tables<'moisture_readings'>;

interface FloorPlanSectionProps {
  floorPlans: FloorPlan[];
  linkedReadings?: MoistureReading[];
}

export const FloorPlanSection = ({ floorPlans, linkedReadings = [] }: FloorPlanSectionProps) => {
  if (!floorPlans || floorPlans.length === 0) {
    return null;
  }

  // Group linked readings by floor plan ID
  const readingsByFloorPlan = linkedReadings.reduce((acc, reading) => {
    if (reading.floor_plan_id) {
      if (!acc[reading.floor_plan_id]) {
        acc[reading.floor_plan_id] = [];
      }
      acc[reading.floor_plan_id].push(reading);
    }
    return acc;
  }, {} as Record<string, MoistureReading[]>);

  return (
    <div className="mb-8 break-inside-avoid">
      <h2 className="text-lg font-semibold border-b-2 border-primary pb-2 mb-4">
        Floor Plans / Mud Maps
      </h2>
      
      <div className="space-y-6">
        {floorPlans.map((plan) => {
          const thumbnailUrl = getFloorPlanThumbnailUrl(plan.thumbnail_path);
          const planReadings = readingsByFloorPlan[plan.id] || [];
          
          return (
            <div key={plan.id} className="break-inside-avoid">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{plan.name}</h3>
                <span className="text-sm text-muted-foreground">
                  Floor {plan.floor_number}
                </span>
              </div>
              
              {thumbnailUrl && (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt={plan.name}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Linked readings for this floor plan */}
              {planReadings.length > 0 && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Linked Reading Points</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {planReadings
                      .sort((a, b) => {
                        const markerA = parseInt(a.marker_id?.replace(/\D/g, '') || '0');
                        const markerB = parseInt(b.marker_id?.replace(/\D/g, '') || '0');
                        return markerA - markerB;
                      })
                      .map((reading) => (
                        <div key={reading.id} className="flex items-center gap-2 p-1.5 bg-background rounded">
                          <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-white text-[10px] font-bold">
                            #
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">
                              {reading.gpp ? formatHumidityRatio(reading.gpp, 'imperial') : 'N/A'}
                            </span>
                            <span className="text-muted-foreground ml-1">
                              ({reading.temperature}°F / {reading.relative_humidity}%)
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <h4 className="font-medium text-sm mb-2">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full" />
            <span>DH - Dehumidifier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            <span>AM - Air Mover</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full" />
            <span>LGR - LGR Dehumidifier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            <span>Reading Point (Unlinked)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            <span>Reading Point (Linked)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-300/50 border border-blue-500 border-dashed" />
            <span>Affected Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full" />
            <span>HEPA - Air Scrubber</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-500 rounded-full" />
            <span>INJ - Injectidry</span>
          </div>
        </div>
      </div>
    </div>
  );
};
