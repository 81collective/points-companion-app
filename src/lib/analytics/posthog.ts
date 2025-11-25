/**
 * PostHog Analytics Wrapper
 * 
 * Typed event tracking with correlation IDs.
 * Per AGENTS.md: Never include PII in event properties.
 * 
 * Setup: Add NEXT_PUBLIC_POSTHOG_KEY to .env.local
 */

// Event names from AGENTS.md standard schema
export const ANALYTICS_EVENTS = {
  // Auth events
  auth_login: 'auth_login',
  auth_logout: 'auth_logout',
  
  // Product events
  product_view: 'product_view',
  add_to_cart: 'add_to_cart',
  remove_from_cart: 'remove_from_cart',
  
  // Checkout events
  checkout_started: 'checkout_started',
  purchase_completed: 'purchase_completed',
  refund_issued: 'refund_issued',
  
  // Communication events
  email_sent: 'email_sent',
  email_bounced: 'email_bounced',
  
  // Card-specific events
  card_added: 'card_added',
  card_removed: 'card_removed',
  recommendation_shown: 'recommendation_shown',
  recommendation_clicked: 'recommendation_clicked',
  
  // Feature usage
  search_performed: 'search_performed',
  location_detected: 'location_detected',
  category_selected: 'category_selected',
} as const;

export type AnalyticsEvent = keyof typeof ANALYTICS_EVENTS;

interface BaseEventProps {
  correlation_id?: string;
  timestamp?: string;
  session_id?: string;
}

interface EventPropsMap {
  auth_login: { method: 'email' | 'oauth' };
  auth_logout: Record<string, never>;
  product_view: { card_id: string; card_name: string; issuer: string };
  add_to_cart: { card_id: string };
  remove_from_cart: { card_id: string };
  checkout_started: { card_count: number };
  purchase_completed: { order_id: string; total_cards: number };
  refund_issued: { order_id: string; reason?: string };
  email_sent: { template: string };
  email_bounced: { template: string };
  card_added: { card_id: string; issuer: string };
  card_removed: { card_id: string };
  recommendation_shown: { count: number; category?: string; business_type?: string };
  recommendation_clicked: { card_id: string; position: number; match_score: number };
  search_performed: { query_length: number; results_count: number };
  location_detected: { accuracy: number };
  category_selected: { category: string };
}

// Generate correlation ID
function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Session ID (persisted in sessionStorage)
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateCorrelationId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Track an analytics event with typed properties
 * 
 * @example
 * trackEvent('recommendation_shown', { count: 5, category: 'dining' });
 */
export function trackEvent<E extends AnalyticsEvent>(
  event: E,
  properties: EventPropsMap[E]
): void {
  const baseProps: BaseEventProps = {
    correlation_id: generateCorrelationId(),
    timestamp: new Date().toISOString(),
    session_id: getSessionId(),
  };

  const eventData = {
    ...baseProps,
    ...properties,
  };

  // PostHog integration (when configured)
  if (typeof window !== 'undefined' && (window as unknown as { posthog?: { capture: (event: string, props: object) => void } }).posthog) {
    (window as unknown as { posthog: { capture: (event: string, props: object) => void } }).posthog.capture(event, eventData);
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
     
    console.debug(`[Analytics] ${event}`, eventData);
  }
}

/**
 * Identify a user (call after login)
 * Never pass PII - use hashed user ID
 */
export function identifyUser(hashedUserId: string, traits?: Record<string, string | number | boolean>): void {
  if (typeof window !== 'undefined' && (window as unknown as { posthog?: { identify: (id: string, traits?: object) => void } }).posthog) {
    (window as unknown as { posthog: { identify: (id: string, traits?: object) => void } }).posthog.identify(hashedUserId, traits);
  }
}

/**
 * Reset user identity (call on logout)
 */
export function resetUser(): void {
  if (typeof window !== 'undefined' && (window as unknown as { posthog?: { reset: () => void } }).posthog) {
    (window as unknown as { posthog: { reset: () => void } }).posthog.reset();
  }
  sessionStorage.removeItem('analytics_session_id');
}

/**
 * Server-side event tracking
 * Use for backend events like webhooks
 */
export async function trackServerEvent<E extends AnalyticsEvent>(
  event: E,
  properties: EventPropsMap[E] & { distinct_id: string }
): Promise<void> {
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
       
      console.debug(`[Analytics:Server] ${event}`, properties);
    }
    return;
  }

  try {
    await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        properties: {
          ...properties,
          correlation_id: generateCorrelationId(),
          timestamp: new Date().toISOString(),
        },
      }),
    });
  } catch {
    // Silent fail - analytics should never break the app
  }
}
