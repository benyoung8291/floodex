import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import {
  ArrowRight,
  Target,
  Lightbulb,
  Shield,
  Heart,
  Zap,
  Users,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 lg:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              About FloodEx
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
              Built by Restoration Pros,{' '}
              <span className="text-primary">for Restoration Pros</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              We understand the challenges of documenting water damage in the field, tracking moisture
              readings, and creating reports that satisfy adjusters. That's why we built FloodEx.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20 lg:py-32 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Target className="h-4 w-4" />
                Our Mission
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
                Empowering Restoration Teams to Work Smarter
              </h2>
              <p className="text-muted-foreground mb-6">
                Every day, restoration professionals help families recover from water damage, floods, 
                and natural disasters. It's hard, essential work — and it shouldn't be bogged down by paperwork.
              </p>
              <p className="text-muted-foreground">
                Our mission is to give restoration teams the digital tools they need to document faster, 
                report smarter, and get paid quicker — so they can focus on what matters most: helping 
                people restore their homes and lives.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 sm:p-8 lg:p-12">
              <h3 className="font-bold text-lg mb-4">Operated by</h3>
              <p className="text-muted-foreground mb-2">Local Carpet Cleaning Pty Ltd</p>
              <p className="text-sm text-muted-foreground/70">ABN 15 682 871 192</p>
              <div className="mt-6 pt-6 border-t border-primary/20">
                <p className="text-sm text-muted-foreground">
                  FloodEx is an Australian-built platform designed from the ground up for the 
                  unique needs of flood and water damage restoration professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Lightbulb className="h-4 w-4" />
              Our Story
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              From Frustration to Innovation
            </h2>
          </div>

          <p className="text-muted-foreground text-center mb-10">
            FloodEx was born from a simple observation: restoration professionals spend too much 
            time on documentation and not enough time on restoration.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: '1', title: 'The Problem', desc: 'Paper forms, manual calculations, and hours spent creating reports.' },
              { step: '2', title: 'The Insight', desc: 'Every tech has a smartphone — why not use it for documentation?' },
              { step: '3', title: 'The Solution', desc: 'A mobile-first platform purpose-built for water damage restoration.' },
            ].map((item) => (
              <div key={item.step} className="text-center p-6 rounded-xl border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 lg:py-32 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Heart className="h-4 w-4" />
              Our Values
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">What We Stand For</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Zap, title: 'Speed', desc: 'Time is money in restoration. We build tools that save hours, not minutes.' },
              { icon: Shield, title: 'Reliability', desc: 'Your data is critical. We ensure 99.9% uptime and secure cloud storage.' },
              { icon: Users, title: 'Partnership', desc: 'We\'re not just a vendor — we\'re your technology partner in restoration.' },
              { icon: Lightbulb, title: 'Innovation', desc: 'We constantly evolve based on feedback from real restoration pros.' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Try FloodEx free for 14 days — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
