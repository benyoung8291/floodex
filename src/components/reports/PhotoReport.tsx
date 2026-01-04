import { forwardRef } from 'react';
import { ReportHeader } from './templates/ReportHeader';
import { PhotoGrid } from './templates/PhotoGrid';
import { SignatureBlock } from './templates/SignatureBlock';
import { JobReportData } from '@/hooks/useReportData';

interface PhotoReportProps {
  data: JobReportData;
  showFullSize?: boolean;
  includeSignature?: boolean;
}

export const PhotoReport = forwardRef<HTMLDivElement, PhotoReportProps>(
  ({ data, showFullSize = false, includeSignature = true }, ref) => {
    const { job, photos, tenant } = data;

    return (
      <div 
        ref={ref}
        className="bg-white text-gray-900 p-8 min-h-[11in] w-[8.5in] mx-auto font-sans"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <ReportHeader 
          job={job}
          reportTitle="Photo Documentation"
          companyName={tenant?.name}
          companyLogo={tenant?.logo_url || undefined}
        />

        <PhotoGrid photos={photos} showFullSize={showFullSize} />

        {includeSignature && (
          <SignatureBlock title="Documenting Technician Signature" />
        )}
      </div>
    );
  }
);

PhotoReport.displayName = 'PhotoReport';
