import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readReviewSettings, reviewFlags } from './config/review-mode';

export default defineConfig(({ mode, command }) => {
  const flags = reviewFlags(command, mode, readReviewSettings(), process.env);
  return {
    plugins: [react(), ...(flags.teamReview ? [{
      name: 'team-review-indexing',
      transformIndexHtml() { return [{ tag:'meta', attrs:{ name:'robots', content:'noindex, nofollow, noarchive' }, injectTo:'head' as const }]; },
      generateBundle() { this.emitFile({ type:'asset' as const, fileName:'robots.txt', source:'User-agent: *\nDisallow: /\n' }); },
    } satisfies Plugin] : [])],
    define: { __REVIEW__: JSON.stringify(flags.review), __TEAM_REVIEW__: JSON.stringify(flags.teamReview) },
    build: { sourcemap:false, outDir:flags.teamReview ? 'dist-team-review' : 'dist' },
  };
});
