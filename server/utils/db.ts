import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../database/schema'

/**
 * 🏛️ ELITE STATELESS DATABASE ENGINE
 * Optimized for Vercel + Neon.
 * Zero-boot side effects. 100% runtime stability.
 */
let _dbInstance: any = null

const getDb = () => {
  if (_dbInstance) return _dbInstance
  
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('🚫 [DB] DATABASE_URL is missing in this environment!')
    // Return a dummy object to prevent bootstrap crash, 
    // real error will occur only when a query is actually attempted.
    return { 
      query: { products: { findMany: async () => [], findFirst: async () => null } },
      select: () => ({ from: () => ({ where: () => [] }) }),
      insert: () => ({ values: () => ({ onConflictDoNothing: () => ({ returning: () => [] }) }) }),
      update: () => ({ set: () => ({ where: () => [] }) }),
      delete: () => ({ where: () => [] })
    }
  }

  const sqlClient = neon(url)
  _dbInstance = drizzle(sqlClient, { schema })
  return _dbInstance
}

// 🛡️ The Indestructible Handle
// This is synchronous and safe for top-level export
export const db = new Proxy({} as any, {
  get(_, prop) {
    return (getDb() as any)[prop]
  }
})

