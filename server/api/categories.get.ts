import { db } from '../utils/db'
import { categories } from '../database/schema'
import { asc, isNull, isNotNull, and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { parentId, rootOnly } = query

  let whereClause = undefined

  if (rootOnly === 'true') {
    whereClause = isNull(categories.parentId)
  } else if (parentId) {
    whereClause = eq(categories.parentId, Number(parentId))
  }

  return await db.query.categories.findMany({
    where: whereClause,
    orderBy: [asc(categories.sortOrder), asc(categories.name)]
  })
})
