import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Shield, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMembers, useUpdateMemberRole, useRemoveTeamMember, type TeamMember } from '@/hooks/useTeamMembers';
import { useTeamInvitations, useRevokeInvitation, useResendInvitation, type TeamInvitation } from '@/hooks/useTeamInvitations';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { PendingInvitationCard } from '@/components/team/PendingInvitationCard';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { ChangeRoleDialog } from '@/components/team/ChangeRoleDialog';
import { RemoveMemberDialog } from '@/components/team/RemoveMemberDialog';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export default function Team() {
  const { user, isTenantAdmin } = useAuth();
  const { data: members, isLoading: membersLoading } = useTeamMembers();
  const { data: invitations, isLoading: invitationsLoading } = useTeamInvitations();
  
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveTeamMember();
  const revokeInvitation = useRevokeInvitation();
  const resendInvitation = useResendInvitation();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [changeRoleMember, setChangeRoleMember] = useState<TeamMember | null>(null);
  const [removeMemberTarget, setRemoveMemberTarget] = useState<TeamMember | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'technician' | 'supervisor'>('all');

  // Filter members by role
  const filteredMembers = members?.filter(member => {
    if (roleFilter === 'all') return true;
    return member.role === roleFilter;
  });

  const handleChangeRole = (newRole: AppRole) => {
    if (changeRoleMember) {
      updateRole.mutate(
        { userId: changeRoleMember.id, newRole },
        { onSuccess: () => setChangeRoleMember(null) }
      );
    }
  };

  const handleRemoveMember = () => {
    if (removeMemberTarget) {
      removeMember.mutate(
        removeMemberTarget.id,
        { onSuccess: () => setRemoveMemberTarget(null) }
      );
    }
  };

  const handleCopyLink = async (invitation: TeamInvitation) => {
    const link = `${window.location.origin}/auth?invite=${invitation.token}`;
    await navigator.clipboard.writeText(link);
    toast.success('Invitation link copied');
  };

  if (!isTenantAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">View your team members</p>
        </div>

        <Card>
          <CardContent className="py-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Team Members</h3>
            {membersLoading ? (
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
            ) : (
              <div className="space-y-2 max-w-md mx-auto mt-4">
                {members?.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {member.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{member.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{member.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Invite and manage your team members</p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-secondary">
                <Shield className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {members?.filter(m => m.role === 'supervisor').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Supervisors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-muted">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {members?.filter(m => m.role === 'technician').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Technicians</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage roles and access for your team</CardDescription>
            </div>
            <Tabs value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="supervisor">Supervisors</TabsTrigger>
                <TabsTrigger value="technician">Technicians</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMembers?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers?.map(member => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  currentUserId={user?.id || ''}
                  onChangeRole={setChangeRoleMember}
                  onRemove={setRemoveMemberTarget}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Invitations that haven't been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map(invitation => (
                <PendingInvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onRevoke={(inv) => revokeInvitation.mutate(inv.id)}
                  onResend={(inv) => resendInvitation.mutate(inv)}
                  onCopyLink={handleCopyLink}
                  isRevoking={revokeInvitation.isPending}
                  isResending={resendInvitation.isPending}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      <ChangeRoleDialog
        member={changeRoleMember}
        open={!!changeRoleMember}
        onOpenChange={(open) => !open && setChangeRoleMember(null)}
        onConfirm={handleChangeRole}
        isLoading={updateRole.isPending}
      />

      <RemoveMemberDialog
        member={removeMemberTarget}
        open={!!removeMemberTarget}
        onOpenChange={(open) => !open && setRemoveMemberTarget(null)}
        onConfirm={handleRemoveMember}
        isLoading={removeMember.isPending}
      />
    </div>
  );
}
