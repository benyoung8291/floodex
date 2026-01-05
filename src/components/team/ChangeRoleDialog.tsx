import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import type { TeamMember } from '@/hooks/useTeamMembers';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ChangeRoleDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newRole: AppRole) => void;
  isLoading?: boolean;
}

export function ChangeRoleDialog({ 
  member, 
  open, 
  onOpenChange, 
  onConfirm,
  isLoading 
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<AppRole>('technician');

  useEffect(() => {
    if (member) {
      setSelectedRole(member.role);
    }
  }, [member]);

  const handleConfirm = () => {
    onConfirm(selectedRole);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Update the role for {member?.full_name || 'this team member'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>New Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technician">
                  <div>
                    <div className="font-medium">Technician</div>
                    <div className="text-xs text-muted-foreground">
                      Can create jobs, take readings, capture photos
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="supervisor">
                  <div>
                    <div className="font-medium">Supervisor</div>
                    <div className="text-xs text-muted-foreground">
                      All technician permissions + safety overrides
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || selectedRole === member?.role}>
            {isLoading ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
