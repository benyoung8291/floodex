import { useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CostTemplateDialog } from './CostTemplateDialog';
import {
  useCostTemplates,
  useCreateCostTemplate,
  useUpdateCostTemplate,
  useDeleteCostTemplate,
  CostTemplate,
  COST_CATEGORIES,
  UNIT_TYPES,
} from '@/hooks/useCostTemplates';

export function CostTemplateList() {
  const { data: templates, isLoading } = useCostTemplates();
  const createTemplate = useCreateCostTemplate();
  const updateTemplate = useUpdateCostTemplate();
  const deleteTemplate = useDeleteCostTemplate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CostTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CostTemplate | null>(null);

  const handleCreate = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const handleEdit = (template: CostTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Omit<CostTemplate, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (editingTemplate) {
      updateTemplate.mutate(
        { id: editingTemplate.id, ...data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createTemplate.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTemplate.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  const getCategoryLabel = (value: string) =>
    COST_CATEGORIES.find((c) => c.value === value)?.label || value;

  const getUnitLabel = (value: string) =>
    UNIT_TYPES.find((u) => u.value === value)?.label || value;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Cost Item Templates
            </CardTitle>
            <CardDescription>
              Define reusable cost items that can be added to jobs
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </CardHeader>
        <CardContent>
          {templates && templates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Default Rate</TableHead>
                  <TableHead className="text-center">Auto-Add</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        {template.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryLabel(template.category)}</TableCell>
                    <TableCell>{getUnitLabel(template.unit_type)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(Number(template.default_rate))}
                    </TableCell>
                    <TableCell className="text-center">
                      {template.is_auto_added && (
                        <Badge variant="secondary">Auto</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={template.is_active ? 'default' : 'outline'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(template)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No cost templates yet</p>
              <p className="text-sm">
                Create templates for common cost items like equipment rental, labor rates, etc.
              </p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CostTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onSubmit={handleSubmit}
        isLoading={createTemplate.isPending || updateTemplate.isPending}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
              Existing job cost items using this template will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
