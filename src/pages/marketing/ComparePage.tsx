import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { SEOHead, generateBreadcrumbData } from '@/components/marketing/SEOHead';
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/marketing/AnimateIn';
import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, DollarSign, Smartphone, Clock, Shield, Users } from 'lucide-react';

const features = [
  { name: 'Mobile-first design', category: 'Core Documentation' },
  { name: 'Moisture tracking with auto calculations', category: 'Core Documentation' },
  { name: 'Photo documentation', category: 'Core Documentation' },
  { name: 'Photo annotations', category: 'Core Documentation' },
  { name: 'Built-in floor plans (mud maps)', category: 'Core Documentation' },
  { name: 'Equipment tracking', category: 'Core Documentation' },
  { name: 'Work logging', category: 'Core Documentation' },
  { name: 'Damage assessments', category: 'Core Documentation' },
  { name: 'One-click PDF reports', category: 'Reporting' },
  { name: 'Insurance-compliant format', category: 'Reporting' },
  { name: 'Custom company branding', category: 'Reporting' },
  { name: 'Digital signatures', category: 'Reporting' },
  { name: 'Easy learning curve', category: 'Usability' },
  { name: 'Team collaboration', category: 'Usability' },
  { name: 'Free tier available', category: 'Pricing' },
  { name: 'Transparent pricing', category: 'Pricing' },
  { name: 'No long-term contracts', category: 'Pricing' },
];

const competitors = [
  { name: 'FloodEx', isHighlighted: true, features: Object.fromEntries(features.map(f => [f.name, true])) },
  {
    name: 'Encircle',
    features: {
      'Mobile-first design': true, 'Moisture tracking with auto calculations': true,
      'Photo documentation': true, 'Photo annotations': true,
      'Built-in floor plans (mud maps)': false, 'Equipment tracking': true,
      'Work logging': true, 'Damage assessments': true,
      'One-click PDF reports': true, 'Insurance-compliant format': true,
      'Custom company branding': true, 'Digital signatures': true,
      'Easy learning curve': 'partial', 'Team collaboration': true,
      'Free tier available': false, 'Transparent pricing': false,
      'No long-term contracts': false,
    },
  },
  {
    name: 'Xactimate',
    features: {
      'Mobile-first design': false, 'Moisture tracking with auto calculations': 'partial',
      'Photo documentation': true, 'Photo annotations': 'partial',
      'Built-in floor plans (mud maps)': true, 'Equipment tracking': 'partial',
      'Work logging': false, 'Damage assessments': true,
      'One-click PDF reports': 'partial', 'Insurance-compliant format': true,
      'Custom company branding': true, 'Digital signatures': true,
      'Easy learning curve': false, 'Team collaboration': true,
      'Free tier available': false, 'Transparent pricing': false,
      'No long-term contracts': false,
    },
  },
  {
    name: 'DASH',
    features: {
      'Mobile-first design': true, 'Moisture tracking with auto calculations': false,
      'Photo documentation': true, 'Photo annotations': 'partial',
      'Built-in floor plans (mud maps)': false, 'Equipment tracking': 'partial',
      'Work logging': true, 'Damage assessments': 'partial',
      'One-click PDF reports': true, 'Insurance-compliant format': 'partial',
      'Custom company branding': true, 'Digital signatures': true,
      'Easy learning curve': true, 'Team collaboration': true,
      'Free tier available': false, 'Transparent pricing': true,
      'No long-term contracts': true,
    },
  },
];

const differentiators = [
  { icon: Zap, title: 'Purpose-Built', desc: 'Not a generic contractor tool — every feature designed for water damage documentation.', bg: 'bg-primary/5' },
  { icon: Smartphone, title: 'Field-First', desc: 'Built for mobile use in the field, not desktop-only office software.', bg: 'bg-accent/5' },
  { icon: Clock, title: 'Instant Reports', desc: 'Generate insurance-ready PDF reports in one click, not hours.', bg: 'bg-primary/5' },
  { icon: DollarSign, title: 'Transparent Pricing', desc: "Know exactly what you'll pay. No surprise fees or sales calls.", bg: 'bg-accent/5' },
  { icon: Shield, title: 'Insurance Compliant', desc: 'Reports meet insurance documentation standards out of the box.', bg: 'bg-white' },
  { icon: Users, title: 'Free to Start', desc: 'Try everything with our free tier. No credit card, no commitment.', bg: 'bg-secondary' },
];

