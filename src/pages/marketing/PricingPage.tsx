import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { SEOHead, generateBreadcrumbData } from '@/components/marketing/SEOHead';
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/marketing/AnimateIn';
import { FAQAccordion } from '@/components/marketing/FAQAccordion';
import { motion } from 'framer-motion';
import { Check, Shield, Clock, CreditCard } from 'lucide-react';

export default function PricingPage() {


  return (
    <MarketingLayout>
      <SEOHead
        title="FloodEx Pricing – Free to use, AUD $29 per job report unlock"
        description="FloodEx is free to use for jobs, readings, photos, and in-app report previews. Unlock a job to download PDFs for AUD $29. First unlock is free. Optional monthly plans remain available."
        keywords="flood restoration software pricing, water damage software cost, FloodEx pricing, restoration software plans, pay per job report, cheap restoration software, Encircle pricing alternative, free restoration software, water damage app pricing"
        canonicalPath="/pricing"
        structuredData={generateBreadcrumbData([
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ])}
      />
      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">Pricing</div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} className="text-[clamp(44px,7vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-foreground max-w-[850px] mb-7">
          Free to use.<br />
          <span className="bg-accent text-white px-3 py-1 inline-block rounded-xl -rotate-1 my-1">$29 to export.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[clamp(16px,1.8vw,20px)] text-muted-foreground max-w-[540px] leading-[1.7] font-medium mb-14">
          Create jobs, log readings, capture photos, and preview reports in-app for free. Unlock a job to download PDFs for AUD $29. Your first unlock is free, and re-downloads of that job stay free forever.
        </motion.p>

        <div className="grid gap-6 md:grid-cols-2 max-w-[900px] mb-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.5 }} className="border rounded-3xl p-8 bg-foreground text-white shadow-xl">
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/50 mb-3">Pay per job</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl font-black tracking-[-0.04em]">$29</span>
              <span className="text-white/50 font-semibold">AUD one-time / job</span>
            </div>
            <ul className="space-y-2 text-sm text-white/70 mb-6">
              <li>✓ Unlimited jobs, readings, photos, and in-app previews</li>
              <li>✓ First job unlock free</li>
              <li>✓ Re-download unlocked jobs forever</li>
              <li>✓ 28 days of editing after each unlock</li>
              <li>✓ No monthly subscription required</li>
            </ul>
            <Link to="/auth?tab=signup">
              <button className="block w-full text-center py-[13px] rounded-full text-sm font-extrabold bg-accent text-white hover:opacity-85 border-none cursor-pointer">
                Start free — first unlock included
              </button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="border-2 border-primary rounded-3xl p-8 bg-card shadow-xl">
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-3">Unlimited</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl font-black tracking-[-0.04em]">$250</span>
              <span className="text-muted-foreground font-semibold">AUD / month</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li>✓ Unlimited job report downloads</li>
              <li>✓ No per-job unlock fees</li>
              <li>✓ Every job stays editable — no 28-day freeze</li>
              <li>✓ Cancel any time</li>
            </ul>
            <Link to="/auth?tab=signup">
              <button className="block w-full text-center py-[13px] rounded-full text-sm font-extrabold bg-primary text-primary-foreground hover:opacity-85 border-none cursor-pointer">
                Go Unlimited
              </button>
            </Link>
          </motion.div>
        </div>


      </section>


      {/* Trust Badges */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row flex-wrap justify-center items-center gap-8 lg:gap-16">
          {[
            { icon: Shield, title: 'Free to use', desc: 'Jobs, readings, photos, previews' },
            { icon: Clock, title: 'First unlock free', desc: 'Then $29 AUD per job' },
            { icon: CreditCard, title: 'No subscription required', desc: 'Pay only when you export' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <item.icon className="h-7 w-7 text-primary" />
              <div>
                <p className="font-extrabold text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-6xl mx-auto">
        <AnimateIn>
          <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">Everything is included</h2>
        </AnimateIn>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'Unlimited jobs and losses',
            'Unlimited moisture readings',
            'Unlimited photos and annotations',
            'Drying chambers and equipment tracking',
            'Mud maps and floor plans',
            'Digital forms and signatures',
            'Cost items and estimates',
            'In-app report previews',
            'Unlimited team members',
          ].map((item) => (
            <StaggerItem key={item}>
              <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-white p-5 h-full">
                <Check className="h-5 w-5 text-primary shrink-0 mt-[2px]" />
                <span className="text-sm font-semibold text-foreground">{item}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>


      {/* FAQ */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <AnimateIn>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">Frequently asked questions</h2>
          </AnimateIn>
          <FAQAccordion />
        </div>
      </section>

      <div className="py-4" />

      {/* CTA */}
      <div className="mx-4 md:mx-8 my-8 rounded-[32px] bg-foreground px-6 md:px-12 py-20 md:py-28 text-center">
        <AnimateIn>
          <h2 className="text-[clamp(34px,5vw,60px)] font-black leading-[1.0] tracking-[-0.04em] text-white mb-4">
            Need a custom<br /><span className="text-accent">solution?</span>
          </h2>
          <p className="text-[17px] text-white/40 font-medium mb-12 max-w-lg mx-auto">
            For large organisations with custom needs, we offer tailored plans with volume discounts and dedicated support.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/contact">
              <Button variant="outline" className="rounded-full border-white/15 text-white/50 hover:bg-white/5 hover:text-white/70 text-base py-4 px-8">Contact us</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free →</Button>
            </Link>
          </div>
        </AnimateIn>
      </div>
    </MarketingLayout>
  );
}
