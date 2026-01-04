import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Package } from 'lucide-react';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { EquipmentCreateDialog } from '@/components/equipment/EquipmentCreateDialog';
import {
  useEquipment,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
} from '@/hooks/useEquipment';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Tables } from '@/integrations/supabase/types';

type Equipment = Tables<'equipment'>;

export default function EquipmentPage() {
  const [filter, setFilter] = useState<'all' | 'available' | 'assigned'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEquipment, setEditEquipment] = useState<Equipment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: equipment = [], isLoading } = useEquipment();
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const deleteEquipment = useDeleteEquipment();

  const filteredEquipment = equipment.filter((item) => {
    if (filter === 'available') return item.is_available;
    if (filter === 'assigned') return !item.is_available;
    return true;
  });

  const handleSubmit = (data: { name: string; type: string; serialNumber?: string }) => {
    if (editEquipment) {
      updateEquipment.mutate({ id: editEquipment.id, ...data }, {
        onSuccess: () => {
          setDialogOpen(false);
          setEditEquipment(null);
        },
      });
    } else {
      createEquipment.mutate(data, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleEdit = (item: Equipment) => {
    setEditEquipment(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteEquipment.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const counts = {
    all: equipment.length,
    available: equipment.filter((e) => e.is_available).length,
    assigned: equipment.filter((e) => !e.is_available).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipment</h1>
          <p className="text-muted-foreground">
            Track dehumidifiers, air movers, and HEPA units
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="available">Available ({counts.available})</TabsTrigger>
          <TabsTrigger value="assigned">Assigned ({counts.assigned})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'all'
                  ? 'No Equipment Yet'
                  : filter === 'available'
                  ? 'No Available Equipment'
                  : 'No Assigned Equipment'}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                {filter === 'all'
                  ? 'Add your first piece of equipment to start tracking inventory.'
                  : filter === 'available'
                  ? 'All equipment is currently assigned to jobs.'
                  : 'No equipment has been assigned to jobs yet.'}
              </p>
              {filter === 'all' && (
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Equipment
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEquipment.map((item) => (
                <EquipmentCard
                  key={item.id}
                  equipment={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EquipmentCreateDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditEquipment(null);
        }}
        onSubmit={handleSubmit}
        isLoading={createEquipment.isPending || updateEquipment.isPending}
        editEquipment={editEquipment}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this equipment from your inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
