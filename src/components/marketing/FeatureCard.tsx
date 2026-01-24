import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, gradient, delay = 0 }: FeatureCardProps) {
  return (
    <div
      className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Gradient background on hover */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          gradient || "bg-gradient-to-br from-primary/5 to-transparent"
        )}
      />
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
