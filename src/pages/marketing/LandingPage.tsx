import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FeatureCard } from '@/components/marketing/FeatureCard';
import { PricingCard } from '@/components/marketing/PricingCard';
import { TestimonialCarousel } from '@/components/marketing/TestimonialCarousel';
import { StatsCounter } from '@/components/marketing/StatsCounter';
import { AppMockup } from '@/components/marketing/AppMockup';
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
  Clock,
  Building2,
} from 'lucide-react';

export default function LandingPage() {
  const { data: tiers, isLoading: tiersLoading } = useSubscriptionTiers();

  // Sort tiers by price for display
  const sortedTiers = tiers?.sort((a, b) => a.monthly_price - b.monthly_price) || [];

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <HeroSection />

      {/* Problem/Solution Section with App Preview */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Stop Wrestling with{' '}
              <span className="text-destructive line-through opacity-60">Paper & Spreadsheets</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Restoration pros waste hours on documentation. FloodEx puts everything in one place—
              accessible from any device, anywhere.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Before/After comparison */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20">
                <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                  <span className="text-2xl">📋</span> The Old Way
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2"><span className="text-destructive">✕</span> Paper forms lost in the field</li>
                  <li className="flex items-center gap-2"><span className="text-destructive">✕</span> Manual calculations with errors</li>
                  <li className="flex items-center gap-2"><span className="text-destructive">✕</span> Hours creating reports</li>
                  <li className="flex items-center gap-2"><span className="text-destructive">✕</span> No real-time visibility</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-success/5 border border-success/20">
                <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
                  <span className="text-2xl">📱</span> The FloodEx Way
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2"><span className="text-success">✓</span> Digital capture in the field</li>
                  <li className="flex items-center gap-2"><span className="text-success">✓</span> Auto-calculated g/kg & metrics</li>
                  <li className="flex items-center gap-2"><span className="text-success">✓</span> One-click PDF reports</li>
                  <li className="flex items-center gap-2"><span className="text-success">✓</span> Real-time team updates</li>
                </ul>
              </div>
            </div>

            {/* App mockup preview */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 opacity-50" />
                <AppMockup variant="readings" className="relative z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need in the Field
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built for water damage restoration—from first inspection to final report.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Droplets}
              title="Moisture Tracking"
              description="Log readings by chamber with automatic g/kg calculations and drying trend charts."
              delay={0}
            />
            <FeatureCard
              icon={Camera}
              title="Photo Documentation"
              description="Capture, annotate, and organise photos. Add arrows, text, and damage markers."
              delay={0.1}
            />
            <FeatureCard
              icon={FileText}
              title="Professional Reports"
              description="Generate polished PDF reports with one click. Customizable with your branding."
              delay={0.2}
            />
            <FeatureCard
              icon={Users}
              title="Team Collaboration"
              description="Invite technicians with role-based access. See updates in real-time."
              delay={0.3}
            />
            <FeatureCard
              icon={Activity}
              title="Equipment Tracking"
              description="Assign dehumidifiers, air movers, and sensors to jobs. Track runtime and costs."
              delay={0.4}
            />
            <FeatureCard
              icon={Thermometer}
              title="Psychrometric Data"
              description="Automatic dew point, vapour pressure, and specific humidity calculations."
              delay={0.5}
            />
            <FeatureCard
              icon={ClipboardCheck}
              title="Digital Forms"
              description="Complete safety checks, work authorizations, and FNOL forms digitally."
              delay={0.6}
            />
            <FeatureCard
              icon={Calculator}
              title="Cost Estimates"
              description="Create professional estimates with templates. Track costs per job."
              delay={0.7}
            />
          </div>

          <div className="text-center mt-12">
            <Link to="/features">
              <Button variant="outline" size="lg" className="group">
                Explore All Features
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <StatsCounter
              value={500}
              suffix="+"
              label="Restoration Companies"
              icon={Building2}
              delay={0}
            />
            <StatsCounter
              value={50000}
              suffix="+"
              label="Jobs Completed"
              icon={ClipboardCheck}
              delay={200}
            />
            <StatsCounter
              value={1000000}
              suffix="+"
              label="Readings Logged"
              icon={Droplets}
              delay={400}
            />
            <StatsCounter
              value={99}
              suffix="%"
              label="Customer Satisfaction"
              icon={Shield}
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Trusted by Restoration Pros
            </h2>
          </div>

          <TestimonialCarousel />
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-card" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Pricing
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
          </div>

          {tiersLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
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

          <div className="text-center mt-12">
            <Link to="/pricing">
              <Button variant="link" className="text-primary">
                View full pricing details →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-6 w-6 text-success" />
              <span className="text-sm font-medium">256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-6 w-6 text-warning" />
              <span className="text-sm font-medium">99.9% Uptime SLA</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">IICRC Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your{' '}
            <span className="text-primary">Restoration Business?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join 500+ restoration companies already using FloodEx to document faster,
            report smarter, and get paid quicker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=signup">
              <Button
                size="lg"
                className="text-lg px-10 py-6 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
