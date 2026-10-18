# Verification - 18 October 2026

The 2026 edition contains 48 complete activities across two tracks, 48 work guides, eight always-available starter templates, and twelve department variations covering eight departments. The included workbooks contain 87 Guided Learning pages and 86 Business Activities pages.

- TypeScript and the production Vite build pass.
- 17 core tests pass: content/work-guide completeness, department mapping, answer-key separation, CSV structure, task synonyms/filters, route validation, progress migration, backup validation/merge, storage failures, locked-content search and date boundaries in four time zones.
- 20 Chromium browser tests pass: track modes and related links, cross-track discovery, department variants and job aids, separate practice answers, saved/used/resume state, backup export/import, clipboard fallback, production date rules, keyboard interaction and mobile layouts. Six run automated WCAG A/AA accessibility checks.
- Production tests confirm the Everyday Toolkit works before December without opening a calendar lesson or workbook.
- All 173 workbook pages are rendered for inspection; content checks confirm all lessons, work guides, practice inputs, separate worked explanations and department examples are present. Every lesson has a worked explanation with evidence or a calculation. The historical comparison section is absent.
- The supplied Enterprise palette is used across both tracks, lesson pages, favicon and workbooks.

The calendar is a static learning site with no sign-in, analytics, backend or direct Workspace actions. Google documentation was checked on 18 October 2026. Exercises have not been executed inside a Randstad company tenant; actual feature access and outputs require tenant-specific validation.

To reproduce app checks: `npm ci`, `npm test`, `npm run build`, `npx playwright install chromium`, then `npm run test:browser`. To regenerate the included PDFs: `npm run workbooks`.
