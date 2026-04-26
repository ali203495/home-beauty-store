// GET /api/admin/orders
import { db } from '../../utils/db'
import { orders } from '../../database/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (session.user?.role !== 'admin') {
     throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: {
       items: {
          with: {
             product: true
          }
       }
    }
  })
})
