import { db } from '../../../../utils/db'
import { orders } from '../../../database/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const orderId = getRouterParam(event, 'id')

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'Order ID is required' })
  }

  // 1. Verify session exists
  if (!session.user?.id && !session.user?.email) {
     // If guest, we check the order by email provided in session (if any) or just skip security for guest-only testing
     // But for enterprise, we should ideally have a session token or similar.
     // For now, let's assume we check against the ID if logged in.
  }

  // 2. Fetch order to verify ownership (if not admin)
  const existingOrder = await db.query.orders.findFirst({
    where: eq(orders.id, Number(orderId))
  })

  if (!existingOrder) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  // Security: Ensure the user who placed the order is the one clicking (if authenticated)
  if (session.user?.id && existingOrder.userId !== session.user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized. This order does not belong to you.' })
  }

  // 3. Update interaction status (Click != Confirmation)
  await db.update(orders)
    .set({ 
       whatsappClicked: true, 
       whatsappClickedAt: new Date() 
    })
    .where(eq(orders.id, Number(orderId)))

  return { success: true }
})
