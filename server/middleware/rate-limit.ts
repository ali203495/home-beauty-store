export default defineEventHandler(async (event) => {
  const path = event.path
  
  // 1. High-value targets: Auth, Tracking, Orders
  if (path.startsWith('/api/auth') || path.startsWith('/api/tracking') || path.startsWith('/api/orders')) {
    try {
      // 🛡️ [Lazy-Load] Only import high-overhead libs when actually needed
      const [ { Ratelimit }, { Redis } ] = await Promise.all([
        import("@upstash/ratelimit"),
        import("@upstash/redis")
      ])

      const url = process.env.UPSTASH_REDIS_REST_URL
      const token = process.env.UPSTASH_REDIS_REST_TOKEN
      
      if (!url || !token) return

      const redis = new Redis({ url, token })
      const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "@elwali/ratelimit",
      })

      const ip = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
      const { success, limit, reset, remaining } = await limiter.limit(ip)

      if (!success) {
        setHeader(event, 'X-RateLimit-Limit', limit.toString())
        setHeader(event, 'X-RateLimit-Remaining', remaining.toString())
        setHeader(event, 'X-RateLimit-Reset', reset.toString())

        throw createError({
          statusCode: 429,
          statusMessage: 'Slow down. Try again in a minute.'
        })
      }
    } catch (e: any) {
      if (e.statusCode === 429) throw e
      console.error('🛡️ [Rate Limit] Service Unavailable:', e.message)
    }
  }
})
