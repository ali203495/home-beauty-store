// server/api/admin/products/index.get.ts
import { db } from '../../../../utils/db'
import { products } from '../../../../database/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { loggedIn, user } = await getUserSession(event)
  if (!loggedIn || user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
  }
  return await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: { category: true, brand: true }
  })
})
