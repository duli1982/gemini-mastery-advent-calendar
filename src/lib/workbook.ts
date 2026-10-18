import { jsPDF } from 'jspdf';
import type { Track } from '../types';
import { practices } from '../content/practice';
import { departmentVariants } from '../content/work';

type RGB = [number, number, number];
const NAVY: RGB = [15, 25, 65];
const YELLOW: RGB = [230, 255, 0];
const BLUE: RGB = [33, 117, 217];
const PAPER: RGB = [247, 245, 240];
const TURQUOISE: RGB = [107, 165, 180];
const MUTED: RGB = [83, 97, 122];

// Built-in Helvetica is intentionally used with normalized punctuation so exports
// need no font download and have no missing emoji/Unicode glyphs.
const ascii = (text: string) => text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—−]/g, '-').replace(/→/g, ' > ').replace(/…/g, '...').replace(/·/g, ' / ').replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
export function createWorkbook(track: Track) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const width = 210, height = 297, margin = 21, bottom = 275, contentWidth = width - margin * 2;
  let y = 25;
  let currentLabel = track.name;
  doc.setProperties({ title: `${track.name} - 24 Days of Smarter Work 2026`, subject: 'Randstad GBS learning workbook', author: '24 Days of Smarter Work', creator: 'Smarter Work learning site' });
  const newPage = () => { doc.addPage(); y = 30; doc.setFillColor(...PAPER); doc.rect(0, 0, width, height, 'F'); doc.setFontSize(8); doc.setTextColor(...MUTED); doc.setFont('helvetica', 'normal'); doc.text(ascii(currentLabel.toUpperCase()), margin, 14); doc.setDrawColor(...TURQUOISE); doc.line(margin, 18, width - margin, 18); };
  const ensure = (space: number) => { if (y + space > bottom) newPage(); };
  function text(value: string, size = 10, color: RGB = NAVY, bold = false, indent = 0) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
    const lineHeight = size * .48;
    const lines = doc.splitTextToSize(ascii(value), contentWidth - indent) as string[];
    // Keep ordinary paragraphs and short examples together to avoid a single
    // trailing line on the next page. Long practice documents can paginate.
    if (lines.length <= 9) ensure(lines.length * lineHeight + 2);
    for (const line of lines) { ensure(lineHeight + 1); doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color); doc.text(line, margin + indent, y); y += lineHeight; }
    y += 2;
  }
  function heading(value: string) { ensure(20); y += 4; text(value, 11, NAVY, true); }
  function paragraphSection(title: string, value: string, size = 9) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(size);
    const count = (doc.splitTextToSize(ascii(value), contentWidth) as string[]).length;
    // Keep a heading with its short paragraph; longer passages may paginate.
    ensure(16 + Math.min(count, 9) * size * .48);
    heading(title); text(value, size);
  }
  function lines(values: string[], numbered = false) { values.forEach((value, index) => text(`${numbered ? `${index + 1}.` : '-'} ${value}`, 9.5)); }
  // Cover
  doc.setFillColor(...PAPER); doc.rect(0, 0, width, height, 'F');
  doc.setFillColor(...NAVY); doc.rect(0, 0, width, 197, 'F');
  doc.setFillColor(...YELLOW); doc.rect(0, 197, 146, 3, 'F'); doc.setFillColor(...BLUE); doc.rect(146, 197, 38, 3, 'F'); doc.setFillColor(...TURQUOISE); doc.rect(184, 197, 26, 3, 'F');
  doc.setTextColor(...YELLOW); doc.setFontSize(10); doc.text('RANDSTAD GBS / 2026 EDITION', margin, 32);
  doc.setFont('times', 'normal'); doc.setFontSize(41); doc.setTextColor(...PAPER);
  doc.text(['24 days.', 'A smarter way', 'to work.'], margin, 66, { lineHeightFactor: 1.15 });
  doc.setDrawColor(...YELLOW); doc.line(margin, 130, margin + 33, 130);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text(track.name, margin, 147);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text('Your activities, examples and space for discoveries.', margin, 160);
  y = 220; text('A LITTLE LEARNING. A LASTING DIFFERENCE.', 10, NAVY, true);
  text('Use this workbook alongside your approved Google tools. All practice people, records and procedures are fictional. They are not company policy. No company account connection is required.', 10);
  text('Documentation checked: 18 October 2026. Exercises are source-checked, not tested in your company tenant. Check current feature availability before live use.', 9);
  newPage();
  text('Your 24 discoveries', 25, NAVY);
  text(track.description, 11);
  text('Use the practice inputs with the starting prompt. Check the output before using it at work. Keep what helps and return to your notes in January.', 10);
  y += 4;
  for (const a of track.activities) text(`${String(a.day).padStart(2, '0')}   ${a.title}  /  ${a.minutes} min`, 10);
  for (const a of track.activities) {
    currentLabel = `${track.name} / Day ${String(a.day).padStart(2, '0')}`;
    newPage();
    text(`DAY ${String(a.day).padStart(2, '0')} / ${a.phase.toUpperCase()}`, 9, NAVY, true);
    y += 7;
    text(a.title, 24, NAVY);
    text(a.summary, 11);
    text(`For: ${a.departments.join(', ')}\nTools: ${a.tools.join(', ')} / ${a.minutes} minutes`, 9);
    heading('Use it for my work');
    text(`Use this when: ${a.work.when}`, 9.5);
    text(`Have ready: ${a.work.inputs.join('; ')}`, 9.5);
    text(`Open: ${a.work.app}\n${a.work.appUrl}`, 9);
    text(`Application: ${a.work.quickMinutes} minutes / ${a.work.level}. ${a.work.output}`, 9);
    lines(a.work.steps, true);
    paragraphSection('Work prompt', a.work.prompt, 9.5);
    paragraphSection('Reusable output template', a.work.template.replace(/\t/g, ' | '), 8.5);
    heading('Work review checklist'); lines(a.work.checks);
    text(`Related ${a.related.track === 'guided' ? 'Guided Learning' : 'Business Activities'} activity: Day ${a.related.day}. Full lessons follow the December dates.`, 9);
    newPage(); heading('Practise with an example');
    heading('Before you begin'); text(a.prerequisites, 9.5);
    heading('Try it, step by step'); lines(a.steps, true);
    heading('Your starting prompt'); text(a.prompt, 9.5);
    heading('Practice materials - fictional training only');
    for (const id of a.practiceIds) {
      const p = practices[id];
      paragraphSection(`${p.title} (${p.format.toUpperCase()})`, p.text, p.format === 'csv' ? 8 : 9);
    }
    heading('What good looks like'); lines(a.expected);
    for (const id of a.practiceIds) if(practices[id].workedExample) paragraphSection(`Worked example: ${practices[id].title}`, practices[id].workedExample!, 9);
    heading('Check before you use it'); lines(a.checks);
    heading('Something to keep'); text(a.takeaway, 10, NAVY, true);
    text(`Go further: ${a.advanced}`, 9.5);
    heading('If a feature is unavailable'); text(a.fallback, 9);
    // Keep the source list and reflection space together instead of creating
    // a nearly empty continuation page containing only a few writing lines.
    ensure(75 + a.references.length * 12);
    heading('Official guidance');
    for (const ref of a.references) { ensure(18); text(ref.title, 9, NAVY, true); text(ref.url, 8); }
    text(`Documentation checked ${a.verified}. Feature access varies. This exercise has not been run in your company tenant.`, 8);
    heading('My notes / What I will use again');
    const writingLines = Math.min(12, Math.max(4, Math.floor((bottom-y-5)/9)));
    for (let i = 0; i < writingLines; i++) { ensure(9); doc.setDrawColor(...TURQUOISE); doc.line(margin, y + 4, width - margin, y + 4); y += 9; }
  }
  const variantIds = [...new Set(track.activities.flatMap(a=>a.work.variantIds))];
  currentLabel = `${track.name} / Department examples`;
  newPage(); text('Department variations', 25, NAVY);
  text('Optional fictional practice cases and reusable work templates. These examples are not company policy or real records. Use the work prompts with permitted sources in approved Google tools.', 10);
  for(const id of variantIds) {
    const v = departmentVariants[id];
    heading(`${v.department}: ${v.title}`);
    text(`Have ready: ${v.inputs.join('; ')}`, 9);
    text(`Open: ${v.guide.app}\n${v.guide.appUrl}`, 9);
    text(`You will get: ${v.guide.output}`, 9);
    lines(v.guide.steps, true);
    paragraphSection('Department work prompt', v.prompt);
    paragraphSection('Fictional practice case', v.example);
    paragraphSection('Output template', v.template.replace(/\t/g, ' | '), 8.5);
    heading('Department checks'); lines(v.checks);
  }
  const count = doc.getNumberOfPages();
  for (let page = 1; page <= count; page++) {
    doc.setPage(page); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text('24 Days of Smarter Work / Randstad GBS / 2026', margin, height - 12);
    doc.text(`${page} / ${count}`, width - margin, height - 12, { align: 'right' });
  }
  return doc;
}
export async function downloadWorkbook(track: Track) {
  const doc = createWorkbook(track);
  doc.save(`smarter-work-2026-${track.id}-workbook.pdf`);
}
