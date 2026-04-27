import { db } from '../../../utils/db'
import { orders } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Order ID is required' })
  }

  await db.update(orders)
    .set({ 
      whatsappConfirmed: true, 
      whatsappConfirmedAt: new Date() 
    })
    .where(eq(orders.id, Number(id)))

  return { success: true }
})