export default function ComparePage() {
  return (
    <MarketingLayout>
      <SEOHead
        title="FloodEx vs Encircle vs Xactimate vs DASH – Restoration Software Comparison 2026"
        description="Compare FloodEx with Encircle, Xactimate, and DASH. Feature-by-feature comparison of water damage restoration software. See why FloodEx offers more value with transparent pricing and a free tier."
        keywords="FloodEx vs Encircle, FloodEx vs Xactimate, FloodEx vs DASH, restoration software comparison, water damage software comparison, best restoration software 2026, Encircle alternative, Xactimate alternative"
        canonicalPath="/compare"
        structuredData={generateBreadcrumbData([
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/compare' },
        ])}
      />
      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">Software comparison</div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} className="text-[clamp(44px,7vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-foreground max-w-[850px] mb-7">
          How FloodEx compares to{' '}
          <span className="bg-accent text-white px-3 py-1 inline-block rounded-xl -rotate-1 my-1">other tools</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[clamp(16px,1.8vw,20px)] text-muted-foreground max-w-[540px] leading-[1.7] font-medium mb-12">
          See why restoration professionals choose FloodEx for faster documentation and simpler pricing.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.5 }} className="flex items-center gap-3 flex-wrap">
          <Link to="/auth?tab=signup">
            <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
          </Link>
          <Link to="/features">
            <Button variant="outline" className="rounded-full border-border/60 text-foreground font-bold text-base py-4 px-8 hover:bg-secondary">View all features</Button>
          </Link>
        </motion.div>
      </section>

      {/* Comparison Table */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">Feature-by-feature comparison</h2>
          </AnimateIn>
          <ComparisonTable features={features} competitors={competitors} />
        </div>
      </section>

      <div className="py-4" />

      {/* Why Switch */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between mb-12 gap-8">
          <AnimateIn>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground max-w-[340px]">
              Why teams<br />switch to<br />FloodEx
            </h2>
          </AnimateIn>
          <AnimateIn>
            <p className="text-[15px] text-muted-foreground max-w-[320px] md:text-right font-medium leading-[1.7] mt-2">
              Purpose-built for restoration, not repurposed from another industry.
            </p>
          </AnimateIn>
        </div>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {differentiators.map((d) => (
            <StaggerItem key={d.title}>
              <div className={`${d.bg} border border-border/40 rounded-3xl p-7 flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-lg h-full`}>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <d.icon className="w-6 h-6 text-foreground" />
                </div>
                <h4 className="text-[17px] font-extrabold tracking-tight text-foreground">{d.title}</h4>
                <p className="text-[13px] text-foreground/60 leading-[1.6] font-medium">{d.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <div className="mx-4 md:mx-8 my-8 rounded-[32px] bg-foreground px-6 md:px-12 py-20 md:py-28 text-center">
        <AnimateIn>
          <h2 className="text-[clamp(34px,5vw,60px)] font-black leading-[1.0] tracking-[-0.04em] text-white mb-4">
            Ready to see the<br /><span className="text-accent">difference?</span>
          </h2>
          <p className="text-[17px] text-white/40 font-medium mb-12 max-w-lg mx-auto">
            Start your free trial today. No credit card required.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/auth?tab=signup">
              <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="rounded-full border-white/15 text-white/50 hover:bg-white/5 hover:text-white/70 text-base py-4 px-8">View pricing</Button>
            </Link>
          </div>
        </AnimateIn>
      </div>
    </MarketingLayout>
  );
}
