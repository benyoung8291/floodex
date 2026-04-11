import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { SEOHead, generateBreadcrumbData } from '@/components/marketing/SEOHead';
import { AnimateIn, StaggerContainer, StaggerItem, ScaleIn } from '@/components/marketing/AnimateIn';
import { AppMockup } from '@/components/marketing/AppMockup';
import { motion } from 'framer-motion';
import {
  Droplets, Camera, FileText, Users, Activity, Calculator,
  Check, Smartphone, Cloud, MapPin, Clock, Shield, BarChart3, Layers, Building2,
} from 'lucide-react';

const featureCategories = [
  {
    title: 'Moisture Tracking',
    icon: Droplets,
    description: 'Comprehensive moisture monitoring with automatic calculations and trend analysis.',
    features: [
      'Create drying chambers for each affected area',
      'Log temperature, humidity, and moisture readings',
      'Automatic g/kg humidity ratio calculations',
      'Visual trend charts showing drying progress',
      'Outdoor baseline comparison readings',
    ],
    mockup: 'readings' as const,
  },
  {
    title: 'Photo Documentation',
    icon: Camera,
    description: 'Capture, annotate, and organise visual evidence for every job.',
    features: [
      'Unlimited photo storage per job',
      'Built-in annotation tools (arrows, circles, text)',
      'Category organisation (before, during, after)',
      'Automatic timestamp and location data',
      'High-resolution export for reports',
    ],
    mockup: 'photos' as const,
  },
  {
    title: 'Professional Reports',
    icon: FileText,
    description: 'Generate polished, insurance-ready reports with a single click.',
    features: [
      'One-click PDF generation',
      'Multiple report templates',
      'Custom branding (logo, colours)',
      'Comprehensive drying logs',
      'Digital signature capture',
    ],
    mockup: 'reports' as const,
  },
  {
    title: 'Team Collaboration',
    icon: Users,
    description: 'Work together seamlessly with role-based access and real-time updates.',
    features: [
      'Invite unlimited team members',
      'Role-based permissions',
      'Real-time sync across devices',
      'Share job links with customers',
      'Activity logs and audit trails',
    ],
    mockup: 'dashboard' as const,
  },
];

const extraFeatures = [
  { icon: Smartphone, title: 'Mobile First', desc: 'Works on any device' },
  { icon: Cloud, title: 'Cloud Storage', desc: 'Secure, unlimited data' },
  { icon: MapPin, title: 'Job Locations', desc: 'Map view of all jobs' },
  { icon: BarChart3, title: 'Analytics', desc: 'Business insights' },
  { icon: Shield, title: 'Data Security', desc: '256-bit encryption' },
  { icon: Clock, title: 'Work Logs', desc: 'Track time per job' },
  { icon: Layers, title: 'Floor Plans', desc: 'Upload & annotate' },
  { icon: Building2, title: 'Multi-Location', desc: 'Multiple offices' },
];

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      <SEOHead
        title="Flood Restoration Software Features | FloodEx – Moisture Tracking, Reports, Equipment & More"
        description="Explore FloodEx features: moisture tracking with auto g/kg calculations, photo documentation with annotations, one-click IICRC-compliant PDF reports, equipment tracking, psychrometric calculations, and team collaboration."
        keywords="flood restoration software features, moisture tracking features, photo documentation restoration, one-click PDF reports, equipment tracking software, psychrometric calculator, team collaboration restoration, drying trend charts, IICRC compliant documentation"
        canonicalPath="/features"
        structuredData={generateBreadcrumbData([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
        ])}
      />
      {/* Hero */}
      <section className="px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-4">Features</div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }} className="text-[clamp(44px,7vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-foreground max-w-[850px] mb-7">
          Everything you need to{' '}
          <span className="bg-accent text-white px-3 py-1 inline-block rounded-xl -rotate-1 my-1">run restoration jobs</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[clamp(16px,1.8vw,20px)] text-muted-foreground max-w-[540px] leading-[1.7] font-medium mb-12">
          From first inspection to final report — FloodEx gives your team the tools to document faster, track moisture accurately, and generate professional reports.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.5 }} className="flex items-center gap-3 flex-wrap">
          <Link to="/auth?tab=signup">
            <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
          </Link>
          <Link to="/pricing">
            <Button variant="outline" className="rounded-full border-border/60 text-foreground font-bold text-base py-4 px-8 hover:bg-secondary">View pricing</Button>
          </Link>
        </motion.div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, index) => (
        <section
          key={category.title}
          className={index % 2 === 0
            ? "mx-4 md:mx-8 rounded-[32px] bg-secondary px-6 md:px-12 py-20 md:py-28 mb-4"
            : "mx-4 md:mx-8 rounded-[32px] bg-foreground px-6 md:px-12 py-20 md:py-28 mb-4"
          }
        >
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className={index % 2 === 1 ? "md:order-2" : ""}>
              <AnimateIn>
                <div className={`text-xs font-extrabold uppercase tracking-[0.12em] mb-4 ${index % 2 === 1 ? "text-white/30" : "text-muted-foreground"}`}>{category.title}</div>
                <h2 className={`text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] mb-4 ${index % 2 === 1 ? "text-white" : "text-foreground"}`}>
                  {category.description}
                </h2>
                <ul className="flex flex-col gap-4 mt-8">
                  {category.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-3 text-sm font-medium leading-[1.6] ${index % 2 === 1 ? "text-white/50" : "text-muted-foreground"}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-[2px] ${index % 2 === 1 ? "bg-accent/15" : "bg-primary/10"}`}>
                        <Check className={`w-3 h-3 ${index % 2 === 1 ? "text-accent" : "text-primary"}`} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </AnimateIn>
            </div>
            <div className={index % 2 === 1 ? "md:order-1" : ""}>
              <ScaleIn>
                <AppMockup variant={category.mockup} className="relative z-10" />
              </ScaleIn>
            </div>
          </div>
        </section>
      ))}

      {/* Extra Features Grid */}
      <section className="px-4 md:px-8 py-20 md:py-28 max-w-6xl mx-auto">
        <AnimateIn>
          <h2 className="text-[clamp(34px,4.5vw,56px)] font-black leading-[1.0] tracking-[-0.04em] text-foreground mb-14">Plus everything else</h2>
        </AnimateIn>
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {extraFeatures.map((f) => (
            <StaggerItem key={f.title}>
              <div className="bg-white border border-border/40 rounded-3xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all h-full">
                <f.icon className="h-7 w-7 text-primary mb-3" />
                <h3 className="font-extrabold text-[15px] mb-1 text-foreground">{f.title}</h3>
                <p className="text-[13px] text-muted-foreground font-medium">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <div className="mx-4 md:mx-8 my-8 rounded-[32px] bg-foreground px-6 md:px-12 py-20 md:py-28 text-center">
        <AnimateIn>
          <h2 className="text-[clamp(34px,5vw,60px)] font-black leading-[1.0] tracking-[-0.04em] text-white mb-4">
            Experience all features<br /><span className="text-accent">free for 14 days</span>
          </h2>
          <p className="text-[17px] text-white/40 font-medium mb-12 max-w-lg mx-auto">
            No credit card required. Start documenting smarter today.
          </p>
          <Link to="/auth?tab=signup">
            <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">Start free trial →</Button>
          </Link>
        </AnimateIn>
      </div>
    </MarketingLayout>
  );
}
