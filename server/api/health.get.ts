import { db } from '../utils/db'
import { sql } from 'drizzle-orm'

/**
 * 🏥 SYSTEM HEALTH PROBE
 * Diagnoses production 500 errors by testing connectivity to 
 * all critical infrastructure components.
 */
export default defineEventHandler(async (event) => {
  const status: any = {
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    services: {
      database: 'unknown',
      redis: 'unknown',
      search: 'unknown'
    }
  }

  // 1. Check Postgres (Neon)
  try {
    await db.execute(sql`SELECT 1`)
    status.services.database = 'healthy (connected)'
  } catch (e: any) {
    status.services.database = `unhealthy: ${e.message}`
    status.critical_error = true
  }

  // 2. Check Redis (Upstash)
  try {
     const cache = useServerCache()
     await cache.set('health-check', 'ok', 10)
     status.services.redis = 'healthy (connected)'
  } catch (e: any) {
     status.services.redis = `unhealthy: ${e.message}`
     status.critical_error = true
  }

  // Set response code
  setResponseStatus(event, status.critical_error ? 500 : 200)

  return status
})
