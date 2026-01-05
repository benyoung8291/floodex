import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Shield, ShieldCheck, User, Crown } from 'lucide-react';
import { format } from 'date-fns';
import type { TeamMember } from '@/hooks/useTeamMembers';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface TeamMemberCardProps {
  member: TeamMember;
  currentUserId: string;
  onChangeRole: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
}

const roleConfig: Record<AppRole, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'outline' }> = {
  super_admin: { label: 'Super Admin', icon: <Crown className="h-3 w-3" />, variant: 'default' },
  tenant_admin: { label: 'Admin', icon: <ShieldCheck className="h-3 w-3" />, variant: 'default' },
  supervisor: { label: 'Supervisor', icon: <Shield className="h-3 w-3" />, variant: 'secondary' },
  technician: { label: 'Technician', icon: <User className="h-3 w-3" />, variant: 'outline' },
};

export function TeamMemberCard({ member, currentUserId, onChangeRole, onRemove }: TeamMemberCardProps) {
  const isCurrentUser = member.id === currentUserId;
  const isTenantAdmin = member.role === 'tenant_admin';
  const isSuperAdmin = member.role === 'super_admin';
  const canModify = !isCurrentUser && !isTenantAdmin && !isSuperAdmin;

  const initials = member.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const config = roleConfig[member.role];

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.full_name || 'Team member'} />}
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {member.full_name || 'Unknown'}
              {isCurrentUser && <span className="text-muted-foreground ml-1">(you)</span>}
            </span>
            <Badge variant={config.variant} className="gap-1">
              {config.icon}
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Joined {format(new Date(member.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {canModify && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onChangeRole(member)}>
              Change Role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onRemove(member)}
              className="text-destructive focus:text-destructive"
            >
              Remove from Team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
