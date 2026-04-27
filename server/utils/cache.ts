import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const useServerCache = () => {
  const isEnabled = !!process.env.UPSTASH_REDIS_REST_URL

  const get = async <T>(key: string): Promise<T | null> => {
    if (!isEnabled) return null
    try {
      return await redis.get<T>(`elwali:cache:${key}`)
    } catch (e) {
      console.error('Redis Get Error:', e)
      return null
    }
  }

  const set = async (key: string, value: any, ttlSeconds: number = 3600) => {
    if (!isEnabled) return
    try {
      await redis.set(`elwali:cache:${key}`, JSON.stringify(value), {
        ex: ttlSeconds
      })
    } catch (e) {
      console.error('Redis Set Error:', e)
    }
  }

  const invalidate = async (key: string) => {
    if (!isEnabled) return
    try {
      await redis.del(`elwali:cache:${key}`)
    } catch (e) {
      console.error('Redis Del Error:', e)
    }
  }

  const invalidatePattern = async (pattern: string) => {
     if (!isEnabled) return
     // Scanning and deleting by pattern
     // Note: In serverless, it's better to use specific keys for performance
  }

  return { get, set, invalidate }
}
