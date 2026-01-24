import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { StatsCounter } from '@/components/marketing/StatsCounter';
import {
  ArrowRight,
  Target,
  Users,
  Lightbulb,
  Shield,
  Heart,
  Zap,
  Building2,
  ClipboardCheck,
  Droplets,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 lg:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              About FloodEx
            </span>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
              Built by Restoration Pros,{' '}
              <span className="text-primary">for Restoration Pros</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We've been in your boots. We know the challenges of documenting water damage 
              in the field, tracking moisture readings, and creating reports that satisfy 
              adjusters. That's why we built FloodEx.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Target className="h-4 w-4" />
                Our Mission
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Empowering Restoration Teams to Work Smarter
              </h2>
              <p className="text-muted-foreground mb-6">
                Every day, thousands of restoration professionals help families recover from 
                water damage, fires, and natural disasters. It's hard, essential work—and 
                it shouldn't be bogged down by paperwork.
              </p>
              <p className="text-muted-foreground mb-6">
                Our mission is to give restoration teams the digital tools they need to 
                document faster, report smarter, and get paid quicker—so they can focus 
                on what matters most: helping people restore their homes and lives.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">500+</div>
                  <p className="text-sm text-muted-foreground">Companies Trust Us</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                  <p className="text-sm text-muted-foreground">Jobs Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">1M+</div>
                  <p className="text-sm text-muted-foreground">Readings Logged</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">99%</div>
                  <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Lightbulb className="h-4 w-4" />
              Our Story
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold">
              From Frustration to Innovation
            </h2>
          </div>

          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-muted-foreground text-center mb-8">
              FloodEx was born from a simple observation: restoration professionals spend 
              too much time on documentation and not enough time on restoration.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center p-6 rounded-xl border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">The Problem</h3>
                <p className="text-sm text-muted-foreground">
                  Paper forms, manual calculations, and hours spent creating reports.
                </p>
              </div>
              <div className="text-center p-6 rounded-xl border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">The Insight</h3>
                <p className="text-sm text-muted-foreground">
                  Every tech has a smartphone—why not use it for documentation?
                </p>
              </div>
              <div className="text-center p-6 rounded-xl border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">The Solution</h3>
                <p className="text-sm text-muted-foreground">
                  A mobile-first platform purpose-built for water damage restoration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Heart className="h-4 w-4" />
              Our Values
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold">
              What We Stand For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Speed</h3>
              <p className="text-sm text-muted-foreground">
                Time is money in restoration. We build tools that save hours, not minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Reliability</h3>
              <p className="text-sm text-muted-foreground">
                Your data is critical. We ensure 99.9% uptime and secure cloud storage.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Partnership</h3>
              <p className="text-sm text-muted-foreground">
                We're not just a vendor—we're your technology partner in restoration.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Innovation</h3>
              <p className="text-sm text-muted-foreground">
                We constantly evolve based on feedback from real restoration pros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              FloodEx by the Numbers
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <StatsCounter
              value={500}
              suffix="+"
              label="Restoration Companies"
              icon={Building2}
              delay={0}
            />
            <StatsCounter
              value={50000}
              suffix="+"
              label="Jobs Completed"
              icon={ClipboardCheck}
              delay={200}
            />
            <StatsCounter
              value={1000000}
              suffix="+"
              label="Readings Logged"
              icon={Droplets}
              delay={400}
            />
            <StatsCounter
              value={10000}
              suffix="+"
              label="Reports Generated"
              icon={Shield}
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Join the FloodEx Community
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Become part of a growing network of restoration professionals who are 
            transforming how they document and report.
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
