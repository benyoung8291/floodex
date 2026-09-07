import { useEffect } from 'react';
import { toast } from 'sonner';

const BODY_CLASS = 'floodex-report-locked';

/**
 * While a locked report preview is open, block browser print and hide
 * the rest of the page behind a paywall-only print sheet.
 */
export function useLockedReportPrintGuard(active: boolean) {
  useEffect(() => {
    if (!active) {
      document.body.classList.remove(BODY_CLASS);
      return;
    }

    document.body.classList.add(BODY_CLASS);

    const sheet = document.createElement('div');
    sheet.className = 'locked-report-print-sheet';
    sheet.setAttribute('aria-hidden', 'true');
    sheet.innerHTML =
      '<h1>Report locked</h1><p>Unlock this job to print or download the full report PDF.</p>';
    document.body.appendChild(sheet);

    const previousPrint = window.print.bind(window);

    window.print = () => {
      toast.message('Unlock this job to print or download the full report.');
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === 'p' || event.key === 'P')) {
        event.preventDefault();
        event.stopPropagation();
        toast.message('Unlock this job to print or download the full report.');
      }
    };

    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      sheet.remove();
      document.body.classList.remove(BODY_CLASS);
      window.print = previousPrint;
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [active]);
}
