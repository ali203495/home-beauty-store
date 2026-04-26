// server/api/brands.get.ts
import { db } from '../utils/db'
import { brands } from '../database/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return await db.query.brands.findMany({
    orderBy: [asc(brands.name)]
  })
})
