import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Mail, X, RefreshCw } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { TeamInvitation } from '@/hooks/useTeamInvitations';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface PendingInvitationCardProps {
  invitation: TeamInvitation;
  onRevoke: (invitation: TeamInvitation) => void;
  onResend: (invitation: TeamInvitation) => void;
  onCopyLink: (invitation: TeamInvitation) => void;
  isRevoking?: boolean;
  isResending?: boolean;
}

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  tenant_admin: 'Admin',
  supervisor: 'Supervisor',
  technician: 'Technician',
};

export function PendingInvitationCard({ 
  invitation, 
  onRevoke, 
  onResend, 
  onCopyLink,
  isRevoking,
  isResending,
}: PendingInvitationCardProps) {
  const expiresIn = formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true });
  const sentAgo = formatDistanceToNow(new Date(invitation.invited_at), { addSuffix: true });

  return (
    <div className="flex items-center justify-between p-4 border border-dashed rounded-lg bg-muted/30">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <Mail className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{invitation.email}</span>
            <Badge variant="outline">{roleLabels[invitation.role]}</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Sent {sentAgo}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Expires {expiresIn}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopyLink(invitation)}
        >
          Copy Link
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onResend(invitation)}
          disabled={isResending}
        >
          <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRevoke(invitation)}
          disabled={isRevoking}
          className="text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
