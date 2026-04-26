import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../database/schema'

// Required for some local environments to handle fetch correctly
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is missing! Check your .env file.')
}

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

