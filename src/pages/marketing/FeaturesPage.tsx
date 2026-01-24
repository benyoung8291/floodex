import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { AppMockup } from '@/components/marketing/AppMockup';
import {
  Droplets,
  Camera,
  FileText,
  Users,
  Activity,
  Calculator,
  ArrowRight,
  Check,
  MapPin,
  Clock,
  Shield,
  Smartphone,
  Cloud,
  BarChart3,
  Layers,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const featureCategories = [
  {
    id: 'moisture',
    title: 'Moisture Tracking',
    icon: Droplets,
    description: 'Comprehensive moisture monitoring with automatic calculations and trend analysis.',
    features: [
      'Create drying chambers for each affected area',
      'Log temperature, humidity, and moisture readings',
      'Automatic g/kg humidity ratio calculations',
      'Dew point and vapour pressure calculations',
      'Visual trend charts showing drying progress',
      'Outdoor baseline comparison readings',
      'Material-specific moisture standards',
    ],
    mockup: 'readings' as const,
  },
  {
    id: 'photos',
    title: 'Photo Documentation',
    icon: Camera,
    description: 'Capture, annotate, and organise visual evidence for every job.',
    features: [
      'Unlimited photo storage per job',
      'Built-in annotation tools (arrows, circles, text)',
      'Category organisation (before, during, after)',
      'Automatic timestamp and location data',
      'Thermal image support',
      'Batch upload from camera roll',
      'High-resolution export for reports',
    ],
    mockup: 'photos' as const,
  },
  {
    id: 'reports',
    title: 'Professional Reports',
    icon: FileText,
    description: 'Generate polished, insurance-ready reports with a single click.',
    features: [
      'One-click PDF generation',
      'Multiple report templates',
      'Custom branding (logo, colours)',
      'Comprehensive drying logs',
      'Photo documentation sections',
      'Equipment usage summaries',
      'Digital signature capture',
    ],
    mockup: 'reports' as const,
  },
  {
    id: 'team',
    title: 'Team Collaboration',
    icon: Users,
    description: 'Work together seamlessly with role-based access and real-time updates.',
    features: [
      'Invite unlimited team members',
      'Role-based permissions (Admin, Tech, Viewer)',
      'Real-time sync across devices',
      'Job assignment and tracking',
      'Activity logs and audit trails',
      'Share job links with customers',
      'Comments and notes on jobs',
    ],
    mockup: 'dashboard' as const,
  },
  {
    id: 'equipment',
    title: 'Equipment Tracking',
    icon: Activity,
    description: 'Monitor and manage all your restoration equipment across jobs.',
    features: [
      'Equipment inventory management',
      'Assign equipment to jobs',
      'Track runtime hours',
      'Automatic cost calculations',
      'Maintenance scheduling',
      'Equipment location tracking',
      'QR code scanning support',
    ],
    mockup: 'equipment' as const,
  },
  {
    id: 'estimates',
    title: 'Cost Estimates',
    icon: Calculator,
    description: 'Create professional estimates and track job costs accurately.',
    features: [
      'Customisable estimate templates',
      'Line item cost tracking',
      'Labour and material categories',
      'Equipment rental calculations',
      'Customer-ready PDF estimates',
      'Margin and markup settings',
      'Cost vs. estimate comparisons',
    ],
    mockup: 'estimates' as const,
  },
];

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 lg:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Features
            </span>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
              Everything You Need to{' '}
              <span className="text-primary">Run Restoration Jobs</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              From first inspection to final report—FloodEx gives your team the tools to document 
              faster, track moisture accurately, and generate professional reports that get claims approved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?tab=signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections with App Mockups */}
      {featureCategories.map((category, index) => (
        <section
          key={category.id}
          id={category.id}
          className={cn(
            "py-20 lg:py-32",
            index % 2 === 0 ? "bg-background" : "bg-card"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn(
              "grid lg:grid-cols-2 gap-12 lg:gap-20 items-center",
              index % 2 === 1 && "lg:flex-row-reverse"
            )}>
              {/* Content */}
              <div className={cn(index % 2 === 1 && "lg:order-2")}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <category.icon className="h-4 w-4" />
                  {category.title}
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  {category.description}
                </h2>
                <ul className="space-y-3 mt-8">
                  {category.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* App Mockup */}
              <div className={cn(
                "flex justify-center",
                index % 2 === 1 && "lg:order-1"
              )}>
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 opacity-50" />
                  <AppMockup variant={category.mockup} className="relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Comparison Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              FloodEx vs. The Old Way
            </h2>
            <p className="text-lg text-muted-foreground">
              See how FloodEx compares to spreadsheets and paper documentation.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 font-medium">
                    <div className="inline-flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-primary" />
                      FloodEx
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">Spreadsheets</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">Paper</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { feature: 'Mobile data capture', floodex: true, spreadsheets: false, paper: false },
                  { feature: 'Automatic humidity calculations', floodex: true, spreadsheets: false, paper: false },
                  { feature: 'Real-time team sync', floodex: true, spreadsheets: true, paper: false },
                  { feature: 'Photo annotations', floodex: true, spreadsheets: false, paper: false },
                  { feature: 'One-click reports', floodex: true, spreadsheets: false, paper: false },
                  { feature: 'Equipment tracking', floodex: true, spreadsheets: true, paper: false },
                  { feature: 'Works offline', floodex: true, spreadsheets: false, paper: true },
                  { feature: 'No data entry errors', floodex: true, spreadsheets: false, paper: false },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-4 px-4">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {row.floodex ? (
                        <Check className="h-5 w-5 text-success mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.spreadsheets ? (
                        <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.paper ? (
                        <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Plus Everything Else You Need
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Smartphone, title: 'Mobile First', description: 'Works on any device, anywhere' },
              { icon: Cloud, title: 'Cloud Storage', description: 'Secure, unlimited data storage' },
              { icon: MapPin, title: 'Job Locations', description: 'Map view of all active jobs' },
              { icon: BarChart3, title: 'Analytics', description: 'Insights into your business' },
              { icon: Shield, title: 'Data Security', description: '256-bit encryption standard' },
              { icon: Clock, title: 'Work Logs', description: 'Track time spent on each job' },
              { icon: Layers, title: 'Floor Plans', description: 'Upload and annotate blueprints' },
              { icon: Building2, title: 'Multi-Location', description: 'Manage multiple offices' },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                <feature.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Experience All Features Free
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Start your 14-day trial today. No credit card required.
          </p>
          <Link to="/auth?tab=signup">
            <Button size="lg" className="text-lg px-10 py-6">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
