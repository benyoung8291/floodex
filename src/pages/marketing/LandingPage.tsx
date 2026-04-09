import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FeatureCard } from '@/components/marketing/FeatureCard';
import { PricingCard } from '@/components/marketing/PricingCard';
import { AppMockup } from '@/components/marketing/AppMockup';
import { FAQAccordion } from '@/components/marketing/FAQAccordion';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';
import {
  Droplets,
  Camera,
  FileText,
  Users,
  Activity,
  Thermometer,
  ClipboardCheck,
  Calculator,
  ArrowRight,
  Shield,
  Zap,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const { data: tiers, isLoading: tiersLoading } = useSubscriptionTiers();
  const sortedTiers = tiers?.sort((a, b) => a.monthly_price - b.monthly_price) || [];

  return (
    <MarketingLayout>
      {/* Hero */}
      <HeroSection />

      {/* Problem / Solution */}
      <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-b from-background to-card" aria-labelledby="problem-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="problem-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Stop Wrestling with{' '}
              <span className="text-destructive line-through opacity-60">Paper & Spreadsheets</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Restoration pros waste hours on documentation. FloodEx puts everything in one place—accessible from any device.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            <div className="space-y-4 sm:space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-destructive/5 border border-destructive/20">
                <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                  <span className="text-xl">📋</span> The Old Way
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2"><span className="text-destructive">✕</span> Paper forms lost in the field</li>
                  <li className="flex items-center gap-2"><span className="text-destructive">✕</span> Manual calculations with errors</li>
                  <li className="flex items-center gap-2"><span className="text-destructive">✕</span> Hours creating reports</li>
                  <li className="flex items-center gap-2"><span className="text-destructive">✕</span> No real-time visibility</li>
                </ul>
              </div>
              <div className="p-5 sm:p-6 rounded-2xl bg-success/5 border border-success/20">
                <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
                  <span className="text-xl">📱</span> The FloodEx Way
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2"><span className="text-success">✓</span> Digital capture in the field</li>
                  <li className="flex items-center gap-2"><span className="text-success">✓</span> Auto-calculated g/kg & metrics</li>
                  <li className="flex items-center gap-2"><span className="text-success">✓</span> One-click PDF reports</li>
                  <li className="flex items-center gap-2"><span className="text-success">✓</span> Real-time team updates</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 opacity-50" />
                <AppMockup variant="readings" className="relative z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 lg:py-32" id="features" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Features
            </span>
            <h2 id="features-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need in the Field
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built for water damage restoration — from first inspection to final report.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <FeatureCard icon={Droplets} title="Moisture Tracking" description="Log readings by chamber with automatic g/kg calculations and drying trend charts." delay={0} />
            <FeatureCard icon={Camera} title="Photo Documentation" description="Capture, annotate, and organise photos. Add arrows, text, and damage markers." delay={0.05} />
            <FeatureCard icon={FileText} title="Professional Reports" description="Generate polished PDF reports with one click. Customisable with your branding." delay={0.1} />
            <FeatureCard icon={Users} title="Team Collaboration" description="Invite technicians with role-based access. See updates in real-time." delay={0.15} />
            <FeatureCard icon={Activity} title="Equipment Tracking" description="Assign dehumidifiers, air movers, and sensors to jobs. Track runtime and costs." delay={0.2} />
            <FeatureCard icon={Thermometer} title="Psychrometric Data" description="Automatic dew point, vapour pressure, and specific humidity calculations." delay={0.25} />
            <FeatureCard icon={ClipboardCheck} title="Digital Forms" description="Complete safety checks, work authorisations, and FNOL forms digitally." delay={0.3} />
            <FeatureCard icon={Calculator} title="Cost Estimates" description="Create professional estimates with templates. Track costs per job." delay={0.35} />
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <Link to="/features">
              <Button variant="outline" size="lg" className="group">
                Explore All Features
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why FloodEx */}
      <section className="py-16 sm:py-20 lg:py-32 bg-card" aria-labelledby="why-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="why-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Why Restoration Teams Choose FloodEx
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Zap, title: 'Built for Restoration', desc: 'Not a generic tool — every feature is designed for flood & water damage workflows.' },
              { icon: Shield, title: 'IICRC Compliant', desc: 'Reports meet industry documentation standards right out of the box.' },
              { icon: Camera, title: 'Field-First Design', desc: 'Mobile-optimised for use on-site with gloves, in low light, and on the go.' },
              { icon: Thermometer, title: 'Auto Calculations', desc: 'GPP, dew point, vapour pressure — calculated automatically from readings.' },
              { icon: FileText, title: 'One-Click Reports', desc: 'Generate comprehensive, branded PDF reports in seconds — not hours.' },
              { icon: Users, title: 'Team Management', desc: 'Role-based access, job sharing, and real-time collaboration across your crew.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 rounded-xl border border-border bg-background hover:border-primary/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 sm:py-20 lg:py-32" id="pricing" aria-labelledby="pricing-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Pricing
            </span>
            <h2 id="pricing-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
          </div>

          {tiersLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
              {sortedTiers.map((tier, index) => (
                <PricingCard
                  key={tier.id}
                  name={tier.name}
                  price={tier.monthly_price}
                  jobsIncluded={tier.jobs_included}
                  readingsIncluded={tier.readings_included}
                  overagePerJob={tier.overage_price_per_job}
                  overagePerReading={tier.overage_price_per_reading}
                  isFree={tier.is_free_tier}
                  isPopular={tier.name.toLowerCase() === 'pro'}
                  delay={index * 0.1}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/pricing">
              <Button variant="link" className="text-primary">View full pricing details →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 lg:py-32 bg-card" aria-labelledby="faq-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 id="faq-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about FloodEx.
            </p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your{' '}
            <span className="text-primary">Restoration Business?</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join restoration professionals who document faster, report smarter, and get paid quicker with FloodEx.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=signup">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-10 py-6 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
