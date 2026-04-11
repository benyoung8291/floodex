import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { SEOHead, generateBreadcrumbData, generateFAQData } from '@/components/marketing/SEOHead';
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/marketing/AnimateIn';
import { motion } from 'framer-motion';
import {
  Droplets, Camera, FileText, Shield, Smartphone, Zap,
  Check, Activity, Thermometer, Users, Clock, BarChart3,
} from 'lucide-react';

const faqs = [
  {
    question: 'What is water damage restoration software?',
    answer: 'Water damage restoration software is a digital platform that helps restoration technicians document water damage jobs, track moisture readings, manage drying equipment, and generate professional reports. FloodEx is purpose-built for this workflow, replacing paper forms and spreadsheets with a mobile-first app that works in the field.',
  },
  {
    question: 'How does FloodEx help with water damage documentation?',
    answer: 'FloodEx provides a complete documentation toolkit: capture photos with built-in annotation tools, log moisture readings with automatic g/kg calculations, track equipment placement and runtime, create digital work logs, and generate one-click PDF reports that meet IICRC standards. Everything syncs in real-time across your team.',
  },
  {
    question: 'Is FloodEx compliant with IICRC S500 standards?',
    answer: 'Yes. FloodEx reports are designed to meet IICRC S500 documentation standards for professional water damage restoration. The platform includes psychrometric calculations, drying trend charts, and structured reporting formats that satisfy insurance adjusters and industry requirements.',
  },
  {
    question: 'How much does water damage restoration software cost?',
    answer: 'FloodEx starts with a free tier (2 jobs, 50 readings/month) and paid plans from $49 AUD/month. This is significantly more affordable than competitors like Encircle ($250+/month) while offering comparable features including moisture tracking, photo documentation, and professional reporting.',
  },
  {
    question: 'Can I use FloodEx on my phone in the field?',
    answer: 'Absolutely. FloodEx is built mobile-first, designed for use on-site with gloves, in low light, and on the go. It works on any device with a browser — smartphone, tablet, or laptop. Add it to your home screen for an app-like experience without needing an app store download.',
  },
  {
    question: 'Does FloodEx work for Australian restoration companies?',
    answer: 'FloodEx is Australian-built and operated by Local Carpet Cleaning Pty Ltd (ABN 15 682 871 192). It is designed specifically for the Australian restoration market with local pricing in AUD, Australian-hosted data, and compliance with local industry standards.',
  },
];

const features = [
  { icon: Droplets, title: 'Moisture Tracking & Mapping', desc: 'Log readings by drying chamber with automatic g/kg humidity ratio calculations. Visualise drying progress with trend charts and monitor every affected area from initial assessment to dry standard.' },
  { icon: Camera, title: 'Photo Documentation & Annotation', desc: 'Capture unlimited photos per job. Annotate with arrows, circles, and text to mark damage locations. Organise by category (before, during, after) with automatic timestamps and location data.' },
  { icon: FileText, title: 'One-Click IICRC-Compliant Reports', desc: 'Generate professional PDF reports with a single click. Reports include moisture data, photos, equipment logs, and psychrometric calculations — formatted to meet insurance and IICRC S500 documentation standards.' },
  { icon: Activity, title: 'Equipment Tracking & Costing', desc: 'Assign dehumidifiers, air movers, and sensors to jobs. Track runtime, calculate costs, and ensure every piece of equipment is accounted for in your documentation and billing.' },
  { icon: Thermometer, title: 'Psychrometric Calculations', desc: 'Automatic dew point, vapour pressure, and specific humidity calculations from your field readings. No more manual psychrometric charts or calculators — FloodEx does the maths for you.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Invite technicians with role-based access. Share job updates in real-time, assign tasks, and maintain activity logs. Everyone on your team sees the same data, from the field to the office.' },
];

const benefits = [
  { icon: Zap, title: 'Save 3+ Hours Per Job', desc: 'Replace paper forms, manual calculations, and copy-paste report building with automated digital workflows.' },
  { icon: Shield, title: 'Insurance-Ready Documentation', desc: 'Generate reports that satisfy adjusters the first time. No more back-and-forth over missing documentation.' },
  { icon: Smartphone, title: 'Works Anywhere, Any Device', desc: 'Mobile-first design means you can document in the field, review on a tablet, and generate reports from your desktop.' },
  { icon: Clock, title: 'Get Paid Faster', desc: 'Complete, professional documentation means faster approval from insurers and quicker payment for your work.' },
];

