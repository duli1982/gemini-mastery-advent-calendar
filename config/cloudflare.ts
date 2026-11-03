import type { BuildEnvironment, ReviewSettings } from './review-mode';
import { teamReviewEnabled } from './review-mode';

export type CloudflareTarget = 'public' | 'review';
export function cloudflareBuildPlan(target:string|undefined, settings:ReviewSettings, env:BuildEnvironment) {
  if(target!=='public' && target!=='review') throw new Error('Choose an explicit Cloudflare target: public or review.');
  if(env.CLOUDFLARE_BUILD_TARGET && env.CLOUDFLARE_BUILD_TARGET!==target) throw new Error('Conflicting Cloudflare build targets. Check the Worker build command.');
  const branch=target==='public' ? 'main' : settings.branch;
  if(env.WORKERS_CI==='1' && !env.WORKERS_CI_BRANCH) throw new Error('Cloudflare did not provide a Git branch. Refusing an ambiguous deployment build.');
  if(env.WORKERS_CI_BRANCH && env.WORKERS_CI_BRANCH!==branch) throw new Error(`The Cloudflare ${target} target must build ${branch}, not ${env.WORKERS_CI_BRANCH}.`);
  return {
    target,
    branch,
    mode:target==='review' && teamReviewEnabled(settings,env) ? 'team-review' : 'production',
    outDir:target==='review' ? 'dist-team-review' : 'dist',
  } as const;
}
