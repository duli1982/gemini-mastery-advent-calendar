# 24 Days of Smarter Work - Randstad GBS

A complete 2026 edition of the original Gemini Mastery advent calendar: one React application, two tracks, 48 fully authored activities and two PDF workbooks. The previous edition remains available in the repository's Git history.

## Run locally

Requires Node.js 22+ and npm.

```powershell
npm install
npm run dev:review
```

Open http://127.0.0.1:3006. Review mode opens all activities and workbook downloads and displays a visible banner. `npm run dev` uses real local dates instead.

```powershell
npm run build
npm run preview
```

The production preview is http://127.0.0.1:3007. Deploy the `dist` folder to static hosting when ready. A Vercel configuration is supplied; nothing is published automatically.

## Calendar and learner behavior

- Guided Learning is a four-chapter sequence; Business Activities is a practical departmental collection. Neither track requires completion of earlier lessons.
- Stable lesson links: `?track=guided&day=21` or `?track=business&day=5`. Invalid tracks/days show the chooser. Browser back/forward works.
- Day N unlocks at 00:00 on December N, 2026 in the visitor's local timezone. It stays available in January 2027 and later. Both full workbooks unlock December 24.
- `npm run dev:review` is an explicitly separate development mode. All production builds, including `vite build --mode review`, disable review access. There is no `openAll` URL override.
- This static date gate supports the learning experience; lesson content is bundled, so it is not access control for confidential material.
- Opened, tried and saved are independent browser-local flags, isolated by edition, track and activity. No 2025 progress is imported. Filters are retained while switching tracks within a session; they reset on reload. Progress persists across reloads.
- No analytics, sign-in, backend, external fonts or company account connection. Employees use the copied instructions in their own approved Google tools. Test Studio runs are real actions in those tools and use learner-owned test notifications.

## Content maintenance

Edit `src/content/business.ts` and `src/content/guided.ts` for the activities. `src/content/practice.ts` contains fictional practice text and CSVs; shared references and access fallbacks live in `src/content/shared.ts`. Use the typed activity structure and stable IDs so existing progress still matches the same lesson.

The supplied Enterprise palette is implemented in `src/enterprise.css`: navy `#0F1941`, guiding yellow `#E6FF00`, Randstad blue `#2175D9`, off-white `#F7F5F0`, and turquoise `#6BA5B4`. These values were sampled from the supplied reference. Navy dominates page backgrounds; yellow identifies selected controls and key actions; light lesson surfaces keep the text readable. The favicon, browser theme color and workbook renderer use the same palette. Layout rules remain in `src/styles.css`.

Each lesson includes purpose, departments, tools, prerequisites, duration, 3-5 steps, a complete prompt, practice inputs, expected output, checks, a takeaway, an extension, a fallback, official links and a verification date. The Copy prompt button includes its actual practice inputs. CSV and text examples can be downloaded from Practice materials. Historical comparison notes remain editorial metadata only and are not shown on lesson pages or in workbooks.

Google documentation was checked on 18 October 2026. These exercises have not been executed inside a Randstad tenant. Recheck documentation, tenant access and current Gems/Skills naming before launch. Keep Workspace Studio distinct from Google's creative-media product. Do not convert fictional procedures into claims about internal policy.

## Workbooks and verification

```powershell
npm test
npx playwright install chromium
npm run build
npm run test:browser
npm run workbooks
```

`npm run workbooks` generates both full PDFs under `output/pdf` using the same content and rendering function as the browser download. Built-in PDF fonts and normalized punctuation avoid runtime font downloads. Both books include all practice materials and writing space.

Core tests cover content completeness, CSV structure, date boundaries in four timezones, route validation, progress isolation/storage failures, and locked-content search. Browser tests exercise both tracks, saved/tried behavior, downloads, clipboard fallback, keyboard focus, production date gating and mobile layouts. Automated accessibility checks cover WCAG A/AA issues; keyboard and visual review supplement them.

Latest verified result: 11 core tests and 10 browser tests passed, including three automated accessibility checks. The production build passes. See `output/VERIFICATION.md` for the verification record.

For PDF QA, render every page with Poppler into `tmp/pdfs/guided` and `tmp/pdfs/business` (prefix `page`), then run `scripts/inspect-workbooks.py` with Python, Pillow and pypdf. An optional first argument selects a different render directory. Contact sheets and inspection metadata are written to `output/qa`. Browser tests generate app screenshots in `output/screenshots`. These generated QA files are ignored by Git; the complete workbooks in `output/pdf` are included.

## Baseline changes

The 2025 app's numbered gifts, activity modal, local progress, countdown and client-side PDF behavior informed this edition. A typed two-track model replaces the single hard-coded calendar. Bundled CSS replaces the Tailwind CDN. A correctly typed error boundary and a hook-safe countdown replace the earlier problem areas. Live AI calls are not required; no task is executed on an employee's behalf by this learning site.
