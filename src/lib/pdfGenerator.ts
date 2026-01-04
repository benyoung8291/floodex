import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePDFOptions {
  title: string;
  filename: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  margin?: number;
}

export async function generatePDF(
  element: HTMLElement,
  options: GeneratePDFOptions
): Promise<void> {
  const {
    filename,
    orientation = 'portrait',
    format = 'letter',
    margin = 10,
  } = options;

  // Create canvas from HTML element
  const canvas = await html2canvas(element, {
    scale: 2, // Higher quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');

  // Create PDF
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  // Calculate image dimensions to fit page
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);

  const scaledWidth = imgWidth * ratio;
  const scaledHeight = imgHeight * ratio;

  // Handle multi-page if content is taller than one page
  const pagesNeeded = Math.ceil((imgHeight * ratio) / contentHeight);

  if (pagesNeeded <= 1) {
    // Single page
    pdf.addImage(imgData, 'PNG', margin, margin, scaledWidth, scaledHeight);
  } else {
    // Multi-page: slice the canvas
    const pageCanvasHeight = (contentHeight / ratio);
    
    for (let page = 0; page < pagesNeeded; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      // Create a temporary canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgWidth;
      pageCanvas.height = Math.min(pageCanvasHeight, imgHeight - page * pageCanvasHeight);

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, page * pageCanvasHeight, // Source x, y
          imgWidth, pageCanvas.height, // Source width, height
          0, 0, // Destination x, y
          imgWidth, pageCanvas.height // Destination width, height
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/png');
      const sliceHeight = pageCanvas.height * ratio;

      pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidth, sliceHeight);
    }
  }

  // Download the PDF
  pdf.save(filename);
}

export function formatDateForReport(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTimeForReport(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTimeForReport(date: Date | string): string {
  return `${formatDateForReport(date)} at ${formatTimeForReport(date)}`;
}
