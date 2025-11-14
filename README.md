
# Gemini Mastery Advent Calendar

## Open All Windows (Testing)

For development or preview, you can override the date lock and open all 24 days to verify content and UI.

- Env var (recommended): set `VITE_OPEN_ALL=true` in `.env.local`.
- URL parameter: append `?openAll=1` to the app URL.

The URL parameter takes priority over the env var. Neither method affects production unless you explicitly set the env var in that environment.

This override is implemented in `utils/dateUtils.ts: isOpenAllEnabled()` and used by `isDayUnlocked()`.

## Analytics (Optional)

This app includes a lightweight analytics adapter with support for Plausible or Google Analytics 4.

- Choose a provider by setting env vars in `.env.local`:
  - `VITE_ANALYTICS_PROVIDER=plausible` and `VITE_PLAUSIBLE_DOMAIN=your-domain.com`
  - or `VITE_ANALYTICS_PROVIDER=ga4` and `VITE_GA4_ID=G-XXXXXXX`
- Events tracked:
  - `door_click` (props: `day`)
  - `door_open` (props: `day`)
  - `open_all_override` (props: `active`)
- Implementation lives in `utils/analytics.ts`. It auto-loads the provider script at runtime; no HTML changes required.
