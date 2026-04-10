import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/marketing/AnimateIn';
import { motion } from 'framer-motion';
import { Zap, Shield, Users, Lightbulb } from 'lucide-react';

const values = [
  { icon: Zap, title: 'Speed', desc: 'Time is money in restoration. We build tools that save hours, not minutes.', bg: 'bg-[hsl(345,40%,92%)]' },
  { icon: Shield, title: 'Reliability', desc: 'Your data is critical. We ensure 99.9% uptime and secure cloud storage.', bg: 'bg-[hsl(283,50%,94%)]' },
  { icon: Users, title: 'Partnership', desc: "We're not just a vendor — we're your technology partner in restoration.", bg: 'bg-[hsl(263,45%,93%)]' },
  { icon: Lightbulb, title: 'Innovation', desc: 'We constantly evolve based on feedback from real restoration pros.', bg: 'bg-[hsl(325,70%,94%)]' },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-[hsl(260,8%,46%)] mb-4">About FloodEx</div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} className="text-[clamp(44px,7vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-[hsl(260,20%,16%)] max-w-[850px] mb-7">
          Built by restoration pros,{' '}
          <span className="bg-primary text-white px-3 py-1 inline-block rounded-xl -rotate-1 my-1">for restoration pros</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[clamp(16px,1.8vw,20px)] text-[hsl(260,8%,46%)] max-w-[540px] leading-[1.7] font-medium">
          We understand the challenges of documenting water damage in the field, tracking moisture readings, and creating reports that satisfy adjusters. That's why we built FloodEx.
        </motion.p>
      </section>

      {/* Mission */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-[hsl(37,22%,90%)] px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <AnimateIn>
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-[hsl(260,8%,46%)] mb-4">Our mission</div>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-[hsl(260,20%,16%)] mb-4">
              Empowering teams<br />to work smarter
            </h2>
            <p className="text-[15px] text-[hsl(260,8%,46%)] leading-[1.7] font-medium mb-6">
              Every day, restoration professionals help families recover from water damage, floods, and natural disasters. It's hard, essential work — and it shouldn't be bogged down by paperwork.
            </p>
            <p className="text-[15px] text-[hsl(260,8%,46%)] leading-[1.7] font-medium">
              Our mission is to give restoration teams the digital tools they need to document faster, report smarter, and get paid quicker — so they can focus on what matters most.
            </p>
          </AnimateIn>
          <AnimateIn>
            <div className="bg-white border border-[hsl(260,12%,82%)]/40 rounded-3xl p-8">
              <h3 className="font-extrabold text-[17px] mb-4 text-[hsl(260,20%,16%)]">Operated by</h3>
              <p className="text-[hsl(260,8%,46%)] font-medium mb-2">Local Carpet Cleaning Pty Ltd</p>
              <p className="text-sm text-[hsl(260,8%,46%)]/70">ABN 15 682 871 192</p>
              <div className="mt-6 pt-6 border-t border-[hsl(260,12%,82%)]/40">
                <p className="text-[13px] text-[hsl(260,8%,46%)] leading-[1.7] font-medium">
                  FloodEx is an Australian-built platform designed from the ground up for the unique needs of flood and water damage restoration professionals.
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="py-4" />

      {/* Story */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-6xl mx-auto">
        <AnimateIn>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-[hsl(260,8%,46%)] mb-4">Our story</div>
          <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-[hsl(260,20%,16%)] mb-14">
            From frustration<br />to innovation
          </h2>
        </AnimateIn>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'The Problem', desc: 'Paper forms, manual calculations, and hours spent creating reports.', bg: 'bg-[hsl(345,40%,92%)]' },
            { step: '2', title: 'The Insight', desc: 'Every tech has a smartphone — why not use it for documentation?', bg: 'bg-[hsl(283,50%,94%)]' },
            { step: '3', title: 'The Solution', desc: 'A mobile-first platform purpose-built for water damage restoration.', bg: 'bg-[hsl(325,70%,94%)]' },
          ].map((item) => (
            <StaggerItem key={item.step}>
              <div className={`${item.bg} border border-[hsl(260,12%,82%)]/40 rounded-3xl p-8 h-full`}>
                <div className="w-9 h-9 rounded-full bg-[hsl(260,20%,16%)] text-[hsl(37,30%,94%)] text-[13px] font-black flex items-center justify-center mb-6">
                  {item.step}
                </div>
                <h4 className="text-[17px] font-extrabold tracking-tight mb-3 text-[hsl(260,20%,16%)]">{item.title}</h4>
                <p className="text-[13px] text-[hsl(260,8%,46%)] leading-[1.65] font-medium">{item.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Values */}
      <section className="mx-4 md:mx-8 rounded-[32px] bg-[hsl(37,22%,90%)] px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-[hsl(260,8%,46%)] mb-4">Our values</div>
            <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-[hsl(260,20%,16%)] mb-14">What we stand for</h2>
          </AnimateIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <div className={`${v.bg} border border-[hsl(260,12%,82%)]/40 rounded-3xl p-7 flex flex-col gap-4 h-full hover:shadow-lg transition-shadow`}>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <v.icon className="w-6 h-6 text-[hsl(260,20%,16%)]" />
                  </div>
                  <h4 className="text-[17px] font-extrabold tracking-tight text-[hsl(260,20%,16%)]">{v.title}</h4>
                  <p className="text-[13px] text-[hsl(260,20%,16%)]/60 leading-[1.6] font-medium">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <div className="py-4" />

      {/* CTA */}
      <div className="mx-4 md:mx-8 my-8 rounded-[32px] bg-[hsl(260,20%,16%)] px-6 md:px-12 py-20 md:py-28 text-center">
        <AnimateIn>
          <h2 className="text-[clamp(34px,5vw,60px)] font-black leading-[1.0] tracking-[-0.04em] text-[hsl(37,30%,94%)] mb-4">
            Ready to<br /><span className="text-primary">get started?</span>
          </h2>
          <p className="text-[17px] text-white/40 font-medium mb-12 max-w-lg mx-auto">
            Try FloodEx free for 14 days — no credit card required.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/auth?tab=signup">
              <Button className="rounded-full shadow-none border-none bg-primary text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="rounded-full border-white/15 text-white/50 hover:bg-white/5 hover:text-white/70 text-base py-4 px-8">Contact us</Button>
            </Link>
          </div>
        </AnimateIn>
      </div>
    </MarketingLayout>
  );
}
