import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { SEOHead, generateBreadcrumbData, generateFAQData } from '@/components/marketing/SEOHead';
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/marketing/AnimateIn';
import { motion } from 'framer-motion';
import { Droplets, Thermometer, BarChart3, Calculator, Check, Smartphone, Clock, Shield } from 'lucide-react';

const faqs = [
  {
    question: 'What is moisture tracking software?',
    answer: 'Moisture tracking software allows restoration technicians to digitally log, monitor, and analyse moisture readings throughout the drying process. Instead of paper drying logs and manual calculations, software like FloodEx automatically records temperature, humidity, and moisture content data — then calculates g/kg ratios, dew point, and vapour pressure to demonstrate drying progress.',
  },
  {
    question: 'How does FloodEx calculate g/kg humidity ratios automatically?',
    answer: 'When you log temperature and relative humidity readings in FloodEx, the platform automatically calculates the grams per kilogram (g/kg) humidity ratio using psychrometric formulas. This is essential for demonstrating that drying is progressing according to IICRC S500 standards, and eliminates the need for psychrometric charts or manual calculators.',
  },
  {
    question: 'Can I create drying chambers in FloodEx?',
    answer: 'Yes. FloodEx lets you create named drying chambers for each affected area of a water damage job. Each chamber tracks its own moisture readings over time, so you can monitor drying progress area-by-area and compare against outdoor baseline readings to prove when areas have reached dry standard.',
  },
  {
    question: 'Does FloodEx replace moisture mapping spreadsheets?',
    answer: 'Yes. FloodEx replaces paper-based drying logs and moisture mapping spreadsheets with digital tools that capture readings in the field, calculate metrics automatically, and generate visual trend charts showing drying progress over time. All data feeds directly into your final reports.',
  },
  {
    question: 'What psychrometric calculations does FloodEx perform?',
    answer: 'FloodEx automatically calculates dew point, vapour pressure, specific humidity (g/kg), and grains per pound (GPP) from your temperature and relative humidity readings. These calculations are essential for IICRC-compliant documentation and proving that your drying strategy is effective.',
  },
];

const trackingFeatures = [
  { icon: Droplets, title: 'Drying Chamber Management', desc: 'Create dedicated chambers for each affected area. Log readings per chamber and track drying progress independently for every zone of the job.' },
  { icon: Calculator, title: 'Automatic g/kg Calculations', desc: 'Enter temperature and humidity — FloodEx automatically calculates g/kg humidity ratios, dew point, vapour pressure, and specific humidity. No more psychrometric charts.' },
  { icon: BarChart3, title: 'Drying Trend Visualisation', desc: 'Visual trend charts show how moisture levels change over time across all chambers. Instantly see which areas are drying on schedule and which need attention.' },
  { icon: Thermometer, title: 'Full Psychrometric Data', desc: 'Automatic dew point, vapour pressure, GPP, and specific humidity calculations from every reading. All the data you need for IICRC S500 compliance in one place.' },
  { icon: Shield, title: 'Outdoor Baseline Comparison', desc: 'Log outdoor ambient conditions as your baseline reference. FloodEx automatically compares indoor readings against outdoor conditions to track drying progress.' },
  { icon: Smartphone, title: 'Field-First Mobile Input', desc: 'Log readings directly from your phone on the job site. The interface is designed for field conditions — large buttons, clear displays, and works with gloves on.' },
];

