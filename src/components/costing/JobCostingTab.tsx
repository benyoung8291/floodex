import { useState } from 'react';
import { Plus, Pencil, Trash2, Package, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Skeleton } from '@/components/ui/skeleton';
import { JobCostItemDialog } from './JobCostItemDialog';
import { JobCostSummaryCard } from './JobCostSummary';
import {
  useJobCostItems,
  useJobCostSummary,
  useCreateJobCostItem,
  useUpdateJobCostItem,
  useDeleteJobCostItem,
  useApplyTemplateToJob,
  JobCostItem,
} from '@/hooks/useJobCostItems';
import { useActiveCostTemplates, COST_CATEGORIES, UNIT_TYPES } from '@/hooks/useCostTemplates';

interface JobCostingTabProps {
  jobId: string;
}

export function JobCostingTab({ jobId }: JobCostingTabProps) {
  const { data: items, isLoading } = useJobCostItems(jobId);
  const summary = useJobCostSummary(jobId);
  const { data: templates } = useActiveCostTemplates();
  
  const createItem = useCreateJobCostItem();
  const updateItem = useUpdateJobCostItem();
  const deleteItem = useDeleteJobCostItem();
  const applyTemplate = useApplyTemplateToJob();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JobCostItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobCostItem | null>(null);

  const handleAddCustom = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: JobCostItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updateItem.mutate(
        { id: editingItem.id, ...data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createItem.mutate(
        { job_id: jobId, ...data },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteItem.mutate(
        { id: deleteTarget.id, jobId },
        { onSuccess: () => setDeleteTarget(null) }
      );
    }
  };

  const handleApplyTemplate = (template: any) => {
    applyTemplate.mutate({ jobId, template });
  };

  const getCategoryLabel = (value: string) =>
    COST_CATEGORIES.find((c) => c.value === value)?.label || value;

  const getUnitLabel = (value: string) =>
    UNIT_TYPES.find((u) => u.value === value)?.label || value;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Group items by category
  const groupedItems = items?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, JobCostItem[]>) || {};

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Cost Item
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>From Template</DropdownMenuLabel>
            {templates && templates.length > 0 ? (
              templates.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => handleApplyTemplate(template)}
                >
                  <div className="flex justify-between w-full">
                    <span>{template.name}</span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {formatCurrency(Number(template.default_rate))}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No templates available</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAddCustom}>
              <FileText className="h-4 w-4 mr-2" />
              Custom Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cost Items List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cost Items</CardTitle>
              <CardDescription>
                Itemized costs for this job
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items && items.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([category, categoryItems]) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        {getCategoryLabel(category)}
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span>{item.name}</span>
                                  {!item.is_billable && (
                                    <Badge variant="outline" className="text-xs">
                                      Non-billable
                                    </Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {item.description}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {Number(item.quantity)} {getUnitLabel(item.unit_type).toLowerCase()}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(Number(item.unit_rate))}
                              </TableCell>
                              <TableCell className="text-right font-mono font-medium">
                                {formatCurrency(Number(item.total_amount))}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(item)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteTarget(item)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No cost items yet</p>
                  <p className="text-sm">
                    Add cost items to track expenses for this job
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <JobCostSummaryCard summary={summary} />
        </div>
      </div>

      <JobCostItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSubmit={handleSubmit}
        isLoading={createItem.isPending || updateItem.isPending}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Cost Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
