import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { CompetitorCard } from '@/components/marketing/CompetitorCard';
import {
  ArrowRight, Zap, DollarSign, Smartphone, Clock, Shield, Users,
} from 'lucide-react';

const features = [
  { name: 'Mobile-first design', category: 'Core Documentation' },
  { name: 'Moisture tracking with auto calculations', category: 'Core Documentation' },
  { name: 'Photo documentation', category: 'Core Documentation' },
  { name: 'Photo annotations', category: 'Core Documentation' },
  { name: 'Built-in floor plans (mud maps)', category: 'Core Documentation' },
  { name: 'Equipment tracking', category: 'Core Documentation' },
  { name: 'Work logging', category: 'Core Documentation' },
  { name: 'Damage assessments', category: 'Core Documentation' },
  { name: 'One-click PDF reports', category: 'Reporting' },
  { name: 'Insurance-compliant format', category: 'Reporting' },
  { name: 'Custom company branding', category: 'Reporting' },
  { name: 'Thermal readings section', category: 'Reporting' },
  { name: 'Digital signatures', category: 'Reporting' },
  { name: 'Comprehensive report template', category: 'Reporting' },
  { name: 'Easy learning curve', category: 'Usability' },
  { name: 'Offline capability', category: 'Usability' },
  { name: 'Team collaboration', category: 'Usability' },
  { name: 'Quick onboarding (< 1 hour)', category: 'Usability' },
  { name: 'Free tier available', category: 'Pricing' },
  { name: 'Transparent pricing', category: 'Pricing' },
  { name: 'No long-term contracts', category: 'Pricing' },
  { name: 'Pay-as-you-grow model', category: 'Pricing' },
];

const competitors = [
  {
    name: 'FloodEx', isHighlighted: true,
    features: Object.fromEntries(features.map(f => [f.name, true])),
  },
  {
    name: 'Encircle',
    features: {
      'Mobile-first design': true, 'Moisture tracking with auto calculations': true,
      'Photo documentation': true, 'Photo annotations': true,
      'Built-in floor plans (mud maps)': false, 'Equipment tracking': true,
      'Work logging': true, 'Damage assessments': true,
      'One-click PDF reports': true, 'Insurance-compliant format': true,
      'Custom company branding': true, 'Thermal readings section': true,
      'Digital signatures': true, 'Comprehensive report template': true,
      'Easy learning curve': 'partial', 'Offline capability': true,
      'Team collaboration': true, 'Quick onboarding (< 1 hour)': false,
      'Free tier available': false, 'Transparent pricing': false,
      'No long-term contracts': false, 'Pay-as-you-grow model': false,
    },
  },
  {
    name: 'Xactimate',
    features: {
      'Mobile-first design': false, 'Moisture tracking with auto calculations': 'partial',
      'Photo documentation': true, 'Photo annotations': 'partial',
      'Built-in floor plans (mud maps)': true, 'Equipment tracking': 'partial',
      'Work logging': false, 'Damage assessments': true,
      'One-click PDF reports': 'partial', 'Insurance-compliant format': true,
      'Custom company branding': true, 'Thermal readings section': false,
      'Digital signatures': true, 'Comprehensive report template': 'partial',
      'Easy learning curve': false, 'Offline capability': 'partial',
      'Team collaboration': true, 'Quick onboarding (< 1 hour)': false,
      'Free tier available': false, 'Transparent pricing': false,
      'No long-term contracts': false, 'Pay-as-you-grow model': false,
    },
  },
  {
    name: 'DASH',
    features: {
      'Mobile-first design': true, 'Moisture tracking with auto calculations': false,
      'Photo documentation': true, 'Photo annotations': 'partial',
      'Built-in floor plans (mud maps)': false, 'Equipment tracking': 'partial',
      'Work logging': true, 'Damage assessments': 'partial',
      'One-click PDF reports': true, 'Insurance-compliant format': 'partial',
      'Custom company branding': true, 'Thermal readings section': false,
      'Digital signatures': true, 'Comprehensive report template': false,
      'Easy learning curve': true, 'Offline capability': 'partial',
      'Team collaboration': true, 'Quick onboarding (< 1 hour)': true,
      'Free tier available': false, 'Transparent pricing': true,
      'No long-term contracts': true, 'Pay-as-you-grow model': 'partial',
    },
  },
  {
    name: 'Paper/Spreadsheets',
    features: {
      'Mobile-first design': false, 'Moisture tracking with auto calculations': false,
      'Photo documentation': 'partial', 'Photo annotations': false,
      'Built-in floor plans (mud maps)': false, 'Equipment tracking': 'partial',
      'Work logging': 'partial', 'Damage assessments': 'partial',
      'One-click PDF reports': false, 'Insurance-compliant format': false,
      'Custom company branding': 'partial', 'Thermal readings section': false,
      'Digital signatures': false, 'Comprehensive report template': false,
      'Easy learning curve': true, 'Offline capability': true,
      'Team collaboration': false, 'Quick onboarding (< 1 hour)': true,
      'Free tier available': true, 'Transparent pricing': true,
      'No long-term contracts': true, 'Pay-as-you-grow model': true,
    },
  },
];

