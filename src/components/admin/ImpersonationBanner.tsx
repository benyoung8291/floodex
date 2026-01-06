import { Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function ImpersonationBanner() {
  const { impersonatedTenantName, stopImpersonation } = useAuth();
  const navigate = useNavigate();

  const handleExit = () => {
    stopImpersonation();
    navigate('/admin/tenants');
  };

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-amber-950">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">
            Viewing as <strong>{impersonatedTenantName}</strong>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExit}
          className="h-7 text-amber-950 hover:bg-amber-600 hover:text-amber-950"
        >
          <X className="w-4 h-4 mr-1" />
          Exit
        </Button>
      </div>
    </div>
  );
}
