// server/api/admin/brands/index.get.ts
import { db } from '../../../utils/db'
import { brands } from '../../../database/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { loggedIn, user } = await getUserSession(event)
  if (!loggedIn || user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }
  return await db.query.brands.findMany({ orderBy: [asc(brands.name)] })
})
