import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { SEOHead, generateBreadcrumbData, generateFAQData } from '@/components/marketing/SEOHead';
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/marketing/AnimateIn';
import { motion } from 'framer-motion';
import { Check, X, DollarSign, Smartphone, Zap, Shield, Clock, Users } from 'lucide-react';

const faqs = [
  {
    question: 'Is FloodEx a good alternative to Encircle?',
    answer: 'Yes. FloodEx offers the same core capabilities as Encircle — moisture tracking, photo documentation, IICRC-compliant reports, and team collaboration — at a fraction of the price. FloodEx starts free and paid plans begin at $49 AUD/month, compared to Encircle at $250+ USD/month. FloodEx is also built specifically for the Australian market.',
  },
  {
    question: 'How does FloodEx compare to Encircle on features?',
    answer: 'FloodEx matches Encircle on core documentation features: moisture tracking with auto calculations, photo annotation, PDF report generation, equipment tracking, and team collaboration. FloodEx additionally offers built-in floor plans (mud maps), transparent pricing, a free tier, and no long-term contracts.',
  },
  {
    question: 'Can I switch from Encircle to FloodEx?',
    answer: 'Yes. You can start using FloodEx immediately with our free tier or 14-day trial. There is no data migration tool yet, but new jobs can be documented in FloodEx right away. Many teams run both tools in parallel during the transition.',
  },
  {
    question: 'Is FloodEx cheaper than Encircle?',
    answer: 'Significantly. Encircle pricing starts at approximately $250 USD/month with annual contracts. FloodEx offers a free tier for small operations and paid plans from $49 AUD/month with no long-term contracts. You can cancel anytime with a 30-day money-back guarantee.',
  },
  {
    question: 'Does FloodEx work in Australia like Encircle?',
    answer: 'FloodEx is Australian-built and operated, making it an ideal choice for Australian restoration companies. Pricing is in AUD, support is local, and the platform is designed for Australian industry standards and workflows. Encircle is a North American product that may not cater specifically to the Australian market.',
  },
  {
    question: 'Is FloodEx better than Xactimate for water damage documentation?',
    answer: 'FloodEx and Xactimate serve different purposes. Xactimate is primarily an estimating and claims tool used by insurance adjusters. FloodEx is a field documentation tool for technicians — focused on moisture tracking, photo documentation, and drying reports. Many restoration companies use both: FloodEx for field documentation and Xactimate for estimating.',
  },
];

const comparisonFeatures = [
  { feature: 'Moisture tracking with auto g/kg', floodex: true, encircle: true, xactimate: 'partial' },
  { feature: 'Photo documentation & annotations', floodex: true, encircle: true, xactimate: 'partial' },
  { feature: 'One-click PDF reports', floodex: true, encircle: true, xactimate: 'partial' },
  { feature: 'Equipment tracking', floodex: true, encircle: true, xactimate: 'partial' },
  { feature: 'Team collaboration', floodex: true, encircle: true, xactimate: true },
  { feature: 'Built-in floor plans', floodex: true, encircle: false, xactimate: true },
  { feature: 'Psychrometric calculations', floodex: true, encircle: true, xactimate: false },
  { feature: 'Digital signatures', floodex: true, encircle: true, xactimate: true },
  { feature: 'Free tier available', floodex: true, encircle: false, xactimate: false },
  { feature: 'Transparent pricing (no sales call)', floodex: true, encircle: false, xactimate: false },
  { feature: 'No long-term contracts', floodex: true, encircle: false, xactimate: false },
  { feature: 'Mobile-first design', floodex: true, encircle: true, xactimate: false },
  { feature: 'Australian-built & supported', floodex: true, encircle: false, xactimate: false },
];

const advantages = [
  { icon: DollarSign, title: '80% Less Expensive', desc: 'FloodEx from $49/mo vs Encircle from $250/mo. Same core features, fraction of the price.', bg: 'bg-primary/5' },
  { icon: Zap, title: 'Free Tier to Start', desc: 'Try FloodEx completely free — no credit card, no sales call, no commitment. Encircle has no free option.', bg: 'bg-accent/5' },
  { icon: Shield, title: 'No Lock-In Contracts', desc: 'Pay month-to-month with a 30-day money-back guarantee. Cancel anytime — no annual commitments.', bg: 'bg-primary/5' },
  { icon: Smartphone, title: 'Australian-Built', desc: 'Local pricing in AUD, Australian-hosted data, and support from a team that understands the local market.', bg: 'bg-accent/5' },
  { icon: Clock, title: 'Simpler to Learn', desc: 'Purpose-built and streamlined — your team can be productive on day one, not after weeks of training.', bg: 'bg-primary/5' },
  { icon: Users, title: 'Transparent Pricing', desc: 'See all pricing on our website. No need to book a sales call or request a quote to know what it costs.', bg: 'bg-accent/5' },
];

