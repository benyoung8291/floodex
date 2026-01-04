import { forwardRef } from 'react';
import { ReportHeader } from './templates/ReportHeader';
import { ReportFooter } from './templates/ReportFooter';
import { PsychrometricSummary } from './templates/PsychrometricSummary';
import { DryingLogTable } from './templates/DryingLogTable';
import { SignatureBlock } from './templates/SignatureBlock';
import { JobReportData, groupReadingsByChamber } from '@/hooks/useReportData';

interface PsychrometricReportProps {
  data: JobReportData;
  includeDetailedReadings?: boolean;
  includeSignature?: boolean;
}

export const PsychrometricReport = forwardRef<HTMLDivElement, PsychrometricReportProps>(
  ({ data, includeDetailedReadings = true, includeSignature = true }, ref) => {
    const { job, chambers, readings, tenant } = data;
    const byChamber = groupReadingsByChamber(readings);

    return (
      <div 
        ref={ref}
        className="bg-white text-gray-900 p-8 min-h-[11in] w-[8.5in] mx-auto font-sans"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <ReportHeader 
          job={job}
          reportTitle="Psychrometric Data Report"
          companyName={tenant?.name}
          companyLogo={tenant?.logo_url || undefined}
          headerTagline={tenant?.report_header_text || undefined}
        />

        <PsychrometricSummary 
          readings={readings}
          chambers={chambers}
          outdoorGpp={job.outdoor_gpp}
        />

        {includeDetailedReadings && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
              Detailed Chamber Readings
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
        )}

        {includeSignature && (
          <SignatureBlock 
            title="Certifying Technician Signature"
            certificationText={tenant?.report_certification_text || undefined}
          />
        )}

        <ReportFooter footerText={tenant?.report_footer_text || undefined} />
      </div>
    );
  }
);

PsychrometricReport.displayName = 'PsychrometricReport';
