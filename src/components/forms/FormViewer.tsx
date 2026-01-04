import { FormField } from '@/lib/formTemplates';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SignatureCapture } from './SignatureCapture';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface FormViewerProps {
  fields: FormField[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  signatures: Record<string, { blob?: Blob; name?: string; captured?: boolean }>;
  onSignatureCapture: (fieldId: string, blob: Blob) => void;
  onSignatureNameChange: (fieldId: string, name: string) => void;
  readOnly?: boolean;
  jobData?: Record<string, any>;
}

export function FormViewer({
  fields,
  values,
  onChange,
  signatures,
  onSignatureCapture,
  onSignatureNameChange,
  readOnly = false,
  jobData = {},
}: FormViewerProps) {
  const renderField = (field: FormField) => {
    const value = values[field.id];

    // Handle auto-fill fields
    if (field.type === 'auto_fill') {
      const autoValue = field.autoFillKey ? jobData[field.autoFillKey] : value;
      return (
        <div key={field.id} className={field.fullWidth ? 'col-span-2' : ''}>
          <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
          <div className="mt-1 p-2 bg-muted rounded-md text-sm">
            {autoValue || <span className="text-muted-foreground italic">Not provided</span>}
          </div>
        </div>
      );
    }

    // Handle signature fields
    if (field.type === 'signature') {
      const sig = signatures[field.id] || {};
      return (
        <Card key={field.id} className="col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
              {sig.captured && <CheckCircle className="h-4 w-4 text-green-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!sig.captured ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`${field.id}-name`}>Print Name</Label>
                  <Input
                    id={`${field.id}-name`}
                    value={sig.name || ''}
                    onChange={(e) => onSignatureNameChange(field.id, e.target.value)}
                    placeholder="Type your full name"
                    disabled={readOnly}
                  />
                </div>
                {!readOnly && (
                  <SignatureCapture
                    onCapture={(blob) => onSignatureCapture(field.id, blob)}
                    width={350}
                    height={150}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Signed by: <span className="font-medium text-foreground">{sig.name}</span>
                </p>
                <div className="border rounded-lg p-2 bg-muted/50">
                  <p className="text-xs text-muted-foreground text-center">Signature captured</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Standard form fields
    const fieldElement = () => {
      switch (field.type) {
        case 'text':
          return (
            <Input
              id={field.id}
              value={value || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={readOnly}
            />
          );

        case 'number':
          return (
            <Input
              id={field.id}
              type="number"
              value={value || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={readOnly}
            />
          );

        case 'date':
          return (
            <Input
              id={field.id}
              type="date"
              value={value || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={readOnly}
            />
          );

        case 'textarea':
          return (
            <Textarea
              id={field.id}
              value={value || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={readOnly}
              rows={4}
            />
          );

        case 'select':
          return (
            <Select
              value={value || ''}
              onValueChange={(val) => onChange(field.id, val)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case 'checkbox':
          return (
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id={field.id}
                checked={value === true}
                onCheckedChange={(checked) => onChange(field.id, checked)}
                disabled={readOnly}
              />
              <Label htmlFor={field.id} className="text-sm leading-tight cursor-pointer">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
          );

        default:
          return null;
      }
    };

    if (field.type === 'checkbox') {
      return (
        <div key={field.id} className={field.fullWidth ? 'col-span-2' : ''}>
          {fieldElement()}
        </div>
      );
    }

    return (
      <div key={field.id} className={field.fullWidth ? 'col-span-2' : ''}>
        <Label htmlFor={field.id} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="mt-1">{fieldElement()}</div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map(renderField)}
    </div>
  );
}
