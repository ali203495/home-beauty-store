import * as Sentry from '@sentry/node'

export default defineNitroPlugin((nitroApp) => {
  // 1. Sentry Initialization (Big-Tech Readiness)
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    })
    console.log('🛡️ [Observability] Sentry Armed & Ready.')
  }

  // 2. Global Error Capture
  nitroApp.hooks.hook('error', async (error, { event }) => {
    const timestamp = new Date().toISOString()
    const path = event?.path || 'unknown'
    const method = event?.method || 'unknown'
    
    if (process.env.SENTRY_DSN) {
      Sentry.withScope(scope => {
        scope.setTag('path', path)
        scope.setTag('method', method)
        Sentry.captureException(error)
      })
    }

  // 2. Request Performance Monitoring
  nitroApp.hooks.hook('request', (event) => {
    (event as any).context.startTime = Date.now()
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    const duration = Date.now() - ((event as any).context.startTime || 0)
    if (duration > 500) {
      console.warn(`🐢 Slow Request [${duration}ms]: ${event.path}`)
    }
  })
})
