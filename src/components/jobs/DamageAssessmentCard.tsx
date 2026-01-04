import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { DamageAssessment } from '@/hooks/useDamageAssessments';

interface DamageAssessmentCardProps {
  assessment: DamageAssessment;
  onEdit: (assessment: DamageAssessment) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  assessed: 'bg-primary/20 text-primary',
  completed: 'bg-success/20 text-success',
};

export function DamageAssessmentCard({ assessment, onEdit, onDelete }: DamageAssessmentCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground truncate">{assessment.area_name}</h4>
              {assessment.is_restorable ? (
                <Badge className="bg-success/20 text-success gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Restorable
                </Badge>
              ) : (
                <Badge className="bg-destructive/20 text-destructive gap-1">
                  <XCircle className="h-3 w-3" />
                  Non-Restorable
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{assessment.material_type}</p>
            {assessment.notes && (
              <p className="text-sm text-foreground mt-2">{assessment.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {assessment.status && (
              <Badge className={statusColors[assessment.status] || statusColors.pending}>
                {assessment.status}
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(assessment)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(assessment.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
