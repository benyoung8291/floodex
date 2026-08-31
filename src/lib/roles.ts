export type AppRole = 'super_admin' | 'tenant_admin' | 'supervisor' | 'technician';

const ROLE_RANK: AppRole[] = ['super_admin', 'tenant_admin', 'supervisor', 'technician'];

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  tenant_admin: 'Tenant Admin',
  supervisor: 'Supervisor',
  technician: 'Technician',
};

/** Highest-privilege role the user actually has. */
export function primaryRole(roles: readonly string[]): AppRole | null {
  return ROLE_RANK.find((role) => roles.includes(role)) ?? (roles[0] as AppRole | undefined) ?? null;
}

export function roleLabel(role: AppRole | string | null | undefined): string {
  if (!role) return 'User';
  return ROLE_LABELS[role as AppRole] ?? role.replace(/_/g, ' ');
}

export function displayNameFromUser(
  user: {
    email?: string | null;
    user_metadata?: { full_name?: string; fullName?: string };
  } | null,
  profileName?: string | null,
): string {
  const fromProfile = profileName?.trim();
  if (fromProfile) return fromProfile;
  const meta = user?.user_metadata;
  const name = meta?.full_name?.trim() || meta?.fullName?.trim();
  if (name) return name;
  if (user?.email) return user.email.split('@')[0];
  return 'User';
}

export function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
