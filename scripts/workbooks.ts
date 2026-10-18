import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tracks } from '../src/content/index.ts';
import { createWorkbook } from '../src/lib/workbook.ts';

const output = resolve('output/pdf');
mkdirSync(output, { recursive: true });
for (const track of tracks) {
  const doc = createWorkbook(track);
  const file = resolve(output, `smarter-work-2026-${track.id}-workbook.pdf`);
  writeFileSync(file, Buffer.from(doc.output('arraybuffer')));
  console.log(`${track.name}: ${doc.getNumberOfPages()} pages -> ${file}`);
}
