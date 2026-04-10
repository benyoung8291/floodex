import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/marketing/AnimateIn';
import { FAQAccordion } from '@/components/marketing/FAQAccordion';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';
import { motion } from 'framer-motion';
import { Check, X, Shield, Clock, CreditCard } from 'lucide-react';

export default function PricingPage() {
  const { data: tiers, isLoading } = useSubscriptionTiers();
  const sortedTiers = tiers?.sort((a, b) => a.monthly_price - b.monthly_price) || [];

  const featureMatrix = [
    { feature: 'Jobs per month', values: sortedTiers.map(t => String(t.jobs_included)) },
    { feature: 'Moisture readings', values: sortedTiers.map(t => t.readings_included.toLocaleString()) },
    { feature: 'Unlimited photos', values: sortedTiers.map(() => true) },
    { feature: 'Photo annotations', values: sortedTiers.map(() => true) },
    { feature: 'PDF reports', values: sortedTiers.map(() => true) },
    { feature: 'Team members', values: ['1', '3', '10', 'Unlimited'] },
    { feature: 'Equipment tracking', values: [false, true, true, true] },
    { feature: 'Cost estimates', values: [false, true, true, true] },
    { feature: 'Custom branding', values: [false, false, true, true] },
    { feature: 'Priority support', values: [false, false, true, true] },
  ];

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">Pricing</div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} className="text-[clamp(44px,7vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-foreground max-w-[850px] mb-7">
          Simple pricing.<br />
          <span className="bg-accent text-white px-3 py-1 inline-block rounded-xl -rotate-1 my-1">Free to start.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[clamp(16px,1.8vw,20px)] text-muted-foreground max-w-[540px] leading-[1.7] font-medium mb-14">
          Start free, upgrade when you're ready. Pay only for what you use. No hidden fees, no surprises.
        </motion.p>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[400px] rounded-3xl bg-secondary animate-pulse" />
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
                    <ul className="flex-1 flex flex-col gap-[9px] mb-6">
                      {['Unlimited photos', 'PDF reports', 'Photo annotations'].map((f) => (
                        <li key={f} className={`text-[13px] font-semibold flex items-start gap-2 ${isFeatured ? "text-white/55" : "text-foreground/70"}`}>
                          <span className={`font-black shrink-0 ${isFeatured ? "text-accent" : "text-primary"}`}>✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/auth?tab=signup">
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
      </section>

      {/* Trust Badges */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row flex-wrap justify-center items-center gap-8 lg:gap-16">
          {[
            { icon: Shield, title: 'Money-Back Guarantee', desc: '30-day full refund' },
            { icon: Clock, title: '14-Day Free Trial', desc: 'No credit card required' },
            { icon: CreditCard, title: 'Cancel Anytime', desc: 'No long-term contracts' },
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

      {/* Feature Comparison Table */}
      {sortedTiers.length > 0 && (
        <section className="px-4 md:px-8 py-20 md:py-28 max-w-6xl mx-auto">
          <AnimateIn>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">Compare all features</h2>
          </AnimateIn>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-4 px-3 font-extrabold text-sm text-foreground">Feature</th>
                  {sortedTiers.map((tier) => (
                    <th key={tier.id} className={`text-center py-4 px-2 font-extrabold text-sm ${tier.name.toLowerCase() === 'pro' ? "text-primary" : "text-foreground"}`}>
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {featureMatrix.map((row, i) => (
                  <tr key={i} className="hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-3 text-sm text-foreground font-medium">{row.feature}</td>
                    {row.values.map((value, j) => (
                      <td key={j} className="text-center py-3 px-2">
                        {typeof value === 'boolean' ? (
                          value ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="text-sm font-mono text-foreground">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

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
              <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
            </Link>
          </div>
        </AnimateIn>
      </div>
    </MarketingLayout>
  );
}
