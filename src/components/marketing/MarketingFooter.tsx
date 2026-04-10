import { Link } from 'react-router-dom';
import floodexLogo from '@/assets/floodex-logo.png';

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-4 md:px-8 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2">
        <img src={floodexLogo} alt="FloodEx" className="h-6 w-auto opacity-40" />
      </div>
      <div className="flex gap-6">
        <Link to="/features" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Features</Link>
        <Link to="/pricing" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Pricing</Link>
        <Link to="/contact" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Contact</Link>
      </div>
      <div className="text-xs text-foreground/25 font-medium">© {currentYear} Local Carpet Cleaning Pty Ltd · ABN 15 682 871 192</div>
    </footer>
  );
}
