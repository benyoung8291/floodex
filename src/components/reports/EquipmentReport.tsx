import { forwardRef } from 'react';
import { ReportHeader } from './templates/ReportHeader';
import { EquipmentTable } from './templates/EquipmentTable';
import { SignatureBlock } from './templates/SignatureBlock';
import { JobReportData } from '@/hooks/useReportData';

interface EquipmentReportProps {
  data: JobReportData;
  includeSignature?: boolean;
}

export const EquipmentReport = forwardRef<HTMLDivElement, EquipmentReportProps>(
  ({ data, includeSignature = true }, ref) => {
    const { job, equipmentAssignments, tenant } = data;

    return (
      <div 
        ref={ref}
        className="bg-white text-gray-900 p-8 min-h-[11in] w-[8.5in] mx-auto font-sans"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <ReportHeader 
          job={job}
          reportTitle="Equipment Usage Summary"
          companyName={tenant?.name}
          companyLogo={tenant?.logo_url || undefined}
        />

        <EquipmentTable assignments={equipmentAssignments} />

        {includeSignature && (
          <SignatureBlock title="Equipment Manager Signature" />
        )}
      </div>
    );
  }
);

EquipmentReport.displayName = 'EquipmentReport';
