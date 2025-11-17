type Provider = 'none' | 'plausible' | 'ga4';

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const env = (import.meta as any)?.env || {};
const provider: Provider = (env.VITE_ANALYTICS_PROVIDER as Provider) || 'none';

const loadScript = (src: string, attrs: Record<string, string> = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed loading ${src}`));
    document.head.appendChild(s);
  });
};

export const analytics = {
  init: async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    if (provider === 'plausible') {
      const domain = env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
      if (!domain) return;
      await loadScript('https://plausible.io/js/script.js', { defer: '', 'data-domain': domain });
      return;
    }
    if (provider === 'ga4') {
      const id = env.VITE_GA4_ID as string | undefined;
      if (!id) return;
      await loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // @ts-ignore
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', id);
    }
  },

  track: (event: string, props?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    if (provider === 'plausible' && typeof window.plausible === 'function') {
      window.plausible(event, props ? { props } : undefined);
      return;
    }
    if (provider === 'ga4' && typeof window.gtag === 'function') {
      window.gtag('event', event, props || {});
      return;
    }
  },

  trackDoorClick: (day: number) => analytics.track('door_click', { day }),
  trackDoorOpen: (day: number) => analytics.track('door_open', { day }),
  trackOverrideActive: (active: boolean) => analytics.track('open_all_override', { active }),
  trackShare: (platform: 'x' | 'linkedin' | 'facebook') => analytics.track('share_click', { platform }),
  trackPdfExport: () => analytics.track('pdf_export'),
  trackCountdownVisible: (nextDay: number) => analytics.track('countdown_visible', { nextDay }),
  trackApiError: (source: string, message: string) => analytics.track('api_error', { source, message }),
};
