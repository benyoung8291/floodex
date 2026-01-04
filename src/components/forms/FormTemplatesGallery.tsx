import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileSignature, 
  CheckCircle, 
  Wrench, 
  ClipboardCheck,
  Plus
} from 'lucide-react';
import { BUILT_IN_TEMPLATES, FormTemplateDefinition } from '@/lib/formTemplates';

interface FormTemplatesGalleryProps {
  onSelect: (template: FormTemplateDefinition) => void;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  work_authorization: <FileSignature className="h-8 w-8" />,
  certificate_completion: <CheckCircle className="h-8 w-8" />,
  equipment_placement: <Wrench className="h-8 w-8" />,
  daily_acknowledgment: <ClipboardCheck className="h-8 w-8" />,
  custom: <Plus className="h-8 w-8" />,
};

const TEMPLATE_COLORS: Record<string, string> = {
  work_authorization: 'text-blue-500',
  certificate_completion: 'text-green-500',
  equipment_placement: 'text-orange-500',
  daily_acknowledgment: 'text-purple-500',
  custom: 'text-muted-foreground',
};

export function FormTemplatesGallery({ onSelect }: FormTemplatesGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {BUILT_IN_TEMPLATES.map((template) => (
        <Card 
          key={template.form_type}
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onSelect(template)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className={TEMPLATE_COLORS[template.form_type]}>
                {TEMPLATE_ICONS[template.form_type]}
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="mt-1 text-xs">
                  {template.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {template.fields.filter(f => f.type === 'signature').length} signature(s) required
              </span>
              <Button variant="ghost" size="sm">
                Select
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
