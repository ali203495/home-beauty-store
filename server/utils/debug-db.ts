import 'dotenv/config'
import { db } from './db'
import { sql } from 'drizzle-orm'

async function debug() {
  try {
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    console.log('Tables:', tables.rows)

    for (const table of tables.rows) {
      const tableName = (table as any).table_name
      const cols = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
      `)
      console.log(`Table ${tableName}:`, cols.rows)
    }
    process.exit(0)
  } catch (e) {
    console.error('Debug failed:', e)
    process.exit(1)
  }
}

debug()
