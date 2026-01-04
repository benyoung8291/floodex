export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'checkbox' | 'select' | 'signature' | 'auto_fill';
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  autoFillKey?: string; // For auto_fill fields - key from job data
  signerType?: 'technician' | 'customer' | 'supervisor' | 'witness';
  fullWidth?: boolean;
}

export interface FormTemplateDefinition {
  name: string;
  description: string;
  form_type: string;
  fields: FormField[];
}

export const WORK_AUTHORIZATION_TEMPLATE: FormTemplateDefinition = {
  name: 'Work Authorization',
  description: 'Customer authorization to begin water damage restoration work',
  form_type: 'work_authorization',
  fields: [
    { id: 'customer_name', type: 'auto_fill', label: 'Customer Name', autoFillKey: 'customer_name', required: true },
    { id: 'customer_phone', type: 'auto_fill', label: 'Phone', autoFillKey: 'customer_phone' },
    { id: 'customer_email', type: 'auto_fill', label: 'Email', autoFillKey: 'customer_email' },
    { id: 'property_address', type: 'auto_fill', label: 'Property Address', autoFillKey: 'address', required: true },
    { id: 'claim_number', type: 'auto_fill', label: 'Claim Number', autoFillKey: 'claim_id' },
    { id: 'date_of_loss', type: 'auto_fill', label: 'Date of Loss', autoFillKey: 'date_of_loss' },
    { id: 'loss_type', type: 'auto_fill', label: 'Loss Type', autoFillKey: 'loss_type' },
    { 
      id: 'scope_of_work', 
      type: 'textarea', 
      label: 'Scope of Work', 
      placeholder: 'Describe the work to be performed...',
      required: true,
      fullWidth: true
    },
    { id: 'estimated_duration', type: 'text', label: 'Estimated Duration', placeholder: 'e.g., 3-5 days' },
    { 
      id: 'payment_terms', 
      type: 'select', 
      label: 'Payment Terms', 
      options: ['Insurance Direct', 'Customer Payment', 'Insurance + Customer Deductible'],
      required: true
    },
    { 
      id: 'authorization_statement', 
      type: 'checkbox', 
      label: 'I authorize the above scope of work to be performed at my property and agree to the payment terms specified.',
      required: true,
      fullWidth: true
    },
    { 
      id: 'technician_signature', 
      type: 'signature', 
      label: 'Technician Signature', 
      signerType: 'technician',
      required: true 
    },
    { 
      id: 'customer_signature', 
      type: 'signature', 
      label: 'Customer Signature', 
      signerType: 'customer',
      required: true 
    },
  ],
};

export const CERTIFICATE_OF_COMPLETION_TEMPLATE: FormTemplateDefinition = {
  name: 'Certificate of Completion',
  description: 'Document confirming water damage restoration work has been completed',
  form_type: 'certificate_completion',
  fields: [
    { id: 'customer_name', type: 'auto_fill', label: 'Customer Name', autoFillKey: 'customer_name', required: true },
    { id: 'property_address', type: 'auto_fill', label: 'Property Address', autoFillKey: 'address', required: true },
    { id: 'claim_number', type: 'auto_fill', label: 'Claim Number', autoFillKey: 'claim_id' },
    { id: 'start_date', type: 'auto_fill', label: 'Start Date', autoFillKey: 'start_date' },
    { id: 'completion_date', type: 'date', label: 'Completion Date', required: true },
    { 
      id: 'work_summary', 
      type: 'textarea', 
      label: 'Work Performed Summary', 
      placeholder: 'Summary of restoration work completed...',
      required: true,
      fullWidth: true
    },
    { id: 'days_drying', type: 'auto_fill', label: 'Total Drying Days', autoFillKey: 'days_drying' },
    { 
      id: 'final_readings_acceptable', 
      type: 'checkbox', 
      label: 'Final moisture readings are within acceptable dry standard limits.',
      required: true,
      fullWidth: true
    },
    { 
      id: 'customer_satisfaction', 
      type: 'select', 
      label: 'Customer Satisfaction', 
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
      required: true
    },
    { 
      id: 'customer_comments', 
      type: 'textarea', 
      label: 'Customer Comments', 
      placeholder: 'Optional comments...',
      fullWidth: true
    },
    { 
      id: 'completion_statement', 
      type: 'checkbox', 
      label: 'I acknowledge that the restoration work has been completed to my satisfaction and all equipment has been removed from the property.',
      required: true,
      fullWidth: true
    },
    { 
      id: 'technician_signature', 
      type: 'signature', 
      label: 'Technician Signature', 
      signerType: 'technician',
      required: true 
    },
    { 
      id: 'customer_signature', 
      type: 'signature', 
      label: 'Customer Signature', 
      signerType: 'customer',
      required: true 
    },
  ],
};

