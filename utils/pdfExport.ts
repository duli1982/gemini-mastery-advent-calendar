import { CALENDAR_DAYS } from '../constants';
import { analytics } from './analytics';

export const exportAllPromptsAsPDF = async () => {
  analytics.trackPdfExport();

  // Lazy load jsPDF only when user clicks export (saves ~200KB from initial bundle)
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(218, 165, 32); // Gold color
  doc.text('Gemini Mastery Advent Calendar', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('24 Days of Gemini Wisdom for Randstad GBS', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Add each day's prompt
  CALENDAR_DAYS.forEach((day, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Day header
    doc.setFontSize(16);
    doc.setTextColor(0, 100, 0); // Dark green
    doc.text(`Day ${day.day}`, margin, yPosition);
    yPosition += 8;

    // Prompt content
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Clean up the prompt text (remove markdown formatting for better PDF readability)
    const cleanPrompt = day.prompt
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove italic markers
      .trim();

    const lines = doc.splitTextToSize(cleanPrompt, maxWidth);

    // Check if content fits on current page
    const contentHeight = lines.length * 5;
    if (yPosition + contentHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    lines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });

    // Add spacing between days
    yPosition += 10;

    // Add a separator line (except after last day)
    if (index < CALENDAR_DAYS.length - 1) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
    }
  });

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Gemini Mastery Advent Calendar | Randstad GBS`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save('Gemini-Mastery-Advent-Calendar-All-24-Days.pdf');
};
