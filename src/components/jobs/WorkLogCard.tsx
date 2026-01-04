import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Edit2, Trash2, Wrench } from 'lucide-react';
import type { WorkLog } from '@/hooks/useWorkLogs';

interface WorkLogCardProps {
  workLog: WorkLog;
  onEdit: (workLog: WorkLog) => void;
  onDelete: (id: string) => void;
}

const logTypeLabels: Record<string, string> = {
  initial: 'Initial Assessment',
  attendance: 'Site Attendance',
  followup: 'Follow-up',
  final: 'Final Inspection',
};

const logTypeColors: Record<string, string> = {
  initial: 'bg-primary/20 text-primary',
  attendance: 'bg-muted text-muted-foreground',
  followup: 'bg-secondary/20 text-secondary-foreground',
  final: 'bg-success/20 text-success',
};

export function WorkLogCard({ workLog, onEdit, onDelete }: WorkLogCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">
              {format(new Date(workLog.attendance_date), 'MMM d, yyyy')}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Badge className={logTypeColors[workLog.log_type] || logTypeColors.attendance}>
              {logTypeLabels[workLog.log_type] || workLog.log_type}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(workLog)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(workLog.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {workLog.summary && (
          <p className="text-foreground">{workLog.summary}</p>
        )}

        {workLog.work_completed && workLog.work_completed.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-1">Work Completed:</p>
            <ul className="list-disc list-inside space-y-1">
              {workLog.work_completed.map((item, index) => (
                <li key={index} className="text-foreground">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {workLog.equipment_notes && (
          <div className="flex items-start gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-foreground">{workLog.equipment_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
