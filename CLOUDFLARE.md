# Cloudflare hosting from the existing GitHub repository

Both calendars use the same repository: `duli1982/gemini-mastery-advent-calendar`. Cloudflare Workers serves only the generated static assets; no application backend, sign-in, database or company account integration is added.

| Target | Worker | Git branch | Configuration | Assets |
| --- | --- | --- | --- | --- |
| Public calendar | `smarter-work-2026` | `main` | `wrangler.public.jsonc` | `dist` |
| All-open review | `smarter-work-2026-team-review` | `codex/team-review` | `wrangler.review.jsonc` | `dist-team-review` |

Live addresses:

- Public: https://smarter-work-2026.smarter-work-2026.workers.dev/
- Review: https://smarter-work-2026-team-review.smarter-work-2026.workers.dev/

The public build keeps the December 2026 opening dates. The review build opens both sets of 24 activities and both workbooks. The existing Vercel deployments can coexist with these Workers and are not removed by this configuration.

## Local commands

Use Node.js 22+ and install the locked dependencies with `npm ci`. Wrangler is pinned in `devDependencies`.

```powershell
npm test
npm run check:cloudflare:public
npm run check:cloudflare:review
```

The check commands run the complete build and Wrangler's deployment validation without publishing. To publish using your authenticated Cloudflare account:

```powershell
npm run deploy:cloudflare:public
npm run deploy:cloudflare:review
```

Each Wrangler configuration runs its own `build.command` before deployment, so it rebuilds the correct assets instead of relying on a previous local output. If you belong to multiple Cloudflare accounts, set `CLOUDFLARE_ACCOUNT_ID` for the intended account. Account IDs are not stored in these reusable configurations. Never commit an API token or OAuth credential.

If a login is needed, run `npx wrangler login`. For a limited OAuth authorisation that can publish these static Workers, include `account:read`, `user:read`, `workers:write`, `workers_scripts:write` and `workers_routes:write`. Authorisation is completed by the account owner in Cloudflare's browser page.

## Automatic GitHub updates

Both Workers were connected to GitHub on 3 November 2026 with the settings below. Pushes to `main` publish the public calendar; pushes to `codex/team-review` publish the all-open review. Cloudflare manages the build credential; it is not stored in the repository. The following instructions describe how to reconnect or reproduce the setup.

In Cloudflare, open each Worker, then **Settings > Builds > Connect**. Select GitHub, authorise the Cloudflare GitHub App for the intended repository if prompted, and use:

| Setting | Public Worker | Review Worker |
| --- | --- | --- |
| Repository | `duli1982/gemini-mastery-advent-calendar` | Same repository |
| Production branch for this Worker | `main` | `codex/team-review` |
| Root directory | Repository root | Repository root |
| Build command | Leave empty | Leave empty |
| Deploy command | `npm run deploy:cloudflare:public` | `npm run deploy:cloudflare:review` |
| Non-production branch builds / Previews | Disabled | Disabled |
| Build variable | `NODE_VERSION=22` | `NODE_VERSION=22` |

The deploy command invokes the configured build exactly once. Do not add a second dashboard build command unless deliberately changing this workflow. Leave development dependencies enabled: TypeScript, Vite and Wrangler are needed during the build. Cloudflare's build token is managed in Cloudflare, not in source files.

This uses two Workers, each with one deployment branch. It does not make the review build a preview version of the public Worker. The build checks `WORKERS_CI_BRANCH` and rejects an unexpected or ambiguous branch. The Vercel-specific hosting script remains available for Vercel.

References: [Workers Git integration](https://developers.cloudflare.com/workers/ci-cd/builds/), [build settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [static assets](https://developers.cloudflare.com/workers/static-assets/).

## Serving behaviour and access

The asset configurations use `single-page-application` fallback, preserving direct lesson and toolkit links on refresh. `public/_headers` carries the existing no-sniff, frame and referrer headers. The review build additionally sends `X-Robots-Tag: noindex, nofollow, noarchive`; all-open review HTML also has indexing metadata and a robots file. Indexing instructions do not restrict access.

Both Workers are intentionally publicly accessible without Cloudflare login. Version preview URLs are disabled. No analytics service or Worker runtime code is added.

Browser-local progress belongs to an origin. Users moving from a Vercel address to a Cloudflare address can export and import their existing toolkit backup; progress does not transfer automatically. Door opening times still use each visitor's local timezone.

## Disable the review

Set `enabled` to `false` in `team-review.config.json`, commit, and deploy the review Worker again. The Cloudflare review build then serves the normal date-based calendar from its own output directory. Alternatively, set `TEAM_REVIEW_ENABLED=false` in the review Worker's build settings and rebuild/redeploy. Changing a Worker runtime variable alone does not rebuild static files.

To retire the review address entirely, delete the review Worker and any attached review domains through Cloudflare. Deleting a Git branch alone does not remove a deployed site. Do not enable an older all-open version again after retirement. Existing Vercel review deployments and their domain exception must be retired separately as described in `TEAM_REVIEW.md`.
