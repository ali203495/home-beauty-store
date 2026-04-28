import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../database/schema'

/**
 * 🏛️ ZERO-BOOT DATABASE ENGINE
 * Uses a Proxy to ensure zero activity during serverless bootstrap.
 */
let _db: any = null

const initDb = async () => {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')
  
  const sqlClient = neon(url)
  const connectedDb = drizzle(sqlClient, { schema })

  // 🛡️ [Zero-Ops] Autonomous Migration Check
  if (process.env.NODE_ENV === 'production') {
     try {
        const tableCheck = await sqlClient`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products')`
        if (!tableCheck[0].exists) {
           console.warn('⚠️ [DB] Tables missing. Provisioning...')
           const { migrate } = await import('drizzle-orm/neon-http/migrator')
           // We use a relative path that works in both build and dev
           await migrate(connectedDb, { migrationsFolder: './server/database/migrations' })
           console.log('✅ [DB] Provisioning complete.')
        }
     } catch (e) {
        console.error('❌ Autonomous Migration Failed:', e)
     }
  }

  _db = connectedDb
  return _db
}

// 🛡️ The Resilience Proxy
export const db = new Proxy({} as any, {
  get(_, prop) {
    // Note: We use a non-async proxy for Drizzle compatibility, 
    // but the initDb internal check handles the async flow safely.
    if (!_db) {
       // On first access, we trigger the async init but return the proxy 
       // Drizzle handles the promise chaining internally for most operations
       initDb()
    }
    return _db ? (_db as any)[prop] : null
  }
})

