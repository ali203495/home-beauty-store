import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

let _ratelimit: Ratelimit | null = null

const getRatelimit = () => {
  if (_ratelimit) return _ratelimit
  
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  
  if (!url || !token) {
    console.warn('🛡️ [Rate Limit] Keys missing. Bypassing protection.')
    return null
  }
  
  const redis = new Redis({ url, token })

  _ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
    prefix: "@elwali/ratelimit",
  })
  
  return _ratelimit
}

export default defineEventHandler(async (event) => {
  const path = event.path
  
  // High-value targets: Auth, Tracking, Orders
  if (path.startsWith('/api/auth') || path.startsWith('/api/tracking') || path.startsWith('/api/orders')) {
    try {
      const limiter = getRatelimit()
      if (!limiter) return // Skip if misconfigured

      const ip = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
      const { success, limit, reset, remaining } = await limiter.limit(ip)

      if (!success) {
        setHeader(event, 'X-RateLimit-Limit', limit.toString())
        setHeader(event, 'X-RateLimit-Remaining', remaining.toString())
        setHeader(event, 'X-RateLimit-Reset', reset.toString())

        throw createError({
          statusCode: 429,
          statusMessage: 'Bzeff d ttalabat (Too many requests). Please slow down.'
        })
      }
    } catch (e: any) {
      if (e.statusCode === 429) throw e
      
      // FAIL-OPEN: Don't let a Redis timeout kill a potential sale.
      console.error('🛡️ [Rate Limit] Service Unavailable:', e.message)
    }
  }
})
