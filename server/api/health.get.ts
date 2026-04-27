import { db } from '../utils/db'
import { sql } from 'drizzle-orm'
import Redis from 'ioredis'

export default defineEventHandler(async (event) => {
  const status = {
    database: 'down',
    redis: 'down',
    timestamp: new Date().toISOString()
  }

  // 1. Check DB
  try {
    await db.execute(sql`SELECT 1`)
    status.database = 'up'
  } catch (e) {}

  // 2. Check Redis
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
       connectTimeout: 2000,
       lazyConnect: true
    })
    await redis.connect()
    status.redis = 'up'
    redis.disconnect()
  } catch (e) {}

  const isHealthy = status.database === 'up' && status.redis === 'up'

  if (!isHealthy) {
    setResponseStatus(event, 503)
  }

  return status
})
