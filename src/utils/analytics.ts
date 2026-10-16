declare global {
  interface Window {
    gtag?: (
      command: 'event',
      action: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Tracks an affiliate link click event in GA4.
 * Safely executes without error even if Google Analytics is not configured or blocked.
 */
export function trackAffiliateClick(title: string, affiliateUrl: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'affiliate_click', {
        title: title || '',
        affiliate_url: affiliateUrl || '',
      });
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
}
