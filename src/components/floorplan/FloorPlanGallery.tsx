import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Map } from 'lucide-react';
import { FloorPlanCard } from './FloorPlanCard';
import { FloorPlanEditor } from './FloorPlanEditor';
import {
  useJobFloorPlans,
  useCreateFloorPlan,
  useUpdateFloorPlan,
  useDeleteFloorPlan,
  FloorPlan,
} from '@/hooks/useFloorPlans';
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
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface FloorPlanGalleryProps {
  jobId: string;
}

export const FloorPlanGallery = ({ jobId }: FloorPlanGalleryProps) => {
  const { data: plans, isLoading } = useJobFloorPlans(jobId);
  const createMutation = useCreateFloorPlan();
  const updateMutation = useUpdateFloorPlan();
  const deleteMutation = useDeleteFloorPlan();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FloorPlan | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<FloorPlan | null>(null);

  const handleCreate = () => {
    setEditingPlan(null);
    setEditorOpen(true);
  };

  const handleEdit = (plan: FloorPlan) => {
    setEditingPlan(plan);
    setEditorOpen(true);
  };

  const handleDelete = (plan: FloorPlan) => {
    setPlanToDelete(plan);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;
    
    try {
      await deleteMutation.mutateAsync({ id: planToDelete.id, jobId });
      toast.success('Floor plan deleted');
    } catch (error) {
      toast.error('Failed to delete floor plan');
    } finally {
      setDeleteConfirmOpen(false);
      setPlanToDelete(null);
    }
  };

  const handleSave = async (data: {
    name: string;
    floor_number: number;
    canvas_data: object;
    thumbnail: Blob;
  }) => {
    if (editingPlan) {
      await updateMutation.mutateAsync({
        id: editingPlan.id,
        job_id: jobId,
        ...data,
      });
    } else {
      await createMutation.mutateAsync({
        job_id: jobId,
        ...data,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Floor Plans</h3>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Add Plan
        </Button>
      </div>

      {plans && plans.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <FloorPlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => handleEdit(plan)}
              onDelete={() => handleDelete(plan)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Map className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h4 className="font-medium text-muted-foreground mb-1">No floor plans yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Create a floor plan to document the property layout
          </p>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Create Floor Plan
          </Button>
        </div>
      )}

      <FloorPlanEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        jobId={jobId}
        existingPlan={editingPlan ? {
          id: editingPlan.id,
          name: editingPlan.name,
          floor_number: editingPlan.floor_number,
          canvas_data: editingPlan.canvas_data,
        } : undefined}
        onSave={handleSave}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Floor Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{planToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
