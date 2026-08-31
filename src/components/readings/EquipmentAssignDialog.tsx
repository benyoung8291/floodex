import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Fan, Droplets, Wind, X, Plus } from 'lucide-react';
import { EquipmentCreateDialog } from '@/components/equipment/EquipmentCreateDialog';
import { useCreateEquipment, useEquipment } from '@/hooks/useEquipment';
import type { Tables } from '@/integrations/supabase/types';

type Equipment = Tables<'equipment'>;
type EquipmentAssignment = Tables<'equipment_assignments'>;

interface EquipmentAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chamberName: string;
  chamberId: string;
  jobId: string;
  availableEquipment: Equipment[];
  currentAssignments: (EquipmentAssignment & { equipment: Equipment })[];
  onAssign: (equipmentId: string) => void;
  onUnassign: (assignmentId: string, equipmentId: string) => void;
  isLoading?: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  dehumidifier: <Droplets className="h-4 w-4" />,
  air_mover: <Fan className="h-4 w-4" />,
  hepa_unit: <Wind className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  dehumidifier: 'Dehumidifier',
  air_mover: 'Air Mover',
  hepa_unit: 'HEPA Unit',
};

export function EquipmentAssignDialog({
  open,
  onOpenChange,
  chamberName,
  chamberId,
  availableEquipment,
  currentAssignments,
  onAssign,
  onUnassign,
  isLoading,
}: EquipmentAssignDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const createEquipment = useCreateEquipment();
  const { data: inventory = [] } = useEquipment();

  const chamberAssignments = currentAssignments.filter(a => a.chamber_id === chamberId);
  const assignedIds = useMemo(
    () => new Set(currentAssignments.map(a => a.equipment_id)),
    [currentAssignments]
  );

  // Prefer live inventory so units just added on the Equipment page (or here) appear.
  // Treat unassigned-on-this-job + available as assignable; also include parent list.
  const assignableEquipment = useMemo(() => {
    const pool = inventory.length > 0 ? inventory : availableEquipment;
    const byId = new Map<string, Equipment>();
    for (const item of pool) byId.set(item.id, item);
    for (const item of availableEquipment) byId.set(item.id, item);
    return Array.from(byId.values()).filter((eq) => !assignedIds.has(eq.id));
  }, [inventory, availableEquipment, assignedIds]);

  const handleToggle = (equipmentId: string) => {
    setSelectedIds(prev =>
      prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const handleAssignSelected = () => {
    selectedIds.forEach(id => onAssign(id));
    setSelectedIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Equipment</DialogTitle>
          <DialogDescription>{chamberName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {chamberAssignments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Currently Assigned</p>
              <div className="space-y-2">
                {chamberAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-primary">
                        {typeIcons[assignment.equipment.type] ?? <Fan className="h-4 w-4" />}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{assignment.equipment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {typeLabels[assignment.equipment.type] || assignment.equipment.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onUnassign(assignment.id, assignment.equipment_id)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Available Equipment</p>
            {assignableEquipment.length === 0 ? (
              <div className="py-4 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  No available equipment. Add a unit to assign it to this chamber.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add equipment
                </Button>
              </div>
            ) : (
              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {assignableEquipment.map((equipment) => (
                    <label
                      key={equipment.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedIds.includes(equipment.id)}
                        onCheckedChange={() => handleToggle(equipment.id)}
                      />
                      <span className="text-primary">
                        {typeIcons[equipment.type] ?? <Fan className="h-4 w-4" />}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{equipment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {typeLabels[equipment.type] || equipment.type}
                          {equipment.serial_number && ` • ${equipment.serial_number}`}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {assignableEquipment.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add new
              </Button>
            )}
            {selectedIds.length > 0 && (
              <Button onClick={handleAssignSelected} disabled={isLoading}>
                Assign {selectedIds.length} Item{selectedIds.length > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      <EquipmentCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isLoading={createEquipment.isPending}
        onSubmit={(data) => {
          createEquipment.mutate(data, {
            onSuccess: (created) => {
              setCreateOpen(false);
              if (created?.id) {
                setSelectedIds((prev) =>
                  prev.includes(created.id) ? prev : [...prev, created.id]
                );
              }
            },
          });
        }}
      />
    </Dialog>
  );
}
