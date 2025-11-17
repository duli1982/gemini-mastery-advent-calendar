## Gemini Mastery Advent Calendar

This project hosts the interactive advent calendar experience. Keep this README close when sharing with external audiences so everyone understands usage limits and data handling.

### Rate Limits & Fair Use
- **Daily unlocks:** Doors unlock once per day; hammering refresh won’t reveal content early.
- **PDF export:** Each export generates a fresh document client-side. Please avoid automated scraping to prevent browser memory pressure.
- **Future AI content:** The current build serves static prompts. If AI-generated surprises return later, we’ll communicate any additional rate limits before rollout.

### Privacy & Analytics
- **What’s tracked:** The GA4 integration records door clicks/opens, countdown impressions, share button usage, PDF exports, and errors. No personal identifiers are collected—only anonymous event metadata (day number, platform, error message).
- **Opt-in scope:** Analytics fire only when the user loads the page. No data is shared with third parties beyond Google Analytics.
- **Prompt content:** All prompts are static and stored within the bundle. If user-generated content is ever accepted, it will be sanitized before display.
- **Retention & deletion:** GA4 retains aggregated metrics per your Google Analytics account settings. To remove data, follow GA4’s data deletion workflow.

For EU recipients, this setup aligns with GDPR expectations because no personal data is stored or transmitted. Still, include the link to your organization’s privacy notice when distributing the calendar so people can review their rights at any time. Let us know if you need a translated version for specific regions.
