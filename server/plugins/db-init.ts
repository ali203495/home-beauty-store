import { db } from '../utils/db'
import { sql } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/neon-http/migrator'

/**
 * 🛠️ AUTONOMOUS DATABASE INITIALIZER
 * Ensures that the production database is always synchronized 
 * without requiring manual migration commands.
 */
export default defineNitroPlugin(async () => {
  if (process.env.NODE_ENV !== 'production') return

  console.log('🚀 [DB-Init] Checking database health...')
  
  try {
    // 1. Check if the 'products' table exists
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      );
    `)

    const exists = result[0]?.exists
    
    if (!exists) {
      console.warn('⚠️ [DB-Init] Tables missing. Triggering autonomous migration...')
      
      // 2. Perform Migration
      // This assumes your migrations are bundled in the .output (standard for Nuxt)
      // For Neon HTTP, we use the local migrate utility
      await runProductionMigration()
      
      console.log('✅ [DB-Init] Migration completed successfully.')
    } else {
      console.log('✅ [DB-Init] Database is healthy and synchronized.')
    }
  } catch (error: any) {
    console.error('💥 [DB-Init] Critical Startup Failure:', error.message)
    // We do NOT throw here to avoid killing the whole serverless instance
  }
})

async function runProductionMigration() {
  // We re-use logic from our migration utility but ensure it works in-process
  try {
    const { migrate } = await import('drizzle-orm/neon-http/migrator')
    // Path to migrations in the Nuxt output
    await migrate(db, { migrationsFolder: './server/database/migrations' })
  } catch (e: any) {
     console.error('❌ Migration failed:', e.message)
  }
}
