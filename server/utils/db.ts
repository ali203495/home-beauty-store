import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../database/schema'

/**
 * 🏛️ ELITE STATELESS DATABASE ENGINE
 * Optimized for Vercel + Neon.
 * Zero-boot side effects. 100% runtime stability.
 */
const url = process.env.DATABASE_URL
if (!url && process.env.NODE_ENV === 'production') {
  console.error('💥 [CRITICAL] DATABASE_URL is missing!')
}

// Neon() and drizzle() are natively lazy. 
// They do NOT connect until the first query is actually awaited.
const sqlClient = neon(url || '')
export const db = drizzle(sqlClient, { schema })

