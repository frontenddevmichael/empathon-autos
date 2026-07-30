/**
 * Sentry error monitoring.
 * 
 * Initialized only when VITE_SENTRY_DSN is set — no-op otherwise.
 * Call initSentry() at the app entry point (main.tsx).
 */
let sentryInitialized = false

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  if (!dsn) return
  if (sentryInitialized) return

  import('@sentry/react').then(Sentry => {
    Sentry.init({
      dsn,
      environment: import.meta.env.PROD ? 'production' : 'development',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
    sentryInitialized = true
  }).catch(() => {
    // Ignore
  })
}
