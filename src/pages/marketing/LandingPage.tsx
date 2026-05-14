import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { SEOHead, generateFAQData } from '@/components/marketing/SEOHead';
import { HeroSection } from '@/components/marketing/HeroSection';
import { AnimateIn, StaggerContainer, StaggerItem, ScaleIn } from '@/components/marketing/AnimateIn';
import { FAQAccordion, faqs as faqData } from '@/components/marketing/FAQAccordion';
import { AppMockup } from '@/components/marketing/AppMockup';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';
import {
  Droplets, Camera, FileText, Users, Activity, Thermometer,
  ClipboardCheck, Calculator, Check, Zap, Shield, Smartphone,
} from 'lucide-react';

const features = [
  { icon: Droplets, bg: 'bg-primary/5', iconBg: 'bg-primary', title: 'Moisture Tracking', desc: 'Log readings by chamber with automatic g/kg calculations and drying trend charts.' },
  { icon: Camera, bg: 'bg-accent/5', iconBg: 'bg-accent/20', title: 'Photo Documentation', desc: 'Capture, annotate, and organise photos. Add arrows, text, and damage markers.' },
  { icon: FileText, bg: 'bg-primary/5', iconBg: 'bg-primary/15', title: 'Professional Reports', desc: 'Generate polished PDF reports with one click. Customisable with your branding.' },
  { icon: Users, bg: 'bg-accent/5', iconBg: 'bg-accent/15', title: 'Team Collaboration', desc: 'Invite technicians with role-based access. See updates in real-time.' },
  { icon: Activity, bg: 'bg-white', iconBg: 'bg-primary/10', title: 'Equipment Tracking', desc: 'Assign dehumidifiers, air movers, and sensors to jobs. Track runtime and costs.' },
  { icon: Thermometer, bg: 'bg-secondary', iconBg: 'bg-primary/15', title: 'Psychrometric Calcs', desc: 'Automatic dew point, vapour pressure, and specific humidity calculations.' },
];

const whyReasons = [
  { icon: Zap, title: 'Purpose-Built', desc: 'Not a generic tool — every feature designed for flood & water damage workflows.' },
  { icon: Shield, title: 'IICRC Compliant', desc: 'Reports meet industry documentation standards right out of the box.' },
  { icon: Smartphone, title: 'Field-First', desc: 'Mobile-optimised for use on-site with gloves, in low light, and on the go.' },
  { icon: Thermometer, title: 'Auto Calculations', desc: 'GPP, dew point, vapour pressure — calculated automatically from readings.' },
];