const competitorDetails = [
  {
    name: 'Encircle',
    description: 'Encircle is the industry standard for enterprise restoration companies. However, their enterprise-focused approach means complex pricing, lengthy onboarding, and features many small-to-mid teams never use.',
    advantages: [
      'Transparent, tiered pricing vs. enterprise sales quotes',
      'Built-in floor plan tool (no external software needed)',
      'Free tier for small businesses to get started',
      'Faster onboarding — start documenting in minutes',
      'No lengthy contracts or annual commitments required',
    ],
    targetAudience: 'Teams frustrated with Encircle complexity or pricing',
  },
  {
    name: 'Xactimate',
    description: 'Xactimate is the gold standard for restoration estimating. While essential for estimates, it\'s not designed for field documentation — technicians need additional tools for moisture tracking and drying reports.',
    advantages: [
      'Purpose-built for field documentation, not just estimating',
      'Real-time moisture tracking with trend analysis and GPP calculations',
      'Intuitive mobile interface designed for field technicians',
      'Works alongside Xactimate — use FloodEx for docs, Xactimate for estimates',
      'Fraction of the cost for documentation needs',
    ],
    targetAudience: 'Companies using Xactimate who need better field documentation',
  },
  {
    name: 'DASH',
    description: 'DASH is a general contractor management tool. While versatile, it lacks restoration-specific features like moisture tracking, psychrometric calculations, and insurance-compliant drying logs.',
    advantages: [
      'Built specifically for water damage restoration workflows',
      'Automatic moisture calculations (GPP, dew point, humidity ratio)',
      'Insurance-compliant report templates out of the box',
      'Thermal reading sections and comprehensive damage assessments',
      'Industry-standard drying log format',
    ],
    targetAudience: 'Restoration companies using generic contractor software',
  },
];

const differentiators = [
  { icon: Zap, title: 'Purpose-Built for Restoration', description: 'Not a generic contractor tool — every feature designed for water damage documentation.' },
  { icon: Smartphone, title: 'Field-First Design', description: 'Built for mobile use in the field, not desktop-only office software.' },
  { icon: Clock, title: 'Instant Reports', description: 'Generate insurance-ready PDF reports in one click, not hours of formatting.' },
  { icon: DollarSign, title: 'Transparent Pricing', description: 'Know exactly what you\'ll pay. No surprise fees or enterprise sales calls.' },
  { icon: Shield, title: 'Insurance Compliant', description: 'Reports meet insurance documentation standards right out of the box.' },
  { icon: Users, title: 'Free to Start', description: 'Try everything with our free tier. No credit card, no commitment.' },
];

export default function ComparePage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 lg:pt-40 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Software Comparison
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
              How FloodEx Compares to{' '}
              <span className="text-primary">Other Restoration Software</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              See why restoration professionals choose FloodEx for faster documentation and simpler pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?tab=signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">View All Features</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Feature-by-Feature Comparison</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Compare FloodEx against the most popular restoration software options.
            </p>
          </div>
          <ComparisonTable features={features} competitors={competitors} />
        </div>
      </section>

      {/* Individual Comparisons */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Detailed Comparisons</h2>
          </div>
          <div className="divide-y divide-border">
            {competitorDetails.map((competitor, index) => (
              <CompetitorCard
                key={competitor.name}
                competitorName={competitor.name}
                competitorDescription={competitor.description}
                advantages={competitor.advantages}
                targetAudience={competitor.targetAudience}
                reversed={index % 2 === 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Switch */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              The FloodEx Difference
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Why Teams Switch to FloodEx</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {differentiators.map((item) => (
              <div key={item.title} className="bg-card rounded-xl border border-border p-5 sm:p-6 hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Ready to See the Difference?</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Start your free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="w-full sm:w-auto group">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">View Pricing</Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
