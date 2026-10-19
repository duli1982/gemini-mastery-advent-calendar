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

The production preview is http://127.0.0.1:3007. Deploy the `dist` folder to static hosting when ready. The connected Vercel project builds Git pushes using `npm run build:hosting`: production and ordinary branches use dates; the dedicated team-review Preview branch opens all doors. See [TEAM_REVIEW.md](TEAM_REVIEW.md) for sharing, access settings and removal.

## Calendar and learner behavior

- Guided Learning is a four-chapter sequence; Business Activities is a practical departmental collection. Neither track requires completion of earlier lessons.
- Stable lesson links: `?track=guided&day=21` or `?track=business&day=5`. Task discovery is `?view=discover`, combined saves are `?view=saved`, and the year-round toolkit is `?view=toolkit` (for example `?view=toolkit&task=email`). Invalid and mixed routes show the chooser. Browser back/forward works.
- Day N unlocks at 00:00 on December N, 2026 in the visitor's local timezone. It stays available in January 2027 and later. Both full workbooks unlock December 24.
- Eight separate Everyday Toolkit work templates are always available. They show reusable work instructions and department examples, while their calendar lessons, practice solutions and full workbook downloads retain the December locks. Studio and video setup are not presented as instant tasks.
- `npm run dev:review` is a separate development mode. Normal builds, including `vite build --mode review`, disable review access. The explicit `npm run build:team-review` creates an all-open build in `dist-team-review` and rejects Vercel production deployment. There is no `openAll` URL override. The temporary review branch and enable switch are in `team-review.config.json`.
- This static date gate supports the learning experience; lesson content is bundled, so it is not access control for confidential material.
- Opened, tried, saved and used-at-work are independent browser-local flags, isolated by edition, track and activity. Earlier 2026 progress gains `used: false` without losing other flags. No 2025 progress is imported. An Everyday Toolkit template can be saved/used before December without opening or completing its locked calendar lesson. Filters are retained while switching calendar tracks within a session; they reset on reload.
- Discovery searches both tracks with common task synonyms, task/department/tool filters, duration and experience. Locked lessons expose discovery metadata only. Business lessons start in work mode; guided lessons start with practice. Every lesson links to a related activity in the other track, with that activity's normal unlock date.
- The most recently visited lesson or starter template is kept for Continue where I stopped. Toolkit backup/export stores activity IDs and progress flags only. Import validates the edition and flags and merges them without clearing existing progress. Browser-local progress does not sync automatically.
- No analytics, sign-in, backend, external fonts or company account connection. Employees use the copied instructions in their own approved Google tools. Test Studio runs are real actions in those tools and use learner-owned test notifications.

## Content maintenance

Edit `src/content/business.ts` and `src/content/guided.ts` for the learning activities. `src/content/work.ts` contains all work guides, cross-track links, the eight task categories, and twelve department variations covering eight departments. Each guide has a use case, inputs, app link, steps, reusable prompt, output, template, checks, duration and experience level. Department variations also carry their own app and workflow instructions. Keep IDs stable so progress matches the same lesson.

`src/content/practice.ts` contains fictional text/CSV inputs and separate worked explanations. `exercisePrompt` copies only inputs and rules. Keep solutions out of input text; the Reveal the worked example section renders solutions after the learner runs the exercise. Shared official references and access fallbacks live in `src/content/shared.ts`.

The supplied Enterprise palette is implemented in `src/enterprise.css`: navy `#0F1941`, guiding yellow `#E6FF00`, Randstad blue `#2175D9`, off-white `#F7F5F0`, and turquoise `#6BA5B4`. These values were sampled from the supplied reference. Navy dominates page backgrounds; yellow identifies selected controls and key actions; light lesson surfaces keep the text readable. The favicon, browser theme color and workbook renderer use the same palette. Layout rules remain in `src/styles.css`.

Each lesson includes its full learning activity plus Use it for my work and Practise with an example. Copy work prompt contains no fictional case data. Copy prompt + practice inputs includes the actual fictional inputs but excludes worked answers. Copy activity link preserves the current lesson or starter URL. Work job aids download as readable text with inputs, prompt, output template, checks and sources; table templates use tabs for pasting into Sheets. No company-owned template links are invented. Historical comparison notes remain editorial metadata only.

Google documentation was checked on 18 October 2026. These exercises have not been executed inside a Randstad tenant. Recheck documentation, tenant access and current Gems/Skills naming before launch. Keep Workspace Studio distinct from Google's creative-media product. Do not convert fictional procedures into claims about internal policy.

## Workbooks and verification

```powershell
npm test
npx playwright install chromium
npm run build
npm run build:team-review
npm run test:browser
npm run workbooks
```

`npm run workbooks` generates both full PDFs under `output/pdf` using the same content and rendering function as the browser download. Built-in PDF fonts and normalized punctuation avoid runtime font downloads. Both books include all practice materials and writing space.

Core tests cover content completeness, CSV structure, date boundaries in four timezones, route validation, progress isolation/storage failures, and locked-content search. Browser tests exercise both tracks, saved/tried behavior, downloads, clipboard fallback, keyboard focus, production date gating and mobile layouts. Automated accessibility checks cover WCAG A/AA issues; keyboard and visual review supplement them.

See `output/VERIFICATION.md` for the latest verification record. `PILOT.md` describes the remaining company-account pilot; software tests do not establish Google tenant availability or measured employee benefits.

For PDF QA, render every page with Poppler into `tmp/pdfs/guided` and `tmp/pdfs/business` (prefix `page`), then run `scripts/inspect-workbooks.py` with Python, Pillow and pypdf. An optional first argument selects a different render directory. Contact sheets and inspection metadata are written to `output/qa`. Browser tests generate app screenshots in `output/screenshots`. These generated QA files are ignored by Git; the complete workbooks in `output/pdf` are included.

## Baseline changes

The 2025 app's numbered gifts, activity modal, local progress, countdown and client-side PDF behavior informed this edition. A typed two-track model replaces the single hard-coded calendar. Bundled CSS replaces the Tailwind CDN. A correctly typed error boundary and a hook-safe countdown replace the earlier problem areas. Live AI calls are not required; no task is executed on an employee's behalf by this learning site.
