import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Fan, Droplets, Wind, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tables } from '@/integrations/supabase/types';

type Equipment = Tables<'equipment'>;

interface EquipmentCardProps {
  equipment: Equipment;
  assignedTo?: string;
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  dehumidifier: <Droplets className="h-5 w-5" />,
  air_mover: <Fan className="h-5 w-5" />,
  hepa_unit: <Wind className="h-5 w-5" />,
};

const typeLabels: Record<string, string> = {
  dehumidifier: 'Dehumidifier',
  air_mover: 'Air Mover',
  hepa_unit: 'HEPA Unit',
};

export function EquipmentCard({ equipment, assignedTo, onEdit, onDelete }: EquipmentCardProps) {
  const icon = typeIcons[equipment.type] || <Fan className="h-5 w-5" />;
  const typeLabel = typeLabels[equipment.type] || equipment.type;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{equipment.name}</h3>
              <p className="text-xs text-muted-foreground">{typeLabel}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(equipment)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(equipment.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {equipment.serial_number && (
          <p className="text-xs text-muted-foreground mb-3">
            S/N: {equipment.serial_number}
          </p>
        )}

        {equipment.is_available ? (
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            Available
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            {assignedTo ? `Assigned: ${assignedTo}` : 'In Use'}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
