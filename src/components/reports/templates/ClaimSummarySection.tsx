import { Job } from '@/hooks/useReportData';

interface ClaimSummarySectionProps {
  job: Job;
}

export function ClaimSummarySection({ job }: ClaimSummarySectionProps) {
  const hasClaimInfo = job.claim_summary || job.source_of_loss || job.affected_areas || job.affected_materials;

  if (!hasClaimInfo) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Claim Summary
      </h2>
      
      <div className="space-y-4 text-sm">
        {job.source_of_loss && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Source of Loss</h3>
            <p className="text-gray-900">{job.source_of_loss}</p>
          </div>
        )}

        {job.affected_areas && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Affected Areas</h3>
            <p className="text-gray-900">{job.affected_areas}</p>
          </div>
        )}

        {job.affected_materials && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Affected Materials</h3>
            <p className="text-gray-900">{job.affected_materials}</p>
          </div>
        )}

        {job.claim_summary && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Summary</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{job.claim_summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
