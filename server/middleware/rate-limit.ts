import { defineEventHandler, createError, getRequestIP } from 'h3'

// In-memory store for rate limiting (For production, use Redis/Upstash)
const rateLimitStore = new Map<string, { count: number, resetAt: number }>()

const LIMIT = 50 // requests
const WINDOW = 60 * 1000 // 1 minute

export default defineEventHandler(async (event) => {
  const path = event.path
  
  // Only target sensitive routes
  if (path.startsWith('/api/auth') || path.startsWith('/api/tracking') || path.startsWith('/api/orders')) {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
    const key = `${ip}:${path}`
    const now = Date.now()
    
    const record = rateLimitStore.get(key)
    
    if (record && now < record.resetAt) {
      if (record.count >= LIMIT) {
        throw createError({
          statusCode: 429,
          statusMessage: 'Bzeff d ttalabat (Too many requests). Please wait a minute.'
        })
      }
      record.count++
    } else {
      rateLimitStore.set(key, { count: 1, resetAt: now + WINDOW })
    }
  }
})