export default function WaterDamageRestorationSoftwarePage() {
  const structuredData = [
    generateBreadcrumbData([
      { name: 'Home', path: '/' },
      { name: 'Water Damage Restoration Software', path: '/water-damage-restoration-software' },
    ]),
    generateFAQData(faqs),
  ];

  return (
    <MarketingLayout>
      <SEOHead
        title="Water Damage Restoration Software | FloodEx – Document, Track & Report"
        description="FloodEx is the leading water damage restoration software for technicians. Track moisture readings, document damage with photos, generate IICRC-compliant reports. Mobile-first. Free to start. Australian-built."
        keywords="water damage restoration software, water damage documentation software, water mitigation software, water damage reporting tool, moisture tracking software, IICRC S500 compliant software, restoration documentation app, water damage technician app, drying documentation software"
        canonicalPath="/water-damage-restoration-software"
        structuredData={structuredData}
      />

      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">Water Damage Restoration Software</div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} className="text-[clamp(44px,7vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-foreground max-w-[850px] mb-7">
          The complete water damage restoration{' '}
          <span className="bg-accent text-white px-3 py-1 inline-block rounded-xl -rotate-1 my-1">software platform</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[clamp(16px,1.8vw,20px)] text-muted-foreground max-w-[600px] leading-[1.7] font-medium mb-12">
          FloodEx helps water damage restoration technicians document jobs faster, track moisture accurately, and generate insurance-ready reports — all from a mobile device. Purpose-built for the restoration industry, not adapted from generic field service software.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.5 }} className="flex items-center gap-3 flex-wrap">
          <Link to="/auth?tab=signup">
            <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
          </Link>
          <Link to="/compare">
            <Button variant="outline" className="rounded-full border-border/60 text-foreground font-bold text-base py-4 px-8 hover:bg-secondary">Compare with competitors</Button>
          </Link>
        </motion.div>
      </section>

      {/* Why Water Damage Pros Need Dedicated Software */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-6">
              Why water damage restoration teams need dedicated software
            </h2>
            <p className="text-[17px] text-muted-foreground max-w-[640px] leading-[1.7] font-medium mb-14">
              Water damage restoration is unlike any other trade. You need to track moisture levels over time, document drying progress with psychrometric data, prove compliance with IICRC standards, and generate reports that insurance companies will accept. Generic field service tools weren't built for this. FloodEx was.
            </p>
          </AnimateIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <StaggerItem key={b.title}>
                <div className="bg-white border border-border/40 rounded-3xl p-7 flex flex-col gap-4 h-full hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <b.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-[17px] font-extrabold tracking-tight text-foreground">{b.title}</h3>
                  <p className="text-[13px] text-foreground/60 leading-[1.6] font-medium">{b.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <div className="py-4" />

      {/* Core Features */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-6xl mx-auto">
        <AnimateIn>
          <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-6">
            Everything you need for water damage documentation
          </h2>
          <p className="text-[17px] text-muted-foreground max-w-[560px] leading-[1.7] font-medium mb-14">
            From the initial inspection to the final drying report — FloodEx covers every step of the water damage restoration documentation process.
          </p>
        </AnimateIn>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
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
        <AnimateIn>
          <div className="text-center mt-10">
            <Link to="/features">
              <Button variant="outline" className="rounded-full border-border/60 text-foreground font-bold hover:bg-secondary">
                See all features in detail →
              </Button>
            </Link>
          </div>
        </AnimateIn>
      </section>

      {/* Pricing Comparison */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-foreground px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-white mb-6">
              More affordable than Encircle, more focused than Xactimate
            </h2>
            <p className="text-[17px] text-white/45 max-w-[560px] leading-[1.7] font-medium mb-14">
              FloodEx delivers professional water damage documentation at a fraction of the cost of enterprise tools — with a free tier to get started.
            </p>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'FloodEx', price: 'From $0/mo', highlight: true, features: ['Free tier available', 'All core features included', 'No long-term contracts', 'Transparent pricing'] },
              { name: 'Encircle', price: 'From $250/mo', highlight: false, features: ['No free tier', 'Annual contracts typical', 'Sales call required', 'Enterprise pricing'] },
              { name: 'Xactimate', price: 'Custom pricing', highlight: false, features: ['Estimating-focused', 'Steep learning curve', 'Desktop-first design', 'Requires training'] },
            ].map((tool) => (
              <div key={tool.name} className={`rounded-3xl p-7 ${tool.highlight ? 'bg-accent/20 border-2 border-accent/40' : 'bg-white/5 border border-white/10'}`}>
                <h3 className="text-xl font-extrabold text-white mb-1">{tool.name}</h3>
                <p className={`text-sm font-bold mb-4 ${tool.highlight ? 'text-accent' : 'text-white/40'}`}>{tool.price}</p>
                <ul className="flex flex-col gap-2">
                  {tool.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-white/50 font-medium">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tool.highlight ? 'text-accent' : 'text-white/30'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <AnimateIn>
            <div className="text-center mt-10">
              <Link to="/compare">
                <Button variant="outline" className="rounded-full border-white/20 text-white/60 hover:bg-white/5 hover:text-white/80">
                  Full feature comparison →
                </Button>
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="py-4" />

      {/* FAQ */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-4xl mx-auto">
        <AnimateIn>
          <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">
            Water damage restoration software FAQ
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
            Ready to modernise your<br /><span className="text-accent">water damage documentation?</span>
          </h2>
          <p className="text-[17px] text-white/40 font-medium mb-12 max-w-lg mx-auto">
            Join restoration professionals across Australia who document faster, report smarter, and get paid quicker with FloodEx.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/auth?tab=signup">
              <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="rounded-full border-white/15 text-white/50 hover:bg-white/5 hover:text-white/70 text-base py-4 px-8">View pricing</Button>
            </Link>
          </div>
          <p className="mt-8 text-xs text-white/25 font-medium">No credit card required · 14-day free trial · Cancel anytime</p>
        </AnimateIn>
      </div>
    </MarketingLayout>
  );
}
