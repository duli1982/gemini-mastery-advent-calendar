# Temporary team review

The team review opens all 24 doors in both tracks and both complete workbooks before December. A persistent **TEAM REVIEW** banner identifies this version. The normal public build keeps the December 2026 dates.

## Share a separate review link

The existing Vercel Git integration builds pushes to `codex/team-review` as an all-open Preview deployment. Use the Preview URL shown on that branch's pull request or in the Vercel project dashboard. No merge into `main` is needed to share this review.

The build only selects team review when all three conditions hold:

- `team-review.config.json` has `enabled: true`.
- Vercel identifies the deployment as `preview`.
- The Git branch matches the configured `codex/team-review` branch.

Other branches and production deployments keep the date rules. Vercel must expose its system environment variables to builds (`VERCEL_ENV` and `VERCEL_GIT_COMMIT_REF`). If those variables are unavailable, the build defaults to dates. A direct all-open build in Vercel's production environment fails rather than publishing unlocked doors. Do not use Vercel's Promote to Production action on a review deployment: promotion can reuse an existing static artifact without running these build checks. Release the public site by building `main` in production.

The review has no application sign-in. The pilot address is https://gemini-master-git-teamallopendoors-projects.vercel.app/ and follows `codex/team-review`. At the owner's request, this exact domain is listed under Vercel Deployment Protection Exceptions, allowing anyone with the URL to open it without Vercel sign-in. Other preview URLs retain their existing protection. Manage this exception under Project Settings > Deployment Protection; see [Vercel's documentation](https://vercel.com/docs/deployment-protection).

Review HTML includes a no-index instruction and a restrictive `robots.txt`. These discourage indexing; they do not restrict access. All material remains fictional training content. Progress is stored in each browser under the review site's origin, and does not transfer automatically to the public site; learners can use the existing toolkit backup/import controls.

The Unopened filter works across all 24 review doors. Date-driven notifications and catch-up panels are disabled here because all doors are deliberately open. Those reminders activate according to local dates in the normal build; browser tests exercise December and January scenarios without adding a public date override.

## Run the review locally

```powershell
npm run build:team-review
npm run preview:team-review
```

Open http://127.0.0.1:3008. The review build is in `dist-team-review`; normal `npm run build` still produces the date-based site in `dist`. A localhost link is only for this computer and is not the link to send colleagues.

`npm run dev:review` remains the development preview on port 3006. It is distinct from the hostable team-review build.

## Disable or remove it after the pilot

1. Change `enabled` to `false` in `team-review.config.json`, commit, and push to the review branch. Its next deployment uses the December dates. Alternatively, set `TEAM_REVIEW_ENABLED=false` in Vercel's Preview environment and redeploy that branch.
2. In Vercel, delete the previous all-open deployments for the review branch and remove the review domain and its Deployment Protection Exception. Static deployments have their own URLs: switching off future review builds does **not** revoke old deployment URLs.
3. Close the review pull request and delete the review branch if it is no longer needed. Deleting a Git branch alone does not delete its Vercel deployments.

The switch can remain disabled without affecting the public calendar. If complete code removal is desired, remove the team-review build scripts, configuration/helper, Vite review plugin/flag, banner branch and dedicated tests; restore Vercel's build command to `npm run build`. Keep the normal date tests. No lesson content or learner progress needs to be deleted.

## Verify before sharing

```powershell
npm test
npm run build
npm run build:team-review
npm run test:browser
```

The browser suite checks both tracks and workbook downloads in October, review indexing metadata, and production locking despite URL parameters. Build tests cover the dedicated branch, disabled settings and production rejection. Exercises still require a company-account pilot; opening the doors does not verify Google feature availability in your tenant.
