import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

/**
 * ARCHITECT NOTE: High-Concurrency Global Rate Limiter
 * Uses Upstash Redis (HTTP) to coordinate rate limits across multiple Vercel Lambda instances.
 * Stateless, Edge-Ready, No Memory Leaks.
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "@elwali/ratelimit",
})

export default defineEventHandler(async (event) => {
  const path = event.path
  
  // High-value targets: Auth, Tracking, Orders
  if (path.startsWith('/api/auth') || path.startsWith('/api/tracking') || path.startsWith('/api/orders')) {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
      setHeader(event, 'X-RateLimit-Limit', limit.toString())
      setHeader(event, 'X-RateLimit-Remaining', remaining.toString())
      setHeader(event, 'X-RateLimit-Reset', reset.toString())

      throw createError({
        statusCode: 429,
        statusMessage: 'Bzeff d ttalabat (Too many requests). Please slow down.'
      })
    }
  }
})
