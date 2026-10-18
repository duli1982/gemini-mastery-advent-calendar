# Verification - 18 October 2026

The 2026 edition contains 48 complete activities across two tracks. The included workbooks contain 51 Guided Learning pages and 50 Business Activities pages.

- TypeScript and the production Vite build pass.
- 11 core tests pass: content completeness, CSV structure, route validation, track isolation, browser-storage failures, locked-content search and date boundaries in four time zones.
- 10 Chromium browser tests pass: track switching, filters, progress, deep links, keyboard focus, CSV/PDF downloads, clipboard fallback, production unlock dates and mobile layouts. Three of these run automated WCAG A/AA accessibility checks.
- All 101 workbook pages were rendered for inspection; content checks confirm all lessons and required sections are present. The historical comparison section is absent.
- The supplied Enterprise palette is used across both tracks, lesson pages, favicon and workbooks.

The calendar is a static learning site with no sign-in, analytics, backend or direct Workspace actions. Google documentation was checked on 18 October 2026. Exercises have not been executed inside a Randstad company tenant; actual feature access and outputs require tenant-specific validation.

To reproduce app checks: `npm ci`, `npm test`, `npm run build`, `npx playwright install chromium`, then `npm run test:browser`. To regenerate the included PDFs: `npm run workbooks`.