function FeatureIcon({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-5 w-5 text-primary mx-auto" />;
  if (value === 'partial') return <span className="text-xs text-muted-foreground mx-auto block text-center">Partial</span>;
  return <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
}

export default function EncircleAlternativePage() {
  const structuredData = [
    generateBreadcrumbData([
      { name: 'Home', path: '/' },
      { name: 'Compare', path: '/compare' },
      { name: 'Encircle Alternative', path: '/encircle-alternative' },
    ]),
    generateFAQData(faqs),
  ];

  return (
    <MarketingLayout>
      <SEOHead
        title="Best Encircle Alternative 2026 | FloodEx – 80% Cheaper, Same Features"
        description="Looking for an Encircle alternative? FloodEx offers the same core restoration documentation features — moisture tracking, photo annotation, IICRC reports — from $49/mo vs Encircle's $250+/mo. Free tier available."
        keywords="Encircle alternative, Encircle competitor, cheaper than Encircle, Encircle vs FloodEx, Xactimate alternative, restoration software comparison, best Encircle alternative 2026, Encircle pricing alternative, water damage software cheaper"
        canonicalPath="/encircle-alternative"
        structuredData={structuredData}
      />

      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">Encircle Alternative</div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} className="text-[clamp(44px,7vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-foreground max-w-[850px] mb-7">
          The best{' '}
          <span className="bg-accent text-white px-3 py-1 inline-block rounded-xl -rotate-1 my-1">Encircle alternative</span>
          <br />for restoration teams
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[clamp(16px,1.8vw,20px)] text-muted-foreground max-w-[600px] leading-[1.7] font-medium mb-12">
          All the documentation features you need — moisture tracking, photo annotation, IICRC-compliant reports — at 80% less than Encircle. Free tier available. No contracts. No sales calls.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.5 }} className="flex items-center gap-3 flex-wrap">
          <Link to="/auth?tab=signup">
            <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
          </Link>
          <Link to="/compare">
            <Button variant="outline" className="rounded-full border-border/60 text-foreground font-bold text-base py-4 px-8 hover:bg-secondary">Full comparison table</Button>
          </Link>
        </motion.div>
      </section>

      {/* Advantages Grid */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">
              Why teams switch from Encircle to FloodEx
            </h2>
          </AnimateIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advantages.map((a) => (
              <StaggerItem key={a.title}>
                <div className={`${a.bg} border border-border/40 rounded-3xl p-7 flex flex-col gap-4 h-full hover:shadow-lg transition-shadow`}>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <a.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-[17px] font-extrabold tracking-tight text-foreground">{a.title}</h3>
                  <p className="text-[13px] text-foreground/60 leading-[1.6] font-medium">{a.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <div className="py-4" />

      {/* Feature Comparison Table */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-5xl mx-auto">
        <AnimateIn>
          <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">
            FloodEx vs Encircle vs Xactimate
          </h2>
        </AnimateIn>
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-4 px-3 font-extrabold text-sm text-foreground">Feature</th>
                <th className="text-center py-4 px-3 font-extrabold text-sm text-primary">FloodEx</th>
                <th className="text-center py-4 px-3 font-extrabold text-sm text-foreground">Encircle</th>
                <th className="text-center py-4 px-3 font-extrabold text-sm text-foreground">Xactimate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <tr className="bg-accent/5">
                <td className="py-3 px-3 text-sm text-foreground font-bold">Starting price</td>
                <td className="text-center py-3 px-3 text-sm font-bold text-primary">Free / $49 AUD</td>
                <td className="text-center py-3 px-3 text-sm text-muted-foreground">~$250 USD/mo</td>
                <td className="text-center py-3 px-3 text-sm text-muted-foreground">Custom quote</td>
              </tr>
              {comparisonFeatures.map((row, i) => (
                <tr key={i} className="hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-3 text-sm text-foreground font-medium">{row.feature}</td>
                  <td className="text-center py-3 px-3"><FeatureIcon value={row.floodex} /></td>
                  <td className="text-center py-3 px-3"><FeatureIcon value={row.encircle} /></td>
                  <td className="text-center py-3 px-3"><FeatureIcon value={row.xactimate} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <AnimateIn>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">
              Encircle alternative FAQ
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
        </div>
      </section>

      <div className="py-4" />

      {/* CTA */}
      <div className="mx-4 md:mx-8 my-8 rounded-[32px] bg-foreground px-6 md:px-12 py-20 md:py-28 text-center">
        <AnimateIn>
          <h2 className="text-[clamp(34px,5vw,60px)] font-black leading-[1.0] tracking-[-0.04em] text-white mb-4">
            Switch to FloodEx<br /><span className="text-accent">and save 80%</span>
          </h2>
          <p className="text-[17px] text-white/40 font-medium mb-12 max-w-lg mx-auto">
            Same features. Fraction of the price. Free to try. No contracts.
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
