import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Droplets } from 'lucide-react';

export function MarketingNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/compare', label: 'Compare' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-4 z-50 mx-4 md:mx-8 mt-4 flex items-center justify-between px-3 py-2 bg-[hsl(37,30%,94%)]/80 backdrop-blur-xl rounded-full border border-[hsl(260,12%,82%)]/60 shadow-sm">
      <Link to="/" className="flex items-center gap-2 text-lg font-black tracking-tight no-underline text-[hsl(260,20%,16%)] pl-2">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black tracking-tight">
          <Droplets className="w-4 h-4" />
        </div>
        Flood<span className="text-primary">Ex</span>
      </Link>
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="text-sm font-semibold text-[hsl(260,20%,16%)]/70 no-underline hover:text-[hsl(260,20%,16%)] px-4 py-2 rounded-full hover:bg-[hsl(260,20%,16%)]/5 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Link to="/auth" className="hidden md:block">
          <Button variant="ghost" className="rounded-full text-sm font-semibold text-[hsl(260,20%,16%)]/70 hover:text-[hsl(260,20%,16%)]">Log in</Button>
        </Link>
        <Link to="/auth?tab=signup" className="hidden md:block">
          <Button className="rounded-full text-sm shadow-none border-none bg-primary text-white font-extrabold hover:opacity-85">Start free trial</Button>
        </Link>
        <button
          className="md:hidden p-2 text-[hsl(260,20%,16%)]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 mx-0 bg-[hsl(37,30%,94%)]/95 backdrop-blur-xl rounded-3xl border border-[hsl(260,12%,82%)]/60 shadow-lg p-4 md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block py-3 px-4 rounded-xl text-base font-semibold text-[hsl(260,20%,16%)]/70 hover:bg-[hsl(260,20%,16%)]/5 transition-colors no-underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[hsl(260,12%,82%)]/40 space-y-2">
            <Link to="/auth">
              <Button variant="outline" className="w-full rounded-full">Log in</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button className="w-full rounded-full bg-primary text-white font-extrabold">Start free trial</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