export default function LandingPage() {
  const { data: tiers, isLoading: tiersLoading } = useSubscriptionTiers();
  const sortedTiers = tiers?.sort((a, b) => a.monthly_price - b.monthly_price) || [];

  return (
    <MarketingLayout>
      <SEOHead
        title="FloodEx — Flood Restoration Software Australia"
        description="Track moisture, annotate damage photos, and generate IICRC-compliant PDF reports. Purpose-built for Australian restoration techs. Free to start."
        keywords="flood restoration software, water damage restoration software, moisture tracking app, drying log software, IICRC compliant reports, water damage documentation, restoration management software, psychrometric calculator, flood restoration app Australia"
        canonicalPath="/"
        structuredData={generateFAQData(faqData)}
      />
      <HeroSection />

      {/* Problem / Solution */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">The problem</div>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-4">
              Stop wrestling with<br />paper & spreadsheets
            </h2>
            <p className="text-[17px] text-muted-foreground max-w-[480px] leading-[1.7] font-medium mb-14">
              Restoration pros waste hours on documentation. FloodEx puts everything in one place — accessible from any device.
            </p>
          </AnimateIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StaggerItem>
              <div className="bg-white border border-border/40 rounded-3xl p-8 h-full">
                <h4 className="text-[17px] font-extrabold tracking-tight text-destructive mb-4">📋 The Old Way</h4>
                <div className="flex flex-col gap-[9px]">
                  {['Paper forms lost in the field', 'Manual calculations with errors', 'Hours creating reports', 'No real-time visibility'].map(item => (
                    <div key={item} className="flex items-start gap-2 text-[13px] text-foreground/60 font-medium">
                      <span className="text-destructive font-black shrink-0">✕</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="bg-white border border-border/40 rounded-3xl p-8 h-full">
                <h4 className="text-[17px] font-extrabold tracking-tight text-primary mb-4">📱 The FloodEx Way</h4>
                <div className="flex flex-col gap-[9px]">
                  {['Digital capture in the field', 'Auto-calculated g/kg & metrics', 'One-click PDF reports', 'Real-time team updates'].map(item => (
                    <div key={item} className="flex items-start gap-2 text-[13px] text-foreground/60 font-medium">
                      <span className="text-primary font-black shrink-0">✓</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <div className="py-4" />

      {/* Features */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between mb-12 gap-8">
          <AnimateIn>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground max-w-[340px]">
              Everything you<br />need in<br />the field
            </h2>
          </AnimateIn>
          <AnimateIn>
            <p className="text-[15px] text-muted-foreground max-w-[320px] md:text-right font-medium leading-[1.7] mt-2">
              Purpose-built for water damage restoration — from first inspection to final report.
            </p>
          </AnimateIn>
        </div>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <div className={`${f.bg} border border-border/40 rounded-3xl p-7 flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-lg h-full`}>
                <div className={`w-12 h-12 rounded-2xl ${f.iconBg} flex items-center justify-center`}>
                  <f.icon className="w-6 h-6 text-foreground" />
                </div>
                <h4 className="text-[17px] font-extrabold tracking-tight text-foreground">{f.title}</h4>
                <p className="text-[13px] text-foreground/60 leading-[1.6] font-medium">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <AnimateIn>
          <div className="text-center mt-10">
            <Link to="/features">
              <Button variant="outline" className="rounded-full border-border/60 text-foreground font-bold hover:bg-secondary">
                Explore all features →
              </Button>
            </Link>
          </div>
        </AnimateIn>
      </section>

      {/* App Mockup Section */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-foreground px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <ScaleIn>
            <AppMockup variant="readings" className="relative z-10" />
          </ScaleIn>
          <AnimateIn>
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/30 mb-4">Live documentation</div>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-white mb-4">
              Log readings.<br />Track drying.<br /><span className="text-accent">See progress.</span>
            </h2>
            <p className="text-[17px] text-white/45 max-w-[480px] leading-[1.7] font-medium mb-12">
              Real-time moisture tracking with automatic psychrometric calculations. Know exactly where every chamber stands — at a glance.
            </p>
            <div className="flex flex-col gap-4 mt-6">
              {whyReasons.map((r) => (
                <div key={r.title} className="flex items-start gap-3 text-sm text-white/50 font-medium leading-[1.6]">
                  <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-[2px]">
                    <Check className="w-[10px] h-[10px] text-accent" />
                  </div>
                  <div>
                    <span className="text-white/70 font-bold">{r.title}</span> — {r.desc}
                  </div>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="py-4" />

      {/* Pricing Preview */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-6xl mx-auto" id="pricing">
        <AnimateIn>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">Pricing</div>
          <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-4">
            Simple pricing.<br />Free to start.
          </h2>
          <p className="text-[17px] text-muted-foreground max-w-[480px] leading-[1.7] font-medium mb-14">
            Start free, upgrade when you're ready. No hidden fees, no surprises.
          </p>
        </AnimateIn>

        {tiersLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-[960px]">
            {sortedTiers.map((tier) => {
              const isFeatured = tier.name.toLowerCase() === 'pro';
              return (
                <StaggerItem key={tier.id}>
                  <div className={`border rounded-3xl p-8 flex flex-col relative h-full transition-shadow hover:shadow-lg ${
                    isFeatured
                      ? "bg-foreground border-foreground/80 shadow-xl"
                      : "bg-white border-border/50"
                  }`}>
                    {isFeatured && (
                      <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-black px-4 py-[3px] rounded-full whitespace-nowrap uppercase tracking-[0.04em]">Most popular</div>
                    )}
                    <div className={`text-2xl font-black tracking-tight mb-[6px] ${isFeatured ? "text-white" : "text-foreground"}`}>{tier.name}</div>
                    <div className="flex items-baseline gap-[3px] mb-[6px]">
                      <span className={`text-5xl font-black tracking-[-0.04em] leading-none ${isFeatured ? "text-white" : ""}`}>${tier.monthly_price}</span>
                      <span className={`text-[15px] font-semibold ${isFeatured ? "text-white/40" : "text-muted-foreground"}`}>/ month</span>
                    </div>
                    <div className={`text-[13px] font-medium leading-[1.65] mb-6 pb-6 border-b ${isFeatured ? "text-white/40 border-white/10" : "text-muted-foreground border-border/40"}`}>
                      {tier.jobs_included} jobs · {tier.readings_included.toLocaleString()} readings/mo
                    </div>
                    <Link to="/auth?tab=signup" className="mt-auto">
                      <button className={`block w-full text-center py-[13px] rounded-full text-sm font-extrabold cursor-pointer transition-all ${
                        isFeatured
                          ? "bg-accent text-white hover:opacity-85 border-none"
                          : "bg-transparent border border-border/50 text-foreground hover:bg-secondary"
                      }`}>Start free trial</button>
                    </Link>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
        <AnimateIn>
          <div className="mt-10 text-center">
            <Link to="/pricing" className="text-sm text-primary font-bold hover:underline">View full pricing details →</Link>
          </div>
        </AnimateIn>
      </section>

      {/* FAQ */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <AnimateIn>
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">FAQ</div>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">
              Common questions
            </h2>
          </AnimateIn>
          <FAQAccordion />
        </div>
      </section>

      <div className="py-4" />

      {/* Final CTA */}
      <div className="mx-4 md:mx-8 my-8 rounded-[32px] bg-foreground px-6 md:px-12 py-20 md:py-28 text-center">
        <AnimateIn>
          <h2 className="text-[clamp(34px,5vw,60px)] font-black leading-[1.0] tracking-[-0.04em] text-white mb-4">
            Ready to transform your<br /><span className="text-accent">restoration business?</span>
          </h2>
          <p className="text-[17px] text-white/40 font-medium mb-12 max-w-lg mx-auto">
            Join restoration professionals who document faster, report smarter, and get paid quicker with FloodEx.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/auth?tab=signup">
              <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" className="rounded-full border-white/30 text-white font-bold hover:bg-white/10 text-base py-4 px-8">Go to dashboard</Button>
            </Link>
          </div>
          <p className="mt-8 text-xs text-white/25 font-medium">No credit card required · 14-day free trial · Cancel anytime</p>
        </AnimateIn>
      </div>
    </MarketingLayout>
  );
}
