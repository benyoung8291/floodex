import { Wifi, WifiOff, Bell, Search } from 'lucide-react';
import floodexLogo from '@/assets/floodex-logo.png';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopHeaderProps {
  onOpenSearch?: () => void;
}

export function TopHeader({ onOpenSearch }: TopHeaderProps = {}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-border bg-card/50 backdrop-blur-sm safe-top">
      {/* Mobile Logo */}
      <div className="md:hidden flex items-center">
        <img src={floodexLogo} alt="FloodEx" className="h-10 w-auto" />
      </div>

      {/* Search trigger (desktop wide, mobile icon-only) */}
      <button
        onClick={onOpenSearch}
        className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-4 h-9 px-3 rounded-md border border-border bg-background/60 text-sm text-muted-foreground hover:bg-accent transition-colors"
        aria-label="Open search (Ctrl+K)"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search jobs, customers, actions…</span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">⌘K</kbd>
      </button>
      <div className="md:hidden flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenSearch} aria-label="Search">
          <Search className="w-5 h-5" />
        </Button>
        {/* Online/Offline Status */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
            isOnline
              ? 'bg-success/20 text-success'
              : 'bg-destructive/20 text-destructive'
          }`}
        >
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Bell className="w-5 h-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {roles[0]?.replace('_', ' ') || 'User'}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
