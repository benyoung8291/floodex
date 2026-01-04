import { NavLink } from 'react-router-dom';
import { 
  Map, 
  ClipboardList, 
  Droplets, 
  Package, 
  Camera, 
  FileText, 
  Settings,
  Users,
  LayoutDashboard,
  Building2,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const technicianLinks = [
  { to: '/dashboard', icon: Map, label: 'Dashboard' },
  { to: '/jobs', icon: ClipboardList, label: 'Jobs' },
  { to: '/readings', icon: Droplets, label: 'Readings' },
  { to: '/equipment', icon: Package, label: 'Equipment' },
  { to: '/photos', icon: Camera, label: 'Photos' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

const tenantAdminLinks = [
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const superAdminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Admin' },
  { to: '/admin/tenants', icon: Building2, label: 'Tenants' },
  { to: '/admin/tiers', icon: CreditCard, label: 'Pricing Tiers' },
];

export function DesktopSidebar() {
  const { isSuperAdmin, isTenantAdmin } = useAuth();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Droplets className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">FloodEx</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {/* Main navigation */}
        <div className="px-3 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Field Work
          </p>
          {technicianLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Tenant Admin Links */}
        {isTenantAdmin && (
          <div className="px-3 mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Management
            </p>
            {tenantAdminLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Super Admin Links */}
        {isSuperAdmin && (
          <div className="px-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Platform Admin
            </p>
            {superAdminLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">FE</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              Field Tech
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Technician
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
