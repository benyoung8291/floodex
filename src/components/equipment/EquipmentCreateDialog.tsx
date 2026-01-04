import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Tables } from '@/integrations/supabase/types';

type Equipment = Tables<'equipment'>;

interface EquipmentCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; type: string; serialNumber?: string }) => void;
  isLoading?: boolean;
  editEquipment?: Equipment | null;
}

const equipmentTypes = [
  { value: 'dehumidifier', label: 'Dehumidifier' },
  { value: 'air_mover', label: 'Air Mover' },
  { value: 'hepa_unit', label: 'HEPA Unit' },
];

export function EquipmentCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  editEquipment,
}: EquipmentCreateDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('dehumidifier');
  const [serialNumber, setSerialNumber] = useState('');

  useEffect(() => {
    if (editEquipment) {
      setName(editEquipment.name);
      setType(editEquipment.type);
      setSerialNumber(editEquipment.serial_number || '');
    } else {
      setName('');
      setType('dehumidifier');
      setSerialNumber('');
    }
  }, [editEquipment, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSubmit({
      name: name.trim(),
      type,
      serialNumber: serialNumber.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editEquipment ? 'Edit Equipment' : 'Add Equipment'}</DialogTitle>
          <DialogDescription>
            {editEquipment 
              ? 'Update equipment details'
              : 'Add a new piece of equipment to your inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Air Mover #1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serial">Serial Number (optional)</Label>
            <Input
              id="serial"
              placeholder="e.g., SN-2024-001"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Saving...' : editEquipment ? 'Update' : 'Add Equipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
