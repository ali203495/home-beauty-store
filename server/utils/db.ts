import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../database/schema'

/**
 * 🏛️ ZERO-BOOT DATABASE ENGINE
 * Uses a Proxy to ensure zero activity during serverless bootstrap.
 */
let _db: any = null

const initDb = () => {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')
  const sql = neon(url)
  _db = drizzle(sql, { schema })
  return _db
}

// 🛡️ The Resilience Proxy
export const db = new Proxy({} as any, {
  get(_, prop) {
    return (initDb() as any)[prop]
  }
})

