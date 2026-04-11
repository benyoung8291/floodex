import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { SEOHead, generateBreadcrumbData, generateFAQData } from '@/components/marketing/SEOHead';
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/marketing/AnimateIn';
import { motion } from 'framer-motion';
import { FileText, Camera, Shield, Zap, Check, Droplets, Users, Smartphone } from 'lucide-react';

const faqs = [
  {
    question: 'What is restoration reporting software?',
    answer: 'Restoration reporting software helps water damage restoration companies generate professional documentation and reports from field data. FloodEx automates this process: it collects moisture readings, photos, equipment logs, and work notes in the field, then generates complete IICRC-compliant PDF reports with one click.',
  },
  {
    question: 'Does FloodEx generate IICRC-compliant drying reports?',
    answer: 'Yes. FloodEx reports include all the data required for IICRC S500 compliance: moisture readings with g/kg calculations, psychrometric data (dew point, vapour pressure, specific humidity), drying trend charts, equipment logs, photo documentation, and digital signatures. Reports are formatted for easy review by insurance adjusters.',
  },
  {
    question: 'Can I customise FloodEx reports with my company branding?',
    answer: 'Yes. Pro and Enterprise plans include custom branding — add your company logo, colours, and contact details to every report. Reports are generated as professional PDFs that you can share directly with clients and insurance companies.',
  },
  {
    question: 'How fast can I generate a restoration report?',
    answer: 'With FloodEx, you can generate a complete PDF report with one click. All data is collected digitally during the job — moisture readings, photos, equipment logs, and work notes. When the job is done, your report is essentially already written. No more spending hours compiling data from paper forms.',
  },
  {
    question: 'What data is included in FloodEx restoration reports?',
    answer: 'FloodEx reports include: job details and location, moisture readings with g/kg calculations and trend charts, psychrometric data, annotated photo documentation, equipment tracking with runtime data, work logs, digital signatures, and custom company branding. Everything an adjuster needs in one professional document.',
  },
];

const reportFeatures = [
  { icon: FileText, title: 'One-Click PDF Generation', desc: 'Generate complete, professional PDF reports with a single click. All your field data — readings, photos, equipment, notes — compiled automatically into a polished document.' },
  { icon: Shield, title: 'IICRC S500 Compliant Format', desc: 'Reports are structured to meet IICRC S500 documentation standards. Include moisture data, psychrometric calculations, drying trends, and equipment justification in every report.' },
  { icon: Camera, title: 'Annotated Photo Evidence', desc: 'Photos with annotations are automatically included in reports. Show damage locations, equipment placement, and restoration progress with visual evidence that speaks for itself.' },
  { icon: Droplets, title: 'Moisture Data & Trend Charts', desc: 'All moisture readings, g/kg calculations, and drying trend charts are automatically compiled into the report. Show the complete drying story from start to dry standard.' },
  { icon: Users, title: 'Digital Signatures & Branding', desc: 'Capture digital signatures from property owners. Add your company logo, colours, and branding to create reports that represent your business professionally.' },
  { icon: Smartphone, title: 'Share & Export Instantly', desc: 'Share reports directly via link or download as PDF. Reports are generated in seconds, not hours — so you can send documentation while still on-site.' },
];

export default function RestorationReportingSoftwarePage() {
  const structuredData = [
    generateBreadcrumbData([
      { name: 'Home', path: '/' },
      { name: 'Features', path: '/features' },
      { name: 'Restoration Reporting Software', path: '/restoration-reporting-software' },
    ]),
    generateFAQData(faqs),
  ];

  return (
    <MarketingLayout>
      <SEOHead
        title="Restoration Reporting Software | FloodEx – One-Click IICRC-Compliant PDF Reports"
        description="Generate professional IICRC-compliant restoration reports with one click. FloodEx reporting software compiles moisture data, photos, equipment logs, and psychrometric calculations into polished PDFs. Free to start."
        keywords="restoration reporting software, drying report software, IICRC compliant reports, water damage report generator, restoration PDF reports, insurance restoration reports, drying log report, restoration documentation reports, one-click restoration reports"
        canonicalPath="/restoration-reporting-software"
        structuredData={structuredData}
      />

      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">Restoration Reporting Software</div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} className="text-[clamp(44px,7vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-foreground max-w-[850px] mb-7">
          One-click{' '}
          <span className="bg-accent text-white px-3 py-1 inline-block rounded-xl -rotate-1 my-1">restoration reports</span>
          <br />that get you paid
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[clamp(16px,1.8vw,20px)] text-muted-foreground max-w-[600px] leading-[1.7] font-medium mb-12">
          Stop spending hours compiling data from paper forms into reports. FloodEx collects everything in the field and generates professional, IICRC-compliant PDF reports with one click — so you can get paid faster.
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

      {/* What's in a FloodEx Report */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-6">
              What's included in a FloodEx restoration report
            </h2>
            <p className="text-[17px] text-muted-foreground max-w-[560px] leading-[1.7] font-medium mb-14">
              Every FloodEx report is automatically compiled from your field data. No manual data entry, no copy-pasting, no formatting headaches.
            </p>
          </AnimateIn>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Job details & property information',
              'Moisture readings with g/kg data',
              'Drying trend charts & progress',
              'Psychrometric calculations',
              'Annotated photo documentation',
              'Equipment logs & runtime data',
              'Work logs & technician notes',
              'Digital signatures',
              'Custom company branding',
            ].map((item) => (
              <StaggerItem key={item}>
                <div className="bg-white border border-border/40 rounded-2xl p-5 flex items-start gap-3 h-full">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-[13px] text-foreground font-medium leading-[1.5]">{item}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <div className="py-4" />

      {/* Features */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-6xl mx-auto">
        <AnimateIn>
          <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">
            Reporting features built for restoration professionals
          </h2>
        </AnimateIn>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportFeatures.map((f) => (
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

      {/* Old vs New */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-foreground px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimateIn>
            <div className="rounded-3xl bg-white/5 border border-white/10 p-7">
              <h3 className="text-[17px] font-extrabold tracking-tight text-white/50 mb-4">Manual Report Creation</h3>
              <div className="flex flex-col gap-3">
                {['3-5 hours per report', 'Copy-paste from paper forms', 'Manual photo sorting & insertion', 'Formatting inconsistencies', 'Missing data discovered too late'].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-[13px] text-white/35 font-medium">
                    <span className="text-destructive font-black shrink-0">✕</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>
          <AnimateIn>
            <div className="rounded-3xl bg-accent/15 border-2 border-accent/30 p-7">
              <h3 className="text-[17px] font-extrabold tracking-tight text-white mb-4">FloodEx One-Click Reports</h3>
              <div className="flex flex-col gap-3">
                {['Generated in seconds', 'Auto-compiled from field data', 'Photos auto-included with annotations', 'Consistent, professional formatting', 'Complete data validated in real-time'].map((item) => (
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
            Restoration reporting FAQ
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
            Stop building reports<br /><span className="text-accent">by hand</span>
          </h2>
          <p className="text-[17px] text-white/40 font-medium mb-12 max-w-lg mx-auto">
            Let FloodEx compile your field data into professional reports automatically. Free to start.
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