export const EQUIPMENT_PLACEMENT_TEMPLATE: FormTemplateDefinition = {
  name: 'Equipment Placement Agreement',
  description: 'Agreement for placement and operation of drying equipment',
  form_type: 'equipment_placement',
  fields: [
    { id: 'customer_name', type: 'auto_fill', label: 'Customer Name', autoFillKey: 'customer_name', required: true },
    { id: 'property_address', type: 'auto_fill', label: 'Property Address', autoFillKey: 'address', required: true },
    { id: 'placement_date', type: 'date', label: 'Equipment Placement Date', required: true },
    { 
      id: 'equipment_list', 
      type: 'textarea', 
      label: 'Equipment Being Placed', 
      placeholder: 'List all equipment (e.g., 3 Air Movers, 1 Dehumidifier)...',
      required: true,
      fullWidth: true
    },
    { 
      id: 'placement_locations', 
      type: 'textarea', 
      label: 'Placement Locations', 
      placeholder: 'Describe where equipment is being placed...',
      required: true,
      fullWidth: true
    },
    { 
      id: 'safety_instructions', 
      type: 'checkbox', 
      label: 'I have been informed about equipment safety and operation instructions.',
      required: true,
      fullWidth: true
    },
    { 
      id: 'power_usage', 
      type: 'checkbox', 
      label: 'I understand that the equipment will use electrical power and may affect utility costs.',
      required: true,
      fullWidth: true
    },
    { 
      id: 'access_agreement', 
      type: 'checkbox', 
      label: 'I agree to provide access for daily monitoring and equipment adjustments.',
      required: true,
      fullWidth: true
    },
    { 
      id: 'technician_signature', 
      type: 'signature', 
      label: 'Technician Signature', 
      signerType: 'technician',
      required: true 
    },
    { 
      id: 'customer_signature', 
      type: 'signature', 
      label: 'Customer Signature', 
      signerType: 'customer',
      required: true 
    },
  ],
};

export const DAILY_ACKNOWLEDGMENT_TEMPLATE: FormTemplateDefinition = {
  name: 'Daily Visit Acknowledgment',
  description: 'Customer acknowledgment of daily site visit',
  form_type: 'daily_acknowledgment',
  fields: [
    { id: 'customer_name', type: 'auto_fill', label: 'Customer Name', autoFillKey: 'customer_name', required: true },
    { id: 'property_address', type: 'auto_fill', label: 'Property Address', autoFillKey: 'address', required: true },
    { id: 'visit_date', type: 'date', label: 'Visit Date', required: true },
    { 
      id: 'work_performed', 
      type: 'textarea', 
      label: 'Work Performed Today', 
      placeholder: 'Describe work done during this visit...',
      required: true,
      fullWidth: true
    },
    { 
      id: 'equipment_status', 
      type: 'textarea', 
      label: 'Equipment Status', 
      placeholder: 'Note any equipment changes or issues...',
      fullWidth: true
    },
    { 
      id: 'readings_taken', 
      type: 'checkbox', 
      label: 'Moisture readings were taken and recorded.',
      fullWidth: true
    },
    { 
      id: 'customer_present', 
      type: 'checkbox', 
      label: 'Customer was present during the visit.',
      fullWidth: true
    },
    { 
      id: 'technician_signature', 
      type: 'signature', 
      label: 'Technician Signature', 
      signerType: 'technician',
      required: true 
    },
    { 
      id: 'customer_signature', 
      type: 'signature', 
      label: 'Customer Signature (if present)', 
      signerType: 'customer'
    },
  ],
};

export const BUILT_IN_TEMPLATES: FormTemplateDefinition[] = [
  WORK_AUTHORIZATION_TEMPLATE,
  CERTIFICATE_OF_COMPLETION_TEMPLATE,
  EQUIPMENT_PLACEMENT_TEMPLATE,
  DAILY_ACKNOWLEDGMENT_TEMPLATE,
];

export const FORM_TYPE_LABELS: Record<string, string> = {
  work_authorization: 'Work Authorization',
  certificate_completion: 'Certificate of Completion',
  equipment_placement: 'Equipment Placement',
  daily_acknowledgment: 'Daily Acknowledgment',
  custom: 'Custom Form',
};

export const LOSS_TYPE_LABELS: Record<string, string> = {
  cat1: 'Category 1 - Clean Water',
  cat2: 'Category 2 - Gray Water',
  cat3: 'Category 3 - Black Water',
};
