interface SignatureBlockProps {
  title?: string;
  includeDate?: boolean;
  includeCustomerSignature?: boolean;
  technicianLabel?: string;
  customerLabel?: string;
  certificationText?: string;
}

const DEFAULT_CERTIFICATION = 
  'I certify that the information contained in this report is accurate and complete to the best of my knowledge.';

export function SignatureBlock({ 
  title,
  includeDate = true,
  includeCustomerSignature = false,
  technicianLabel = 'Technician Signature',
  customerLabel = 'Customer Signature',
  certificationText,
}: SignatureBlockProps) {
  const techLabel = title || technicianLabel;
  const certText = certificationText || DEFAULT_CERTIFICATION;

  return (
    <div className="mt-8 pt-6 border-t border-gray-300">
      <div className={`grid gap-8 ${includeCustomerSignature ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">{techLabel}</h4>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="border-b-2 border-gray-400 h-8"></div>
              <p className="text-xs text-gray-500 mt-1">Signature</p>
            </div>
            <div className="flex-1">
              <div className="border-b-2 border-gray-400 h-8"></div>
              <p className="text-xs text-gray-500 mt-1">Print Name</p>
            </div>
            {includeDate && (
              <div className="w-32">
                <div className="border-b-2 border-gray-400 h-8"></div>
                <p className="text-xs text-gray-500 mt-1">Date</p>
              </div>
            )}
          </div>
        </div>

        {includeCustomerSignature && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">{customerLabel}</h4>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="border-b-2 border-gray-400 h-8"></div>
                <p className="text-xs text-gray-500 mt-1">Signature</p>
              </div>
              <div className="flex-1">
                <div className="border-b-2 border-gray-400 h-8"></div>
                <p className="text-xs text-gray-500 mt-1">Print Name</p>
              </div>
              {includeDate && (
                <div className="w-32">
                  <div className="border-b-2 border-gray-400 h-8"></div>
                  <p className="text-xs text-gray-500 mt-1">Date</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-500 italic">
        <p>{certText}</p>
      </div>
    </div>
  );
}
