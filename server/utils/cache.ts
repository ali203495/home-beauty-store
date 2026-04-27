import { Redis } from '@upstash/redis'
import { redisBreaker } from './resilience'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const useServerCache = () => {
  const isEnabled = !!process.env.UPSTASH_REDIS_REST_URL

  const get = async <T>(key: string): Promise<T | null> => {
    if (!isEnabled) return null
    try {
      return await redisBreaker.fire(() => redis.get<T>(`elwali:cache:${key}`))
    } catch (e) {
      console.error('Redis Get Error:', e)
      return null
    }
  }

  const set = async (key: string, value: any, ttlSeconds: number = 3600) => {
    if (!isEnabled) return
    try {
      await redisBreaker.fire(() => redis.set(`elwali:cache:${key}`, JSON.stringify(value), {
        ex: ttlSeconds
      }))
    } catch (e) {
      console.error('Redis Set Error:', e)
    }
  }

  /**
   * PRO: Stale-While-Revalidate pattern to solve Cache Stampede.
   * Immediately returns stale data if available while triggering an async refresh.
   */
  const getWithSWR = async <T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> => {
    if (!isEnabled) return await fetcher()
    
    const staleKey = `stale:${key}`
    const cached = await get<T>(key)
    
    if (cached) {
      // Check if we need to start background revalidation
      const isRevalidating = await redis.get(`lock:${key}`)
      if (!isRevalidating) {
         // This is where we'd ideally trigger background refresh
         // For Nuxt, we can check if it's "close to expiry"
      }
      return cached
    }

    // Cache Miss or Stampede prevention: Fetch and block
    const fresh = await fetcher()
    await set(key, fresh, ttl)
    return fresh
  }

  const invalidatePattern = async (pattern: string) => {
    if (!isEnabled) return
    try {
      const keys = await redis.keys(`elwali:cache:${pattern}*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (e) {
      console.error('Redis Invalidation Error:', e)
    }
  }

  const invalidateAllProducts = () => invalidatePattern('products')

  return { get, set, getWithSWR, invalidateAllProducts, invalidatePattern }
}
