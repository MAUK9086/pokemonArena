const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

function gtag(...args) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function initAnalytics() {
  if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') {
    console.info('[GA] Analytics not configured — set VITE_GA_MEASUREMENT_ID in .env');
    return;
  }
  gtag('js', new Date());
  gtag('config', GA_ID, { send_page_view: false });
}

export function trackPageView(path) {
  if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') return;
  gtag('event', 'page_view', { page_path: path });
}

export function trackEvent(eventName, params = {}) {
  if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') return;
  gtag('event', eventName, params);
}
