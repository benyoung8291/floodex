import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-4 md:px-8 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-base font-black text-[hsl(260,20%,16%)]/40 tracking-tight">
        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center">
          <Droplets className="w-3.5 h-3.5" />
        </div>
        FloodEx
      </div>
      <div className="flex gap-6">
        <Link to="/features" className="text-[13px] text-[hsl(260,20%,16%)]/30 font-semibold no-underline hover:text-[hsl(260,20%,16%)]/50 transition-colors">Features</Link>
        <Link to="/pricing" className="text-[13px] text-[hsl(260,20%,16%)]/30 font-semibold no-underline hover:text-[hsl(260,20%,16%)]/50 transition-colors">Pricing</Link>
        <Link to="/contact" className="text-[13px] text-[hsl(260,20%,16%)]/30 font-semibold no-underline hover:text-[hsl(260,20%,16%)]/50 transition-colors">Contact</Link>
      </div>
      <div className="text-xs text-[hsl(260,20%,16%)]/25 font-medium">© {currentYear} Local Carpet Cleaning Pty Ltd · ABN 15 682 871 192</div>
    </footer>
  );
}
