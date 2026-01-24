import { Check, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ComparisonFeature {
  name: string;
  category: string;
}

interface Competitor {
  name: string;
  isHighlighted?: boolean;
  features: Record<string, boolean | 'partial' | null | string>;
}

interface ComparisonTableProps {
  features: ComparisonFeature[];
  competitors: Competitor[];
}

function FeatureIndicator({ value }: { value: boolean | 'partial' | null | string }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-4 h-4 text-green-500" />
        </div>
      </div>
    );
  }
  if (value === 'partial') {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <Minus className="w-4 h-4 text-yellow-500" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
        <X className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}

export function ComparisonTable({ features, competitors }: ComparisonTableProps) {
  // Group features by category
  const categories = [...new Set(features.map(f => f.category))];

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="w-[250px] bg-muted/50 sticky left-0 z-10">
              Features
            </TableHead>
            {competitors.map((competitor) => (
              <TableHead
                key={competitor.name}
                className={cn(
                  'text-center min-w-[140px]',
                  competitor.isHighlighted && 'bg-primary/10'
                )}
              >
                <span className={cn(
                  'font-semibold',
                  competitor.isHighlighted && 'text-primary'
                )}>
                  {competitor.name}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <>
              <TableRow key={`cat-${category}`} className="bg-muted/30">
                <TableCell
                  colSpan={competitors.length + 1}
                  className="font-semibold text-sm uppercase tracking-wide text-muted-foreground py-3 sticky left-0"
                >
                  {category}
                </TableCell>
              </TableRow>
              {features
                .filter((f) => f.category === category)
                .map((feature) => (
                  <TableRow key={feature.name} className="border-border">
                    <TableCell className="font-medium bg-card sticky left-0 z-10">
                      {feature.name}
                    </TableCell>
                    {competitors.map((competitor) => (
                      <TableCell
                        key={`${competitor.name}-${feature.name}`}
                        className={cn(
                          competitor.isHighlighted && 'bg-primary/5'
                        )}
                      >
                        <FeatureIndicator
                          value={competitor.features[feature.name]}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
