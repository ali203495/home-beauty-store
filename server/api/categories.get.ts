// server/api/categories.get.ts
import { db } from '../utils/db'
import { categories } from '../database/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.name)]
  })
})
