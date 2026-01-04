import { forwardRef } from 'react';
import { ReportHeader } from './templates/ReportHeader';
import { ReportFooter } from './templates/ReportFooter';
import { DryingLogTable, DryingLogSummaryTable } from './templates/DryingLogTable';
import { EquipmentTable } from './templates/EquipmentTable';
import { SignatureBlock } from './templates/SignatureBlock';
import { JobReportData, groupReadingsByChamber } from '@/hooks/useReportData';

interface DryingLogReportProps {
  data: JobReportData;
  dateRange?: { start: Date; end: Date };
  includeEquipment?: boolean;
  includeSignature?: boolean;
}

export const DryingLogReport = forwardRef<HTMLDivElement, DryingLogReportProps>(
  ({ data, dateRange, includeEquipment = true, includeSignature = true }, ref) => {
    const { job, chambers, readings, equipmentAssignments, tenant } = data;
    const byChamber = groupReadingsByChamber(readings);

    return (
      <div 
        ref={ref}
        className="bg-white text-gray-900 p-8 min-h-[11in] w-[8.5in] mx-auto font-sans"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <ReportHeader 
          job={job}
          reportTitle="Drying Log Report"
          companyName={tenant?.name}
          companyLogo={tenant?.logo_url || undefined}
          headerTagline={tenant?.report_header_text || undefined}
          dateRange={dateRange}
        />

        <DryingLogSummaryTable readings={readings} />

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Chamber Readings
          </h2>
          
          {chambers.map(chamber => {
            const chamberReadings = byChamber.get(chamber.id) || [];
            return (
              <DryingLogTable
                key={chamber.id}
                readings={chamberReadings}
                chamberName={chamber.name}
                targetGpp={chamber.target_gpp}
              />
            );
          })}
        </div>

        {includeEquipment && equipmentAssignments.length > 0 && (
          <EquipmentTable assignments={equipmentAssignments} />
        )}

        {job.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes</h3>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
              {job.notes}
            </div>
          </div>
        )}

        {includeSignature && (
          <SignatureBlock 
            includeCustomerSignature
            technicianLabel={tenant?.report_technician_label || undefined}
            customerLabel={tenant?.report_customer_label || undefined}
            certificationText={tenant?.report_certification_text || undefined}
          />
        )}

        <ReportFooter footerText={tenant?.report_footer_text || undefined} />
      </div>
    );
  }
);

DryingLogReport.displayName = 'DryingLogReport';
