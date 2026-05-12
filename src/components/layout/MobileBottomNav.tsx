import { NavLink } from 'react-router-dom';
import { Map, ClipboardList, Droplets, Package, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Camera,
  FileText,
  Settings,
  Users,
  LayoutDashboard,
  Building2,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// 4 primary lifecycle items + More. The Capture FAB sits center on top.
const mainNavItems = [
  { to: '/dashboard', icon: Map, label: 'Today' },
  { to: '/jobs', icon: ClipboardList, label: 'Jobs' },
  { to: '/readings', icon: Droplets, label: 'Readings' },
  { to: '/equipment', icon: Package, label: 'Gear' },
];

export function MobileBottomNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSuperAdmin, isTenantAdmin, signOut } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-30">
      <div className="grid grid-cols-5 items-stretch h-16">
        {mainNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 px-1 py-2 touch-target transition-colors',
                'active:scale-95',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[11px] font-medium truncate max-w-full">{label}</span>
          </NavLink>
        ))}

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="More menu"
              className="flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-muted-foreground touch-target active:scale-95"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[11px] font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-2">
              <NavLink to="/photos" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                <Camera className="w-5 h-5" />
                <span>Photos</span>
              </NavLink>
              <NavLink to="/reports" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </NavLink>

              {isTenantAdmin && (
                <>
                  <div className="border-t border-border my-2" />
                  <NavLink to="/team" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                    <Users className="w-5 h-5" />
                    <span>Team</span>
                  </NavLink>
                  <NavLink to="/billing" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                    <CreditCard className="w-5 h-5" />
                    <span>Billing</span>
                  </NavLink>
                </>
              )}

              {isSuperAdmin && (
                <>
                  <div className="border-t border-border my-2" />
                  <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Platform Admin</span>
                  </NavLink>
                  <NavLink to="/admin/tenants" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                    <Building2 className="w-5 h-5" />
                    <span>Tenants</span>
                  </NavLink>
                </>
              )}

              <div className="border-t border-border my-2" />
              <NavLink to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </NavLink>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-4 py-3 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
