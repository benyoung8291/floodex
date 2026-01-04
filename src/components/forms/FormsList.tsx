import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Plus, 
  MoreVertical, 
  Eye, 
  Download,
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  FileSignature
} from 'lucide-react';
import { useJobForms, JobForm } from '@/hooks/useJobForms';
import { FORM_TYPE_LABELS } from '@/lib/formTemplates';
import { format } from 'date-fns';
import { FormFillDialog } from './FormFillDialog';
import { FormViewDialog } from './FormViewDialog';
import { Skeleton } from '@/components/ui/skeleton';

interface FormsListProps {
  jobId: string;
  jobData: Record<string, any>;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', icon: <Clock className="h-3 w-3" />, variant: 'secondary' },
  pending_signature: { label: 'Pending Signature', icon: <AlertCircle className="h-3 w-3" />, variant: 'outline' },
  signed: { label: 'Signed', icon: <CheckCircle className="h-3 w-3" />, variant: 'default' },
  voided: { label: 'Voided', icon: <XCircle className="h-3 w-3" />, variant: 'destructive' },
};

export function FormsList({ jobId, jobData }: FormsListProps) {
  const { data: forms, isLoading } = useJobForms(jobId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<JobForm | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');

  const handleViewForm = (form: JobForm) => {
    setSelectedForm(form);
    setViewMode(form.status === 'signed' || form.status === 'voided' ? 'view' : 'edit');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Forms & Documents</h3>
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Form
        </Button>
      </div>

      {forms && forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileSignature className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg mb-2">No forms yet</CardTitle>
            <CardDescription className="text-center mb-4">
              Create work authorization forms, certificates of completion, and other documents.
            </CardDescription>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create First Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {forms?.map((form) => {
            const status = STATUS_CONFIG[form.status] || STATUS_CONFIG.draft;
            return (
              <Card key={form.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{form.title}</span>
                        <Badge variant={status.variant} className="gap-1">
                          {status.icon}
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {FORM_TYPE_LABELS[form.form_type] || form.form_type} • {format(new Date(form.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewForm(form)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {form.status === 'signed' ? 'View' : 'Edit'}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewForm(form)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {form.status === 'signed' && form.signed_document_path && (
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                        )}
                        {form.status !== 'voided' && form.status !== 'signed' && (
                          <DropdownMenuItem className="text-destructive">
                            <XCircle className="h-4 w-4 mr-2" />
                            Void Form
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <FormFillDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        jobId={jobId}
        jobData={jobData}
      />

      {selectedForm && (
        <FormViewDialog
          open={!!selectedForm}
          onOpenChange={(open) => !open && setSelectedForm(null)}
          form={selectedForm}
          jobData={jobData}
          mode={viewMode}
        />
      )}
    </div>
  );
}
