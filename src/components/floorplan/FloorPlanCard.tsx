import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Map, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { FloorPlan, getFloorPlanThumbnailUrl } from '@/hooks/useFloorPlans';
import { format } from 'date-fns';

interface FloorPlanCardProps {
  plan: FloorPlan;
  onEdit: () => void;
  onDelete: () => void;
}

export const FloorPlanCard = ({ plan, onEdit, onDelete }: FloorPlanCardProps) => {
  const thumbnailUrl = getFloorPlanThumbnailUrl(plan.thumbnail_path);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="aspect-video bg-muted flex items-center justify-center cursor-pointer"
        onClick={onEdit}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={plan.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <Map className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{plan.name}</h4>
            <p className="text-xs text-muted-foreground">
              Floor {plan.floor_number} • {format(new Date(plan.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
