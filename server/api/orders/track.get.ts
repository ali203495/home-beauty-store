import { db } from '../../utils/db'
import { orders } from '../../database/schema'
import { eq, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event)
  if (!id) throw createError({ statusCode: 400, message: 'ID requis' })

  // 1. Search by ID or Phone (Safety: Don't reveal customer names)
  const order = await db.query.orders.findFirst({
    where: (o, { eq, or }) => or(
      eq(o.id, Number(id) || 0),
      eq(o.customerPhone, String(id))
    ),
    columns: {
       id: true,
       status: true,
       createdAt: true,
       updatedAt: true
    }
  })

  if (!order) {
    return { success: false }
  }

  return { 
    success: true, 
    order 
  }
})
