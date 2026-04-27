import { db } from '../../../utils/db'
import { categories } from '../../../database/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { loggedIn, user } = await getUserSession(event)
  if (!loggedIn || user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }

  return await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.name)]
  })
})
