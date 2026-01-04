import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { DamageAssessment } from '@/hooks/useDamageAssessments';

interface DamageAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    areaName: string;
    materialType: string;
    isRestorable: boolean;
    status?: string;
    notes?: string;
  }) => void;
  editingAssessment?: DamageAssessment | null;
  isLoading?: boolean;
}

const materialTypes = [
  'Carpet',
  'Carpet Pad',
  'Hardwood Flooring',
  'Laminate Flooring',
  'Vinyl/LVP',
  'Tile',
  'Drywall',
  'Baseboard',
  'Insulation',
  'Ceiling',
  'Subfloor',
  'Furniture',
  'Cabinetry',
  'Other',
];

const statusOptions = [
  { value: 'pending', label: 'Pending Assessment' },
  { value: 'assessed', label: 'Assessed' },
  { value: 'completed', label: 'Remediation Complete' },
];

export function DamageAssessmentDialog({
  open,
  onOpenChange,
  onSubmit,
  editingAssessment,
  isLoading,
}: DamageAssessmentDialogProps) {
  const [areaName, setAreaName] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [isRestorable, setIsRestorable] = useState(true);
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingAssessment) {
      setAreaName(editingAssessment.area_name);
      setMaterialType(editingAssessment.material_type);
      setIsRestorable(editingAssessment.is_restorable);
      setStatus(editingAssessment.status || 'pending');
      setNotes(editingAssessment.notes || '');
    } else {
      setAreaName('');
      setMaterialType('');
      setIsRestorable(true);
      setStatus('pending');
      setNotes('');
    }
  }, [editingAssessment, open]);

  const handleSubmit = () => {
    if (!areaName.trim() || !materialType) return;
    
    onSubmit({
      areaName: areaName.trim(),
      materialType,
      isRestorable,
      status,
      notes: notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingAssessment ? 'Edit Damage Assessment' : 'Add Damage Assessment'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Area / Location</Label>
            <Input
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="e.g., Living Room, Kitchen Floor"
            />
          </div>

          <div className="space-y-2">
            <Label>Material Type</Label>
            <Select value={materialType} onValueChange={setMaterialType}>
              <SelectTrigger>
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <Label className="text-base">Restorable</Label>
              <p className="text-sm text-muted-foreground">
                Can this material be dried and restored?
              </p>
            </div>
            <Switch
              checked={isRestorable}
              onCheckedChange={setIsRestorable}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about the damage..."
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !areaName.trim() || !materialType}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingAssessment ? 'Update' : 'Add'} Assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
