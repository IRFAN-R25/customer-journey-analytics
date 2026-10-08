import { api } from './api';

const SESSION_KEY = 'journey_analytics_session_id';

export function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    // Generate a random session ID
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function resetSessionId(): string {
  sessionStorage.removeItem(SESSION_KEY);
  return getSessionId();
}

/**
 * Reusable clickstream tracking function.
 * Tracks event asynchronously without blocking UI interactions.
 */
export function trackEvent(
  eventType: string,
  page: string,
  productId?: number | null,
  metadata?: Record<string, any>
): void {
  const sessionId = getSessionId();

  // Non-blocking fire-and-forget
  api.recordEvent({
    session_id: sessionId,
    event_type: eventType,
    page: page,
    product_id: productId || null,
    metadata: metadata || {}
  }).catch((err) => {
    // Silently log in debug, don't break customer user flow
    console.debug('Analytics tracking ping:', eventType, err.message);
  });
}

export function trackRecommendationClick(productId: number, source: string): void {
  trackEvent('recommendation_click', window.location.pathname, productId, { source });
}
