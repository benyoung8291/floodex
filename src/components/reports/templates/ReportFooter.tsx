interface ReportFooterProps {
  footerText?: string;
  pageNumber?: number;
  totalPages?: number;
}

export function ReportFooter({ footerText, pageNumber, totalPages }: ReportFooterProps) {
  if (!footerText && !pageNumber) return null;

  return (
    <div className="mt-auto pt-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
      {footerText && <span>{footerText}</span>}
      {pageNumber && totalPages && (
        <span className="ml-auto">Page {pageNumber} of {totalPages}</span>
      )}
    </div>
  );
}