export default function MoistureTrackingSoftwarePage() {
  const structuredData = [
    generateBreadcrumbData([
      { name: 'Home', path: '/' },
      { name: 'Features', path: '/features' },
      { name: 'Moisture Tracking Software', path: '/moisture-tracking-software' },
    ]),
    generateFAQData(faqs),
  ];

  return (
    <MarketingLayout>
      <SEOHead
        title="Moisture Tracking Software for Restoration | FloodEx – Auto g/kg Calculations"
        description="Track moisture readings with automatic g/kg calculations, psychrometric data, and drying trend charts. FloodEx moisture tracking software replaces paper drying logs for restoration technicians. Free to start."
        keywords="moisture tracking software, moisture mapping app, drying log software, moisture reading tracker, g/kg calculator restoration, psychrometric calculator app, moisture monitoring software, drying trend charts, restoration moisture data, humidity ratio calculator"
        canonicalPath="/moisture-tracking-software"
        structuredData={structuredData}
      />

      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">Moisture Tracking Software</div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} className="text-[clamp(44px,7vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-foreground max-w-[850px] mb-7">
          Moisture tracking with{' '}
          <span className="bg-accent text-white px-3 py-1 inline-block rounded-xl -rotate-1 my-1">automatic calculations</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[clamp(16px,1.8vw,20px)] text-muted-foreground max-w-[600px] leading-[1.7] font-medium mb-12">
          Stop manually calculating g/kg ratios and copying readings into spreadsheets. FloodEx automatically tracks moisture data, performs psychrometric calculations, and visualises drying trends — all from your phone in the field.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.5 }} className="flex items-center gap-3 flex-wrap">
          <Link to="/auth?tab=signup">
            <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
          </Link>
          <Link to="/features">
            <Button variant="outline" className="rounded-full border-border/60 text-foreground font-bold text-base py-4 px-8 hover:bg-secondary">See all features</Button>
          </Link>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-6">
              How moisture tracking works in FloodEx
            </h2>
            <p className="text-[17px] text-muted-foreground max-w-[560px] leading-[1.7] font-medium mb-14">
              Three steps to replace your paper drying logs with accurate, IICRC-compliant digital documentation.
            </p>
          </AnimateIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Create Drying Chambers', desc: 'Set up named chambers for each affected area of the water damage job. FloodEx organises all readings by chamber automatically.' },
              { step: '2', title: 'Log Readings in the Field', desc: 'Enter temperature, humidity, and moisture content readings from your phone. FloodEx instantly calculates g/kg ratios, dew point, and vapour pressure.' },
              { step: '3', title: 'Track Trends & Generate Reports', desc: 'View drying progress charts, compare against outdoor baselines, and include all moisture data in your one-click PDF reports.' },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <div className="bg-white border border-border/40 rounded-3xl p-8 h-full">
                  <div className="w-9 h-9 rounded-full bg-foreground text-white text-[13px] font-black flex items-center justify-center mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-[17px] font-extrabold tracking-tight mb-3 text-foreground">{item.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-[1.65] font-medium">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <div className="py-4" />

      {/* Features Grid */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-6xl mx-auto">
        <AnimateIn>
          <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">
            Moisture tracking features built for restoration
          </h2>
        </AnimateIn>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trackingFeatures.map((f) => (
            <StaggerItem key={f.title}>
              <div className="bg-white border border-border/40 rounded-3xl p-7 flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-lg h-full">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <f.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-[17px] font-extrabold tracking-tight text-foreground">{f.title}</h3>
                <p className="text-[13px] text-foreground/60 leading-[1.6] font-medium">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Comparison to Manual Methods */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-foreground px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimateIn>
            <div className="rounded-3xl bg-white/5 border border-white/10 p-7">
              <h3 className="text-[17px] font-extrabold tracking-tight text-white/50 mb-4">Paper Drying Logs</h3>
              <div className="flex flex-col gap-3">
                {['Manual g/kg calculations with errors', 'Readings lost or illegible', 'No trend visualisation', 'Hours compiling data for reports', 'No outdoor baseline comparison'].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-[13px] text-white/35 font-medium">
                    <span className="text-destructive font-black shrink-0">✕</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>
          <AnimateIn>
            <div className="rounded-3xl bg-accent/15 border-2 border-accent/30 p-7">
              <h3 className="text-[17px] font-extrabold tracking-tight text-white mb-4">FloodEx Moisture Tracking</h3>
              <div className="flex flex-col gap-3">
                {['Automatic g/kg, dew point, vapour pressure', 'Digital readings — never lost', 'Visual trend charts per chamber', 'One-click inclusion in PDF reports', 'Built-in outdoor baseline tracking'].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-[13px] text-white/60 font-medium">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />{item}
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="py-4" />

      {/* FAQ */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-4xl mx-auto">
        <AnimateIn>
          <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">
            Moisture tracking software FAQ
          </h2>
        </AnimateIn>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <AnimateIn key={i}>
              <div className="bg-white border border-border/40 rounded-2xl p-6">
                <h3 className="font-extrabold text-[15px] text-foreground mb-2">{faq.question}</h3>
                <p className="text-[13px] text-muted-foreground leading-[1.7] font-medium">{faq.answer}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mx-4 md:mx-8 my-8 rounded-[32px] bg-foreground px-6 md:px-12 py-20 md:py-28 text-center">
        <AnimateIn>
          <h2 className="text-[clamp(34px,5vw,60px)] font-black leading-[1.0] tracking-[-0.04em] text-white mb-4">
            Ditch the paper<br /><span className="text-accent">drying logs</span>
          </h2>
          <p className="text-[17px] text-white/40 font-medium mb-12 max-w-lg mx-auto">
            Start tracking moisture digitally with automatic calculations. Free to get started.
          </p>
          <Link to="/auth?tab=signup">
            <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
          </Link>
          <p className="mt-8 text-xs text-white/25 font-medium">No credit card required · 14-day free trial · Cancel anytime</p>
        </AnimateIn>
      </div>
    </MarketingLayout>
  );
}
