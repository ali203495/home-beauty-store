export default defineNitroPlugin((nitroApp) => {
  // 1. Global Error Capture (Production Grade)
  nitroApp.hooks.hook('error', async (error, { event }) => {
    const timestamp = new Date().toISOString()
    const path = event?.path || 'unknown'
    const method = event?.method || 'unknown'
    
    // Log structured error for Cloudwatch/Loki/Datadog
    console.error(JSON.stringify({
      level: 'error',
      timestamp,
      message: error.message,
      stack: error.stack,
      context: { path, method, user: (event as any)?.context?.user?.id }
    }))

    // TODO: Send to Sentry if DNS is provided
    // Sentry.captureException(error)
  })

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
