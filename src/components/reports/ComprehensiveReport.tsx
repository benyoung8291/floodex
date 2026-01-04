import { forwardRef } from 'react';
import { JobReportData, groupReadingsByChamber } from '@/hooks/useReportData';
import { ReportHeader } from './templates/ReportHeader';
import { ClaimSummarySection } from './templates/ClaimSummarySection';
import { WorksCompletedSection } from './templates/WorksCompletedSection';
import { DamageAssessmentSection } from './templates/DamageAssessmentSection';
import { DryingLogTable, DryingLogSummaryTable } from './templates/DryingLogTable';
import { EquipmentTable } from './templates/EquipmentTable';
import { PhotoGrid } from './templates/PhotoGrid';
import { FloorPlanSection } from './templates/FloorPlanSection';
import { SignatureBlock } from './templates/SignatureBlock';
import { ReportFooter } from './templates/ReportFooter';

interface ComprehensiveReportProps {
  data: JobReportData;
  dateRange?: { start: Date; end: Date };
  includeWorkLogs?: boolean;
  includeDamage?: boolean;
  includeEquipment?: boolean;
  includePhotos?: boolean;
  includeFloorPlans?: boolean;
  includeSignature?: boolean;
  photoSize?: 'small' | 'medium' | 'large';
}

export const ComprehensiveReport = forwardRef<HTMLDivElement, ComprehensiveReportProps>(
  ({ 
    data, 
    dateRange,
    includeWorkLogs = true,
    includeDamage = true,
    includeEquipment = true,
    includePhotos = true,
    includeFloorPlans = true,
    includeSignature = true,
    photoSize = 'medium',
  }, ref) => {
    const chamberReadings = groupReadingsByChamber(data.readings);
    const logoUrl = data.tenant?.logo_url || undefined;

    return (
      <div ref={ref} className="bg-white p-8 text-black print:p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
        <ReportHeader
          job={data.job}
          reportTitle="Water Damage Report"
          companyName={data.tenant?.name}
          companyLogo={logoUrl}
          headerTagline={data.tenant?.report_header_text || undefined}
          dateRange={dateRange}
        />

        {/* Claim Summary */}
        <ClaimSummarySection job={data.job} />

        {/* Works Completed */}
        {includeWorkLogs && data.workLogs.length > 0 && (
          <WorksCompletedSection workLogs={data.workLogs} />
        )}

        {/* Damage Assessment */}
        {includeDamage && data.damageAssessments.length > 0 && (
          <DamageAssessmentSection damageAssessments={data.damageAssessments} />
        )}

        {/* Floor Plans */}
        {includeFloorPlans && data.floorPlans && data.floorPlans.length > 0 && (
          <FloorPlanSection floorPlans={data.floorPlans} linkedReadings={data.linkedReadings} />
        )}

        {/* Moisture Readings */}
        {data.readings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Moisture Readings
            </h2>
            <DryingLogSummaryTable readings={data.readings} />
            {data.chambers.map((chamber) => {
              const readings = chamberReadings.get(chamber.id) || [];
              if (readings.length === 0) return null;
              return (
                <DryingLogTable
                  key={chamber.id}
                  readings={readings}
                  chamberName={chamber.name}
                  targetGpp={chamber.target_gpp}
                />
              );
            })}
          </div>
        )}

        {/* Equipment */}
        {includeEquipment && data.equipmentAssignments.length > 0 && (
          <EquipmentTable assignments={data.equipmentAssignments} />
        )}

        {/* Photos */}
        {includePhotos && data.photos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Photo Documentation
            </h2>
            <PhotoGrid photos={data.photos} showFullSize={photoSize === 'large'} />
          </div>
        )}

        {/* Notes */}
        {data.job.notes && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Notes</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.job.notes}</p>
          </div>
        )}

        {/* Signature */}
        {includeSignature && (
          <SignatureBlock
            technicianLabel={data.tenant?.report_technician_label || undefined}
            customerLabel={data.tenant?.report_customer_label || undefined}
            certificationText={data.tenant?.report_certification_text || undefined}
          />
        )}

        <ReportFooter footerText={data.tenant?.report_footer_text || undefined} />
      </div>
    );
  }
);

ComprehensiveReport.displayName = 'ComprehensiveReport';
