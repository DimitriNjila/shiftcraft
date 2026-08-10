import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface DownloadPdfOptions {
  /** DOM element containing the printable content. */
  target: HTMLElement;
  /** Filename without extension. `.pdf` is appended automatically. */
  filename: string;
  /** Landscape (default true) matches our @page rule. */
  landscape?: boolean;
}

/**
 * Rasterizes a DOM element via html2canvas and writes it into a single-page
 * jsPDF document sized to landscape US Letter. Triggers a browser download
 * with no dialog — the whole flow is one click end-to-end.
 *
 * Trade-off vs `window.print()`: no OS print dialog, but the output is a
 * rasterized image so text isn't selectable in the PDF. For a break-room
 * schedule that gets printed and posted, that's the right trade.
 */
export async function downloadElementAsPdf({
  target,
  filename,
  landscape = true,
}: DownloadPdfOptions): Promise<void> {
  // Render at 2× resolution so the image looks crisp on print.
  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  // US Letter dimensions in points (72pt/in). Landscape: 792 × 612.
  const pageWidth = landscape ? 792 : 612;
  const pageHeight = landscape ? 612 : 792;

  const pdf = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "pt",
    format: "letter",
    compress: true,
  });

  // Preserve aspect ratio; center on the page if it doesn't fill.
  const canvasRatio = canvas.width / canvas.height;
  const pageRatio = pageWidth / pageHeight;
  let renderWidth = pageWidth;
  let renderHeight = pageHeight;
  if (canvasRatio > pageRatio) {
    renderHeight = pageWidth / canvasRatio;
  } else {
    renderWidth = pageHeight * canvasRatio;
  }
  const x = (pageWidth - renderWidth) / 2;
  const y = (pageHeight - renderHeight) / 2;

  pdf.addImage(
    canvas.toDataURL("image/jpeg", 0.94),
    "JPEG",
    x,
    y,
    renderWidth,
    renderHeight,
  );

  pdf.save(`${filename}.pdf`);
}
