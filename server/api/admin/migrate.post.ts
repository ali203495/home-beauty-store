import { migrate } from 'drizzle-orm/neon-http/migrator'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  // 1. Critical Security Guard
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'x-migration-key')
  
  if (!authHeader || authHeader !== config.sessionPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized Migration Attempt'
    })
  }

  console.log('🚀 [Migration API] Starting production migration...')
  
  try {
    await migrate(db, { 
      migrationsFolder: './server/database/migrations' 
    })
    
    return {
      status: 'success',
      message: 'Database schema synchronized successfully',
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('❌ [Migration API] Failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Migration Failed: ${error.message}`
    })
  }
})
