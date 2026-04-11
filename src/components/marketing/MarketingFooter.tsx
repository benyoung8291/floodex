import { Link } from 'react-router-dom';
import floodexLogo from '@/assets/floodex-logo.png';

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-4 md:px-8 py-16 max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 no-underline mb-4">
            <img src={floodexLogo} alt="FloodEx flood restoration software" className="h-8 w-auto" />
          </Link>
          <p className="text-[12px] text-foreground/30 font-medium leading-[1.6] max-w-[200px]">
            Australia's purpose-built flood restoration software for water damage documentation and reporting.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-foreground/50 mb-4">Product</h4>
          <nav aria-label="Product links" className="flex flex-col gap-2">
            <Link to="/features" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Features</Link>
            <Link to="/pricing" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Pricing</Link>
            <Link to="/compare" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Compare</Link>
            <Link to="/moisture-tracking-software" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Moisture Tracking</Link>
            <Link to="/restoration-reporting-software" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Reporting</Link>
          </nav>
        </div>

        {/* Solutions */}
        <div>
          <h4 className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-foreground/50 mb-4">Solutions</h4>
          <nav aria-label="Solutions links" className="flex flex-col gap-2">
            <Link to="/water-damage-restoration-software" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Water Damage Software</Link>
            <Link to="/encircle-alternative" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Encircle Alternative</Link>
            <Link to="/auth?tab=signup" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Free Trial</Link>
          </nav>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-foreground/50 mb-4">Company</h4>
          <nav aria-label="Company links" className="flex flex-col gap-2">
            <Link to="/about" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">About</Link>
            <Link to="/contact" className="text-[13px] text-foreground/30 font-semibold no-underline hover:text-foreground/50 transition-colors">Contact</Link>
          </nav>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-[11px] text-foreground/20 font-medium">
          © {currentYear} Local Carpet Cleaning Pty Ltd · ABN 15 682 871 192 · Australian-built flood restoration software
        </div>
        <div className="text-[11px] text-foreground/20 font-medium">
          FloodEx — Document faster. Report smarter. Get paid quicker.
        </div>
      </div>
    </footer>
  );
}
