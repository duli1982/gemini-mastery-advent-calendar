import { readFileSync } from 'node:fs';

export interface ReviewSettings { enabled: boolean; branch: string }
export type BuildEnvironment = Record<string, string | undefined>;

export function readReviewSettings(): ReviewSettings {
  const settings = JSON.parse(readFileSync(new URL('../team-review.config.json', import.meta.url), 'utf8')) as ReviewSettings;
  if (typeof settings.enabled !== 'boolean' || typeof settings.branch !== 'string' || !/^codex\/[a-z0-9-]+$/.test(settings.branch)) {
    throw new Error('team-review.config.json needs a boolean enabled setting and a codex/ review branch.');
  }
  return settings;
}

export function teamReviewEnabled(settings: ReviewSettings, env: BuildEnvironment) {
  return settings.enabled && !['false', '0'].includes((env.TEAM_REVIEW_ENABLED || '').trim().toLowerCase());
}

export function hostingBuildMode(settings: ReviewSettings, env: BuildEnvironment): 'team-review' | 'production' {
  return teamReviewEnabled(settings, env) && env.VERCEL_ENV === 'preview' && env.VERCEL_GIT_COMMIT_REF === settings.branch
    ? 'team-review' : 'production';
}

export function reviewFlags(command: string, mode: string, settings: ReviewSettings, env: BuildEnvironment) {
  const teamReview = command === 'build' && mode === 'team-review';
  if (teamReview) {
    if (!teamReviewEnabled(settings, env)) throw new Error('Team review is disabled. Use npm run build for the date-based site.');
    if (env.VERCEL_ENV === 'production' || (env.VERCEL === '1' && env.VERCEL_ENV !== 'preview')) {
      throw new Error('Team review can only be deployed as a Vercel Preview. Production must use the December dates.');
    }
  }
  return { teamReview, review: teamReview || (command === 'serve' && mode === 'review') };
}
