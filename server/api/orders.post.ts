import { OrderSchema } from '../utils/validation'
import { emitEvent } from '../utils/bus'
import { db } from '../utils/db'
import { orders } from '../database/schema'
import { eq } from 'drizzle-orm'
import { metrics } from '../utils/metrics'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const session = await getUserSession(event)
  
  const result = OrderSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation Failed', data: result.error.errors })
  }

  const orderData = result.data

  // High-scale protection: We rely on the established Edge rate-limiting 
  // and Postgres performance rather than complex persistent queues.

    // 2. STABILITY: DB-First Transactional Logic
    // We do NOT use complex queues. We write to PG immediately.
    try {
      const [newOrder] = await db.insert(orders).values({
        userId: session.user?.id || null,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: orderData.shippingAddress,
        totalAmount: String(orderData.totalAmount),
        checkoutId: orderData.checkoutId,
        status: 'pending',
        metadata: JSON.stringify(orderData)
      }).onConflictDoNothing().returning()

      if (!newOrder) {
        // Idempotency: Return existing order status if duplicate checkout_id detected
        const existing = await db.query.orders.findFirst({ where: eq(orders.checkoutId, orderData.checkoutId) })
        return { success: true, status: existing?.status || 'completed', checkoutId: orderData.checkoutId }
      }

      // 3. RECOVERY ASSURANCE: Update to queued. 
      // The worker/cron job will pick this up.
      await db.update(orders).set({ status: 'queued' }).where(eq(orders.id, newOrder.id))

      return { 
        success: true, 
        status: 'queued', 
        checkoutId: orderData.checkoutId 
      }

    } catch (error: any) {
      console.error('💥 [Critical] Order Database Failure:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Internal Store Error. Order not placed.' })
    }
})


