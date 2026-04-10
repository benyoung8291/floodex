import { Link } from 'react-router-dom';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { ContactForm } from '@/components/marketing/ContactForm';
import { AnimateIn } from '@/components/marketing/AnimateIn';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 md:pt-24 pb-12 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">Contact</div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} className="text-[clamp(44px,7vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-foreground max-w-[850px] mb-7">
          Get in touch
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[clamp(16px,1.8vw,20px)] text-muted-foreground max-w-[540px] leading-[1.7] font-medium">
          Have questions about FloodEx? Fill out the form below and we'll get back to you within 24 hours.
        </motion.p>
      </section>

      {/* Contact Section */}
      <section className="px-4 md:px-8 pb-20 md:pb-28 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <AnimateIn>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[15px] mb-1 text-foreground">Preferred Contact</h3>
                    <p className="text-[13px] text-muted-foreground font-medium leading-[1.6]">
                      Use the contact form to reach us. We respond to every enquiry.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[15px] mb-1 text-foreground">Response Time</h3>
                    <p className="text-[13px] text-muted-foreground font-medium leading-[1.6]">We aim to respond within 24 hours, Monday to Friday.</p>
                  </div>
                </div>
              </div>
            </AnimateIn>

            <AnimateIn>
              <div className="pt-6 border-t border-border/40">
                <h3 className="font-extrabold text-[15px] mb-4 text-foreground">Quick Links</h3>
                <div className="space-y-3">
                  <Link to="/pricing" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium no-underline">
                    <HelpCircle className="h-4 w-4" />
                    View Pricing FAQ
                  </Link>
                  <Link to="/features" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium no-underline">
                    <MessageCircle className="h-4 w-4" />
                    Explore Features
                  </Link>
                </div>
              </div>
            </AnimateIn>

            <AnimateIn>
              <div className="pt-6 border-t border-border/40">
                <p className="text-xs text-muted-foreground/50">
                  Local Carpet Cleaning Pty Ltd<br />
                  ABN 15 682 871 192
                </p>
              </div>
            </AnimateIn>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <AnimateIn>
              <div className="bg-white rounded-3xl border border-border/40 p-6 sm:p-8">
                <h2 className="text-lg font-extrabold mb-6 text-foreground">Send us a message</h2>
                <ContactForm />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
