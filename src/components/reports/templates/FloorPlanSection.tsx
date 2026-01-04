import { FloorPlan, getFloorPlanThumbnailUrl } from '@/hooks/useFloorPlans';

interface FloorPlanSectionProps {
  floorPlans: FloorPlan[];
}

export const FloorPlanSection = ({ floorPlans }: FloorPlanSectionProps) => {
  if (!floorPlans || floorPlans.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 break-inside-avoid">
      <h2 className="text-lg font-semibold border-b-2 border-primary pb-2 mb-4">
        Floor Plans / Mud Maps
      </h2>
      
      <div className="space-y-6">
        {floorPlans.map((plan) => {
          const thumbnailUrl = getFloorPlanThumbnailUrl(plan.thumbnail_path);
          
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
            <div className="w-4 h-4 bg-amber-500 rounded-full" />
            <span>Reading Point</span>
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
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full" />
            <span>DES - Desiccant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
