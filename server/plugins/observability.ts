import * as Sentry from '@sentry/node'

export default defineNitroPlugin((nitroApp) => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // Reduced for high traffic cost control
    })
  }

  nitroApp.hooks.hook('request', (event) => {
    // 1. Assign Global Request ID for tracing
    const requestId = crypto.randomUUID()
    event.context.requestId = requestId
    event.context.startTime = Date.now()
    
    // Add Request ID to context for logging
    setHeader(event, 'x-request-id', requestId)
  })

  nitroApp.hooks.hook('error', async (error, { event }) => {
    const requestId = event?.context.requestId || 'unknown'
    const path = event?.path || 'unknown'
    
    console.error(`🚨 [REQ:${requestId}] Error on ${path}:`, error)

    if (process.env.SENTRY_DSN) {
      Sentry.withScope(scope => {
        scope.setTag('requestId', requestId)
        scope.setTag('path', path)
        Sentry.captureException(error)
      })
    }
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    const duration = Date.now() - (event.context.startTime || 0)
    const requestId = event.context.requestId || 'unknown'
    
    if (duration > 1000) {
      console.warn(`🐢 [REQ:${requestId}] CRITICAL LATENCY [${duration}ms]: ${event.path}`)
    }
  })
})
