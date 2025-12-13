import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';

/**
 * Initialize Sentry for error tracking
 * Only initializes if VITE_SENTRY_DSN is configured
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.log('[Sentry] DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,

    // Performance Monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session Replay - only in production
    replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: SENTRY_ENVIRONMENT === 'production' ? 1.0 : 0,

    // Filter out common non-actionable errors
    ignoreErrors: [
      // Network errors
      'Network request failed',
      'Failed to fetch',
      'NetworkError',
      'Load failed',
      // Browser extensions
      /^chrome-extension:\/\//,
      /^moz-extension:\/\//,
      // ResizeObserver
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],

    // Don't send events in development unless DSN is explicitly set
    enabled: !!SENTRY_DSN,

    beforeSend(event) {
      // Filter out events from localhost in production builds
      if (SENTRY_ENVIRONMENT === 'production' && window.location.hostname === 'localhost') {
        return null;
      }
      return event;
    },
  });

  console.log(`[Sentry] Initialized (${SENTRY_ENVIRONMENT})`);
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!SENTRY_DSN) return;

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message manually
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (!SENTRY_DSN) return;

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (!SENTRY_DSN) return;

  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb(breadcrumb);
}

// Re-export Sentry's ErrorBoundary for use in components
export const ErrorBoundary = Sentry.ErrorBoundary;
