"""Inspect exported PDFs and assemble page contact sheets after Poppler rendering."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
render_root = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'tmp/pdfs'
results = []
for track in ['guided', 'business']:
    pdf = root / 'output/pdf' / f'smarter-work-2026-{track}-workbook.pdf'
    reader = PdfReader(pdf)
    texts = [page.extract_text() or '' for page in reader.pages]
    all_text = '\n'.join(texts)
    assert 'From 2025 to 2026' not in all_text
    for section in ['Use it for my work', 'Work prompt', 'Reusable output template', 'Work review checklist', 'Practise with an example', 'Before you begin', 'Try it, step by step', 'Your starting prompt', 'Practice materials', 'What good looks like', 'Check before you use it', 'Something to keep', 'If a feature is unavailable', 'Official guidance', 'My notes']:
        assert all_text.count(section) == 24, (track, section, all_text.count(section))
    assert all(f'DAY {day:02d} /' in all_text for day in range(1, 25))
    assert all(f'{i + 1} / {len(texts)}' in text for i, text in enumerate(texts))
    assert not any('\ufffd' in text or '\x00' in text for text in texts)
    images = sorted((render_root / track).glob('page-*.png'))
    assert len(images) == len(texts), (track, len(images), len(texts))
    output = root / 'output/qa'
    output.mkdir(parents=True, exist_ok=True)
    for start in range(0, len(images), 12):
        sheet = Image.new('RGB', (1240, 1380), '#dce2d8')
        draw = ImageDraw.Draw(sheet)
        for pos, path in enumerate(images[start:start + 12]):
            image = Image.open(path).convert('RGB')
            image.thumbnail((292, 417))
            x, y = 10 + (pos % 4) * 310, 10 + (pos // 4) * 460
            sheet.paste(ImageOps.expand(image, border=1, fill='#9ca694'), (x, y))
            draw.text((x + 5, y + 424), f'{track} / page {start + pos + 1}', fill='#183b2c')
        sheet.save(output / f'{track}-pages-{start+1:02d}-{min(start+12, len(images)):02d}.jpg', quality=90)
    results.append({'track': track, 'pages': len(texts), 'lessons': 24, 'complete_sections': True, 'rendered_pages': len(images), 'file_bytes': pdf.stat().st_size})
output.joinpath('workbook-inspection.json').write_text(json.dumps(results, indent=2))
print(json.dumps(results, indent=2))
